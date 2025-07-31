const express = require('express');
const { ExpressPeerServer } = require('peer');  // ✅ OFFICIAL PEER PACKAGE
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

// Health check
app.get('/', (req, res) => {
  res.json({ status: '✅ PeerJS Server is running', timestamp: new Date().toISOString() });
});

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`✅ PeerJS server running on port ${PORT}`);
});

// Setup PeerJS server
const peerServer = ExpressPeerServer(server, {
  debug: true,
  allow_discovery: true,
  path: '/'   // ✅ FIX so Lovable won’t double /peerjs/peerjs
});

// Mount PeerJS
app.use('/peerjs', peerServer);

// WebSocket upgrade
server.on('upgrade', (req, socket, head) => {
  peerServer.handleUpgrade(req, socket, head);
});

// Keep-alive tuning
server.keepAliveTimeout = 120000;
server.headersTimeout = 125000;

console.log('🎯 PeerJS server mounted at /peerjs');

// Debug logs
peerServer.on('connection', (client) => {
  console.log(`🔗 Peer connected: ${client.getId()}`);
});

peerServer.on('disconnect', (client) => {
  console.log(`❌ Peer disconnected: ${client.getId()}`);
});
