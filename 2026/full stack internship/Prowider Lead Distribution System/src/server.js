const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const prisma = require('./db');
const leadService = require('./services/leadService');
const webhookService = require('./services/webhookService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Active SSE client connections
let sseClients = [];

/**
 * Broadcast event to all connected dashboard clients
 */
function broadcastSSE(eventType, data) {
  const formattedData = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(formattedData);
    } catch (err) {
      console.error('Error writing to SSE client:', err.message);
    }
  });
}

// Listen to service events and broadcast to SSE subscribers
leadService.on('leadAssigned', (data) => {
  broadcastSSE('leadAssigned', data);
});

webhookService.on('quotasReset', (data) => {
  broadcastSSE('quotasReset', data);
});

/**
 * API: Submit a new Lead
 */
app.post('/api/leads', async (req, res) => {
  const { name, phone, city, serviceType, description } = req.body;

  // Validation
  if (!name || !phone || !city || !serviceType || !description) {
    return res.status(400).json({
      error: 'Missing required fields. Please fill out name, phone, city, serviceType, and description.'
    });
  }

  try {
    const result = await leadService.createAndAssignLead({
      name,
      phone,
      city,
      serviceType,
      description
    });
    
    return res.status(201).json(result);
  } catch (err) {
    console.error('Lead Submission Error:', err.message);
    
    if (err.code === 'DUPLICATE_LEAD') {
      return res.status(409).json({ error: err.message });
    }
    
    return res.status(500).json({ error: 'Internal server error while processing the lead assignment.' });
  }
});

/**
 * API: Get Provider Dashboard Information
 */
app.get('/api/providers', async (req, res) => {
  try {
    const dashboardData = await leadService.getProvidersDashboard();
    return res.json(dashboardData);
  } catch (err) {
    console.error('Error fetching dashboard:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve provider dashboard data.' });
  }
});

/**
 * API: Webhook to Reset Quotas (Idempotent)
 */
app.post('/api/webhook/reset-quota', async (req, res) => {
  const { eventId } = req.body;

  if (!eventId) {
    return res.status(400).json({ error: 'Missing unique eventId in request body.' });
  }

  try {
    const result = await webhookService.resetProviderQuotas(eventId);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Webhook Reset Error:', err.message);
    return res.status(500).json({ error: 'Failed to process webhook event.' });
  }
});

/**
 * Endpoint: Server-Sent Events subscription for Dashboard updates
 */
app.get('/api/updates', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering on reverse proxies like Nginx
  
  // Send initial ping to establish connection
  res.write('comment: connection established\n\n');
  
  sseClients.push(res);
  console.log(`SSE Client connected. Total active: ${sseClients.length}`);

  req.on('close', () => {
    sseClients = sseClients.filter((client) => client !== res);
    console.log(`SSE Client disconnected. Total active: ${sseClients.length}`);
  });
});

// Fallback to index.html for any SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start listening
app.listen(PORT, () => {
  console.log(`Prowider CRM Server running on port ${PORT}`);
});
