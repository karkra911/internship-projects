const prisma = require('../db');
const { EventEmitter } = require('events');

class WebhookService extends EventEmitter {
  /**
   * Resets all provider quotas to 10 (sets quotaUsed to 0).
   * Enforces idempotency via the WebhookEvent database table.
   * If the eventId already exists, it does nothing and returns successfully.
   */
  async resetProviderQuotas(eventId) {
    if (!eventId || typeof eventId !== 'string' || eventId.trim() === '') {
      throw new Error('Invalid or missing eventId in webhook payload.');
    }

    try {
      return await prisma.$transaction(async (tx) => {
        // 1. Check if the event was already processed (Idempotency check)
        const existingEvent = await tx.webhookEvent.findUnique({
          where: { eventId }
        });

        if (existingEvent) {
          return {
            success: true,
            status: 'ignored',
            message: `Webhook event '${eventId}' was already processed. No action taken.`
          };
        }

        // 2. Register the Webhook event to prevent concurrent or future duplicate executions
        await tx.webhookEvent.create({
          data: { eventId }
        });

        // 3. Reset all providers' quotaUsed to 0
        await tx.provider.updateMany({
          data: { quotaUsed: 0 }
        });

        const result = {
          success: true,
          status: 'processed',
          message: `Webhook event '${eventId}' processed successfully. All provider quotas reset to 10.`
        };

        // Trigger SSE update to refresh dashboard
        process.nextTick(() => {
          this.emit('quotasReset', result);
        });

        return result;
      });
    } catch (error) {
      // Catch duplicate key errors in case of concurrent requests passing the same eventId
      if (error.code === 'P2002') {
        return {
          success: true,
          status: 'ignored',
          message: `Webhook event '${eventId}' was processed by another transaction concurrently. No action taken.`
        };
      }
      throw error;
    }
  }
}

module.exports = new WebhookService();
