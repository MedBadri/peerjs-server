const express = require('express');
const { ExpressPeerServer } = require('peer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'PeerJS Server is running!', timestamp: new Date().toISOString(), port: PORT });
});

const server = app.listen(PORT, () => {
  console.log(`✅ PeerJS server running on port ${PORT}`);
});

const peerServer = ExpressPeerServer(server, {
  debug: true,
  allow_discovery: true,
  path: '/peerjs',        // ✅ Explicit correct path
  proxied: true,          // ✅ Important for Railway (WSS handling)
  pingInterval: 25000     // ✅ Heartbeat to keep WS alive
});

app.use('/peerjs', peerServer);

// ✅ WebSocket upgrade
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
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
