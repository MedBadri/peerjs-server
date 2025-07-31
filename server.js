const express = require('express');
const { ExpressPeerServer } = require('peerjs-server'); // ✅ UPDATED IMPORT
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

// ✅ Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'PeerJS Server is running', timestamp: new Date().toISOString() });
});

// ✅ Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`✅ PeerJS server running on port ${PORT}`);
});

// ✅ PeerJS server setup
const peerServer = ExpressPeerServer(server, {
  debug: true,
  allow_discovery: true,
  path: '/',          // keep path root, we mount under /peerjs
  proxied: true,
  pingInterval: 25000 // keep WebSocket alive
});

// ✅ Mount PeerJS at /peerjs
app.use('/peerjs', peerServer);

// ✅ Handle WebSocket upgrades
server.on('upgrade', (req, socket, head) => {
  peerServer.handleUpgrade(req, socket, head);
});

// ✅ Keep-alive tuning for Railway
server.keepAliveTimeout = 120000; // 2 minutes
server.headersTimeout = 125000;   // slightly longer

setInterval(() => {
  console.log('💓 Server heartbeat to keep WS alive');
}, 20000); // every 20s

// ✅ Debug logs for PeerJS
peerServer.on('connection', (client) => {
  console.log(`🔗 Peer connected: ${client.getId()}`);
});
peerServer.on('disconnect', (client) => {
  console.log(`❌ Peer disconnected: ${client.getId()}`);
});

console.log('🎯 PeerJS server mounted at /peerjs');
