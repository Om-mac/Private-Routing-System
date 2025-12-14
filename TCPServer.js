const net = require('net');

// Store connected users: { username: socket }
const users = {};

const server = net.createServer((socket) => {
  let username = null;
  const clientIP = socket.remoteAddress;
  const clientPort = socket.remotePort;

  console.log(`\n[Server] New connection from ${clientIP}:${clientPort}`);

  // Handle incoming data
  socket.on('data', (data) => {
    const message = data.toString('utf8').trim();
    console.log(`[${username || 'Unknown'}] Received: ${message}`);

    // Parse protocol: LOGIN:username or SEND:targetUser:message
    if (message.startsWith('LOGIN:')) {
      // Handle login
      username = message.substring(6);
      users[username] = socket;
      console.log(`[Server] ✅ User "${username}" logged in`);
      console.log(`[Server] Connected users: ${Object.keys(users).join(', ')}`);

      // Send confirmation
      socket.write(`STATUS:LOGIN_SUCCESS:${username}\n`);
    } else if (message.startsWith('SEND:')) {
      // Handle message send: SEND:targetUser:message
      const parts = message.substring(5).split(':');
      if (parts.length >= 2) {
        const targetUser = parts[0];
        const messageText = parts.slice(1).join(':');

        if (users[targetUser]) {
          // Relay message to target user
          const formattedMessage = `FROM:${username}:${messageText}`;
          users[targetUser].write(formattedMessage + '\n');
          console.log(`[Server] Message from "${username}" to "${targetUser}": ${messageText}`);
        } else {
          // User not found
          socket.write(`ERROR:User ${targetUser} not found\n`);
          console.log(`[Server] ❌ User "${targetUser}" not found`);
        }
      } else {
        socket.write('ERROR:Invalid message format\n');
      }
    } else {
      // Echo back for testing
      socket.write(`ECHO:${message}\n`);
    }
  });

  // Handle connection close
  socket.on('end', () => {
    if (username) {
      delete users[username];
      console.log(`[Server] User "${username}" disconnected`);
      console.log(`[Server] Connected users: ${Object.keys(users).join(', ') || 'None'}`);
    }
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error(`[Server] Socket error (${username || 'Unknown'}):`, error.message);
  });
});

// Start listening
const PORT = 9999;
const HOST = '127.0.0.1';

server.listen(PORT, HOST, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 TCP Chat Server Started`);
  console.log(`📍 Listening on ${HOST}:${PORT}`);
  console.log(`${'='.repeat(60)}\n`);
  console.log('Protocol:');
  console.log('  LOGIN:  LOGIN:username');
  console.log('  SEND:   SEND:targetUser:message');
  console.log('  ECHO:   Any other text (echoed back)');
  console.log(`\n${'='.repeat(60)}\n`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('[Server] Error:', error.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Server] Shutting down...');
  server.close(() => {
    console.log('[Server] Server closed');
    process.exit(0);
  });
});
