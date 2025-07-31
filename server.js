const express = require('express');
const { ExpressPeerServer } = require('peer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ Allow CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'PeerJS Server is running!', 
    timestamp: new Date().toISOString(),
    port: PORT 
  });
});

// ✅ Start server
const server = app.listen(PORT, () => {
  console.log(`✅ PeerJS server running on port ${PORT}`);
});

// ✅ PeerJS server
const peerServer = ExpressPeerServer(server, {
  debug: true,
  allow_discovery: true,
  path: '/',         // ✅ IMPORTANT → keeps WS URL clean (…/peerjs)
  proxied: true,
  pingInterval: 25000
});

// ✅ Mount at /peerjs
app.use('/peerjs', peerServer);

// ✅ WS upgrade handler
server.on('upgrade', (req, socket, head) => {
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
