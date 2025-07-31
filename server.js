const express = require('express');
const { ExpressPeerServer } = require('peer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

// 🚀 Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`✅ PeerJS Server running on port ${PORT}`);
});

// ✅ Only mount ONCE — avoids /peerjs/peerjs bug
const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/peerjs',   // The endpoint PeerJS will use
  allow_discovery: true
});

app.use('/', peerServer); // ✅ Mount at root

// Optional healthcheck
app.get('/', (req, res) => {
  res.send({ status: 'PeerJS server is live' });
});
