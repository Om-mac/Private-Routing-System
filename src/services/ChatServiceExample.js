import chatService from './ChatService';

/**
 * Example usage of ChatService in React Native app
 */

// Example 1: Connect to server
export const connectToChat = async (username) => {
  try {
    console.log('Connecting to chat server...');
    await chatService.connect('192.168.1.100', 9999, username);
    console.log('Successfully connected!');
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
};

// Example 2: Register message listener
export const setupMessageListener = () => {
  const unsubscribe = chatService.onMessage((message) => {
    console.log('New message:', message);
    // Parse and handle message in UI
    // Example: UPDATE:otherUserID:messageText
    // or STATUS:online/offline
  });

  // Return unsubscribe function for cleanup
  return unsubscribe;
};

// Example 3: Send message
export const sendChatMessage = async (targetUserID, text) => {
  try {
    await chatService.sendMessage(targetUserID, text);
    console.log('Message sent successfully');
  } catch (error) {
    console.error('Failed to send message:', error.message);
  }
};

// Example 4: Disconnect
export const disconnectFromChat = async () => {
  try {
    await chatService.disconnect();
    console.log('Disconnected from server');
  } catch (error) {
    console.error('Disconnect failed:', error.message);
  }
};

// Example 5: Check connection status
export const checkConnectionStatus = () => {
  if (chatService.getIsConnected()) {
    console.log(`Connected as: ${chatService.getUsername()}`);
    return true;
  } else {
    console.log('Not connected');
    return false;
  }
};
