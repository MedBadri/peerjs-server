const express = require('express');
const { ExpressPeerServer } = require('peer');
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
  path: '/',
  proxied: true,
  pingInterval: 25000
});

// ✅ Mount PeerJS at /peerjs
app.use('/peerjs', peerServer);

// ✅ Handle WebSocket upgrades
server.on('upgrade', (req, socket, head) => {
  peerServer.handleUpgrade(req, socket, head);
});

// ✅ 🔥 Add keep-alive headers to all responses
server.keepAliveTimeout = 120000; // 2 minutes
server.headersTimeout = 125000;   // slightly longer than keepAlive

// ✅ 🔥 Send periodic “heartbeat” so Railway doesn’t kill container
setInterval(() => {
  console.log('💓 Server heartbeat to keep WS alive');
}, 20000); // every 20 seconds

// ✅ Debug logs for PeerJS
peerServer.on('connection', (client) => {
  console.log(`🔗 Peer connected: ${client.getId()}`);
});
peerServer.on('disconnect', (client) => {
  console.log(`❌ Peer disconnected: ${client.getId()}`);
});

console.log('🎯 PeerJS server mounted at /peerjs');
