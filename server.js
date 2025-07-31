const express = require('express');
const { ExpressPeerServer } = require('peer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'PeerJS Server is running!', timestamp: new Date().toISOString(), port: PORT });
});

// ✅ Start server
const server = app.listen(PORT, () => {
  console.log(`✅ PeerJS server running on port ${PORT}`);
});

// ✅ Configure PeerJS with fixes
const peerServer = ExpressPeerServer(server, {
  debug: true,
  allow_discovery: true,
  path: '/peerjs',
  proxied: true,        // ✅ REQUIRED for Railway (handles WSS properly)
  pingInterval: 25000   // ✅ Keeps WS alive (25s heartbeat)
});

// ✅ Mount PeerJS
app.use('/peerjs', peerServer);

// ✅ Handle WS upgrades
server.on("upgrade", (req, socket, head) => {
  peerServer.handleUpgrade(req, socket, head);
});

// ✅ Debug logs
peerServer.on('connection', (client) => {
  console.log(`🔗 Peer connected: ${client.getId()}`);
});
peerServer.on('disconnect', (client) => {
  console.log(`❌ Peer disconnected: ${client.getId()}`);
});

console.log('🎯 PeerJS server mounted at /peerjs');
