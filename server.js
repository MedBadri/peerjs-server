const { PeerServer } = require('peer');
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 9000;

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Create PeerJS server
const peerServer = PeerServer({
  port: port,
  path: '/peer',
  corsOptions: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  // Allow all connections
  allow_discovery: true,
  // Log connections
  debug: process.env.NODE_ENV !== 'production'
});

// Log when peers connect/disconnect
peerServer.on('connection', (client) => {
  console.log(`🔗 Peer connected: ${client.getId()}`);
});

peerServer.on('disconnect', (client) => {
  console.log(`❌ Peer disconnected: ${client.getId()}`);
});

console.log(`🚀 PeerJS Server running on port ${port}`);
console.log(`📡 PeerJS path: /peer`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);