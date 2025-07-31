const express = require('express');
const { ExpressPeerServer } = require('peer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ Allow CORS
app.use(cors());

// ✅ Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'PeerJS Server is running', timestamp: new Date().toISOString() });
});

// ✅ Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`✅ PeerJS server running on port ${PORT}`);
});

// ✅ IMPORTANT: Set path to "/" so it mounts only once
const peerServer = ExpressPeerServer(server, {
  debug: true,
  allow_discovery: true,
  path: '/',         // ✅ not '/peerjs' to avoid double path
  proxied: true,
  pingInterval: 25000
});

// ✅ Mount PeerJS server at /peerjs
app.use('/peerjs', peerServer);

// ✅ Handle WebSocket upgrades
server.on('upgrade', (req, socket, head) => {
  peerServer.handleUpgrade(req, socket, head);
});

// ✅ Logs
peerServer.on('connection', (client) => {
  console.log(`🔗 Peer connected: ${client.getId()}`);
});
peerServer.on('disconnect', (client) => {
  console.log(`❌ Peer disconnected: ${client.getId()}`);
});

console.log('🎯 PeerJS server mounted at /peerjs');
