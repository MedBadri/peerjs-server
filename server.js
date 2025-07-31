const express = require('express');
const { ExpressPeerServer } = require('peer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'PeerJS Server is running!', 
    timestamp: new Date().toISOString(),
    port: PORT 
  });
});

// Create HTTP server
const server = app.listen(PORT, () => {
  console.log(`✅ PeerJS server running on port ${PORT}`);
});

// Create PeerJS server
const peerServer = ExpressPeerServer(server, {
  debug: true,
  allow_discovery: true,
  path: '/'
});

// Mount PeerJS server at /peerjs
app.use('/peerjs', peerServer);

// ✅ FIX for WebSockets on Railway
server.on("upgrade", (req, socket, head) => {
  peerServer.handleUpgrade(req, socket, head);
});

// Log when peers connect/disconnect
peerServer.on('connection', (client) => {
  console.log(`🔗 Peer connected: ${client.getId()}`);
});

peerServer.on('disconnect', (client) => {
  console.log(`❌ Peer disconnected: ${client.getId()}`);
});

console.log('🎯 PeerJS server mounted at /peerjs');
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);