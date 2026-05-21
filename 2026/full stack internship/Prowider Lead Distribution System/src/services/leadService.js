const prisma = require('../db');
const { EventEmitter } = require('events');

class LeadService extends EventEmitter {
  constructor() {
    super();
    
    // Service Configuration
    this.RULES = {
      'Service 1': {
        mandatory: [1],
        pool: [2, 3, 4],
        poolName: 'POOL_1'
      },
      'Service 2': {
        mandatory: [5],
        pool: [6, 7, 8],
        poolName: 'POOL_2'
      },
      'Service 3': {
        mandatory: [1, 4],
        pool: [2, 3, 5, 6, 7, 8],
        poolName: 'POOL_3'
      }
    };
  }

  /**
   * Submit and automatically distribute a lead.
   * Runs in a PostgreSQL transaction with FOR UPDATE row locks to prevent race conditions.
   */
  async createAndAssignLead({ name, phone, city, serviceType, description }) {
    if (!this.RULES[serviceType]) {
      throw new Error(`Invalid service type: ${serviceType}`);
    }

    const rule = this.RULES[serviceType];
    const { mandatory, pool, poolName } = rule;

    try {
      // Execute database operations in a transaction
      return await prisma.$transaction(async (tx) => {
        // 1. Check if lead already exists to prevent duplicate (phone + serviceType)
        const existingLead = await tx.lead.findUnique({
          where: {
            phone_serviceType: { phone, serviceType }
          }
        });
        
        if (existingLead) {
          const err = new Error('Duplicate lead detected: A lead with this phone number and service type already exists.');
          err.code = 'DUPLICATE_LEAD';
          throw err;
        }

        // 2. Lock all providers in sorted order to avoid deadlocks in concurrent transactions.
        // Selecting FOR UPDATE prevents concurrent transactions from modifying provider quotas.
        const allProviderIds = [1, 2, 3, 4, 5, 6, 7, 8];
        const providers = await tx.$queryRaw`
          SELECT * FROM "Provider" 
          WHERE "id" IN (1, 2, 3, 4, 5, 6, 7, 8) 
          ORDER BY "id" ASC 
          FOR UPDATE
        `;

        // Create a lookup map for provider records
        const providerMap = {};
        providers.forEach(p => {
          providerMap[p.id] = p;
        });

        // 3. Lock the RoundRobinState for this pool
        const rrStates = await tx.$queryRaw`
          SELECT * FROM "RoundRobinState" 
          WHERE "poolName" = ${poolName} 
          FOR UPDATE
        `;
        const rrState = rrStates[0];
        
        if (!rrState) {
          throw new Error(`RoundRobinState not found for pool: ${poolName}`);
        }

        // 4. Select mandatory providers with available quota
        const selectedProviders = [];
        
        for (const providerId of mandatory) {
          const provider = providerMap[providerId];
          if (provider && provider.quotaUsed < provider.quotaLimit) {
            selectedProviders.push(providerId);
          }
        }

        // 5. Fill remaining slots from the pool using fair round-robin
        let slotsNeeded = 3 - selectedProviders.length;
        let nextIndex = rrState.nextIndex;
        let lastPickedIdx = null;

        if (slotsNeeded > 0 && pool.length > 0) {
          // Scan the pool cyclically starting from nextIndex
          for (let i = 0; i < pool.length; i++) {
            const currentIdx = (nextIndex + i) % pool.length;
            const providerId = pool[currentIdx];

            // Prevent duplicate assignments
            if (selectedProviders.includes(providerId)) {
              continue;
            }

            const provider = providerMap[providerId];
            if (provider && provider.quotaUsed < provider.quotaLimit) {
              selectedProviders.push(providerId);
              lastPickedIdx = currentIdx;
              slotsNeeded--;
              
              if (slotsNeeded === 0) {
                break;
              }
            }
          }

          // 6. If we selected at least one pool provider, advance the round-robin index
          if (lastPickedIdx !== null) {
            const newNextIndex = (lastPickedIdx + 1) % pool.length;
            await tx.roundRobinState.update({
              where: { poolName },
              data: { nextIndex: newNextIndex }
            });
          }
        }

        // 7. Create the Lead record
        const lead = await tx.lead.create({
          data: { name, phone, city, serviceType, description }
        });

        // 8. Create Assignments and increment quotaUsed for selected providers
        const assignments = [];
        for (const providerId of selectedProviders) {
          // Create Assignment record
          const assignment = await tx.assignment.create({
            data: {
              leadId: lead.id,
              providerId: providerId
            }
          });
          assignments.push(assignment);

          // Update Provider Quota
          await tx.provider.update({
            where: { id: providerId },
            data: { quotaUsed: { increment: 1 } }
          });
        }

        // Prepare return details
        const assignedProviderNames = selectedProviders.map(id => providerMap[id].name);
        const result = {
          lead,
          assignedProviderIds: selectedProviders,
          assignedProviderNames,
          assignmentsCount: selectedProviders.length
        };

        // Trigger SSE update in next tick (after transaction commits successfully)
        process.nextTick(() => {
          this.emit('leadAssigned', result);
        });

        return result;
      });
    } catch (error) {
      // Prisma Unique constraint violation code is P2002
      if (error.code === 'P2002') {
        const err = new Error('Duplicate lead detected: A lead with this phone number and service type already exists.');
        err.code = 'DUPLICATE_LEAD';
        throw err;
      }
      throw error;
    }
  }

  /**
   * Retrieves all providers with their assignment lists and quota stats.
   */
  async getProvidersDashboard() {
    return await prisma.provider.findMany({
      include: {
        assignments: {
          include: {
            lead: true
          },
          orderBy: {
            assignedAt: 'desc'
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });
  }
}

module.exports = new LeadService();
