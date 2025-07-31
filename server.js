const express = require('express');
const { ExpressPeerServer } = require('peer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

app.get('/', (req, res) => {
  res.json({ status: 'PeerJS Server is running', timestamp: new Date().toISOString() });
});

const server = app.listen(PORT, () => {
  console.log(`✅ PeerJS server running on port ${PORT}`);
});

const peerServer = ExpressPeerServer(server, {
  debug: true,
  allow_discovery: true,
  proxied: true,
  pingInterval: 25000,
  path: '/peerjs'   // ✅ CHANGE HERE
});

app.use('/peerjs', peerServer);


server.on('upgrade', (req, socket, head) => {
  peerServer.handleUpgrade(req, socket, head);
});

server.keepAliveTimeout = 120000;
server.headersTimeout = 125000;

setInterval(() => {
  console.log('💓 Server heartbeat to keep WS alive');
}, 20000);

peerServer.on('connection', (client) => {
  console.log(`🔗 Peer connected: ${client.getId()}`);
});
peerServer.on('disconnect', (client) => {
  console.log(`❌ Peer disconnected: ${client.getId()}`);
});

console.log('🎯 PeerJS server mounted at /peerjs');
