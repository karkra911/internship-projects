/**
 * Concurrency & Idempotency Test Runner
 * 
 * This script programmatically triggers concurrent requests against a running
 * instance of the CRM server (http://localhost:3000) to verify:
 * 
 * 1. Duplicate Lead Prevention (Database uniqueness validation)
 * 2. Concurrency Safety & Quota Bounds (Simultaneous leads processing)
 * 3. Webhook Idempotency (Concurrent event triggers)
 * 
 * To run:
 *   node src/tests/concurrencyTest.js
 */

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Starting CRM Backend Concurrency & Safety Tests...');
  console.log('====================================================\n');

  try {
    // Check if server is running
    const healthCheck = await fetch(`${BASE_URL}/api/providers`).catch(() => null);
    if (!healthCheck) {
      console.error('❌ Error: The server is not running on http://localhost:3000.');
      console.error('Please run "npm run start" or start the server before executing this script.\n');
      process.exit(1);
    }

    await testDuplicateLeadPrevention();
    console.log('\n----------------------------------------------------\n');
    await testWebhookIdempotency();
    console.log('\n----------------------------------------------------\n');
    await testConcurrentLeadDistribution();
    
    console.log('\n====================================================');
    console.log('🎉 All test simulations completed!');
    console.log('====================================================');

  } catch (error) {
    console.error('Test Execution Failed:', error);
    process.exit(1);
  }
}

/**
 * Test 1: Duplicate Lead Prevention
 * Fires 2 identical lead submissions concurrently.
 * One must succeed, one must fail with 409.
 */
async function testDuplicateLeadPrevention() {
  console.log('🔄 Test 1: Testing Duplicate Lead Prevention...');
  
  const dupPhone = `555-DUP-${Math.floor(Math.random() * 900000 + 100000)}`;
  const dupLead = {
    name: 'Duplicate Test Account',
    phone: dupPhone,
    city: 'San Francisco, CA',
    serviceType: 'Service 1',
    description: 'Testing duplicate unique key constraint'
  };

  console.log(`Sending 2 concurrent requests for: Phone = ${dupLead.phone}, Service = ${dupLead.serviceType}`);

  const requests = [
    fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dupLead)
    }),
    fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dupLead)
    })
  ];

  const responses = await Promise.all(requests);
  const dataList = await Promise.all(responses.map(res => res.json()));

  let successCount = 0;
  let conflictCount = 0;

  responses.forEach((res, i) => {
    if (res.status === 201) {
      successCount++;
      console.log(`   Request #${i + 1}: Success (201 Created)`);
    } else if (res.status === 409) {
      conflictCount++;
      console.log(`   Request #${i + 1}: Blocked (409 Conflict) - Msg: "${dataList[i].error}"`);
    } else {
      console.log(`   Request #${i + 1}: Unexpected Status (${res.status}) - Msg: "${dataList[i].error}"`);
    }
  });

  if (successCount === 1 && conflictCount === 1) {
    console.log('✅ PASS: Duplicate lead constraint successfully enforced at database level!');
  } else {
    console.log('❌ FAIL: Duplicate lead prevention failed. Did not get exactly one success and one conflict.');
  }
}

/**
 * Test 2: Webhook Idempotency
 * Fires 5 identical quota-reset webhooks concurrently.
 * Exactly one must update the DB ('processed') and the other 4 must bypass ('ignored').
 */
async function testWebhookIdempotency() {
  console.log('🔄 Test 2: Testing Webhook Idempotency...');
  
  const eventId = `webhook_test_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
  console.log(`Firing 5 concurrent requests with shared eventId: "${eventId}"`);

  const requests = Array.from({ length: 5 }).map(() => 
    fetch(`${BASE_URL}/api/webhook/reset-quota`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId })
    })
  );

  const responses = await Promise.all(requests);
  const dataList = await Promise.all(responses.map(res => res.json()));

  let processed = 0;
  let ignored = 0;

  dataList.forEach((data, i) => {
    if (data.status === 'processed') {
      processed++;
      console.log(`   Request #${i + 1}: PROCESSED quota reset`);
    } else if (data.status === 'ignored') {
      ignored++;
      console.log(`   Request #${i + 1}: IGNORED duplicate trigger`);
    } else {
      console.log(`   Request #${i + 1}: Unexpected response:`, data);
    }
  });

  console.log(`   Summary: Processed = ${processed}, Ignored = ${ignored}`);
  if (processed === 1 && ignored === 4) {
    console.log('✅ PASS: Webhook Idempotency successfully verified! ONLY execution occurred once.');
  } else {
    console.log('❌ FAIL: Webhook Idempotency failed. Processed counts are incorrect.');
  }
}

/**
 * Test 3: Concurrent Lead Distribution
 * Fires 10 distinct leads concurrently.
 * Checks server response, assignment counts, and logs results.
 */
async function testConcurrentLeadDistribution() {
  console.log('🔄 Test 3: Testing Concurrent Lead Distribution...');
  console.log('Firing 10 distinct leads concurrently...');

  const serviceTypes = ['Service 1', 'Service 2', 'Service 3'];
  const cities = ['Miami, FL', 'Dallas, TX', 'Phoenix, AZ', 'Boston, MA', 'Seattle, WA'];

  const requests = Array.from({ length: 10 }).map((_, i) => {
    const uniquePhone = `555-CON-${String(Math.floor(Math.random() * 900000 + 100000))}`;
    const lead = {
      name: `Concurrent Lead Runner ${i + 1}`,
      phone: uniquePhone,
      city: cities[i % cities.length],
      serviceType: serviceTypes[i % serviceTypes.length],
      description: `Testing concurrent server transaction boundaries. Lead #${i + 1}`
    };

    return fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    }).then(async res => ({
      status: res.status,
      data: await res.json(),
      phone: uniquePhone
    }));
  });

  const results = await Promise.all(requests);
  
  let successCount = 0;
  let failedCount = 0;

  results.forEach((res, i) => {
    if (res.status === 201) {
      successCount++;
      const assigned = res.data.assignedProviderNames.join(', ');
      console.log(`   Lead #${i + 1} (${res.data.lead.serviceType}): Success. Assigned to: [${assigned}]`);
    } else {
      failedCount++;
      console.log(`   Lead #${i + 1} Failed: status ${res.status} - "${res.data.error}"`);
    }
  });

  console.log(`   Summary: Successfully allocated ${successCount}/10 leads.`);
  if (failedCount > 0) {
    console.log(`   Notice: ${failedCount}/10 leads were skipped or failed (expected if provider quotas are full).`);
  }
  
  // Fetch and inspect final provider status
  const dashboardRes = await fetch(`${BASE_URL}/api/providers`);
  const providers = await dashboardRes.json();
  
  console.log('\n   Current Provider Quotas after test run:');
  let quotaViolation = false;
  providers.forEach(p => {
    console.log(`     - ${p.name}: Quota Used = ${p.quotaUsed}/${p.quotaLimit} (Remaining = ${p.quotaLimit - p.quotaUsed})`);
    if (p.quotaUsed > p.quotaLimit) {
      quotaViolation = true;
    }
  });

  if (!quotaViolation) {
    console.log('\n✅ PASS: Quotas strictly respected under concurrency! No provider exceeded quota limit of 10.');
  } else {
    console.log('\n❌ FAIL: Quota violation detected! A provider exceeded quota limit.');
  }
}

// Run the script
runTests();
