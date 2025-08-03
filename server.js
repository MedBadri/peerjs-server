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

// Create PeerJS server with enhanced configuration
const peerServer = ExpressPeerServer(server, {
  debug: true,
  allow_discovery: true,
  path: '/',
  // Enhanced configuration for better connectivity
  concurrent_limit: 1000,
  proxied: true, // Important for Railway deployment
  // Add TURN servers for NAT traversal
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' },
      { urls: 'stun:stun.stunprotocol.org:3478' },
      // Add TURN servers for fallback (you may need to get your own TURN servers)
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ]
  }
});

// Mount PeerJS server at /peerjs
app.use('/peerjs', peerServer);

// ✅ FIX for WebSockets on Railway
server.on("upgrade", (req, socket, head) => {
  peerServer.handleUpgrade(req, socket, head);
});

// Enhanced logging for debugging
peerServer.on('connection', (client) => {
  console.log(`🔗 Peer connected: ${client.getId()}`);
  console.log(`🔗 Connection details:`, {
    id: client.getId(),
    token: client.getToken(),
    metadata: client.getMetadata()
  });
});

peerServer.on('disconnect', (client) => {
  console.log(`❌ Peer disconnected: ${client.getId()}`);
});

// Add error handling
peerServer.on('error', (error) => {
  console.error('❌ PeerJS server error:', error);
});

console.log('🎯 PeerJS server mounted at /peerjs');
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log('🎯 TURN servers configured for NAT traversal');
