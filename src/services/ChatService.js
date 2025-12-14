import TcpSocket from 'react-native-tcp-socket';

class ChatService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.username = null;
    this.messageListeners = [];
  }

  /**
   * Connect to the TCP server
   * @param {string} host - Server hostname/IP
   * @param {number} port - Server port
   * @param {string} username - Username for login
   * @returns {Promise<void>}
   */
  connect(host, port, username) {
    return new Promise((resolve, reject) => {
      try {
        this.username = username;

        const options = {
          host,
          port,
          reuseAddress: true,
        };

        this.socket = TcpSocket.createConnection(options, () => {
          console.log(`[ChatService] Connected to ${host}:${port}`);
          this.isConnected = true;

          // Send LOGIN protocol
          const loginMessage = `LOGIN:${username}\n`;
          this.socket.write(loginMessage, 'utf8', (error) => {
            if (error) {
              console.error('[ChatService] Error sending login:', error);
              reject(error);
            } else {
              console.log(`[ChatService] Login sent for user: ${username}`);
              resolve();
            }
          });
        });

        // Handle incoming data
        this.socket.on('data', (data) => {
          const message = data.toString('utf8').trim();
          console.log(`[ChatService] Received: ${message}`);
          this._notifyListeners(message);
        });

        // Handle errors
        this.socket.on('error', (error) => {
          console.error('[ChatService] Socket error:', error);
          this.isConnected = false;
        });

        // Handle connection close
        this.socket.on('close', () => {
          console.log('[ChatService] Connection closed');
          this.isConnected = false;
          this.socket = null;
        });

        // Handle connection end
        this.socket.on('end', () => {
          console.log('[ChatService] Connection ended');
          this.isConnected = false;
        });

        // Timeout for connection
        this.socket.setTimeout(10000, () => {
          console.error('[ChatService] Connection timeout');
          this.socket.destroy();
          reject(new Error('Connection timeout'));
        });
      } catch (error) {
        console.error('[ChatService] Connection error:', error);
        this.isConnected = false;
        reject(error);
      }
    });
  }

  /**
   * Send a message to a target user
   * @param {string} targetUserID - The recipient's user ID
   * @param {string} text - The message text
   * @returns {Promise<void>}
   */
  sendMessage(targetUserID, text) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected || !this.socket) {
        const error = new Error('Not connected to server');
        console.error('[ChatService]', error.message);
        reject(error);
        return;
      }

      try {
        const message = `SEND:${targetUserID}:${text}\n`;
        this.socket.write(message, 'utf8', (error) => {
          if (error) {
            console.error('[ChatService] Error sending message:', error);
            reject(error);
          } else {
            console.log(`[ChatService] Message sent to ${targetUserID}`);
            resolve();
          }
        });
      } catch (error) {
        console.error('[ChatService] Exception sending message:', error);
        reject(error);
      }
    });
  }

  /**
   * Register a callback to receive incoming messages
   * @param {Function} callback - Function to call when messages arrive
   * @returns {Function} - Unsubscribe function
   */
  onMessage(callback) {
    if (typeof callback !== 'function') {
      console.error('[ChatService] Callback must be a function');
      return () => {};
    }

    this.messageListeners.push(callback);
    console.log('[ChatService] Message listener registered');

    // Return unsubscribe function
    return () => {
      this.messageListeners = this.messageListeners.filter(
        (listener) => listener !== callback
      );
      console.log('[ChatService] Message listener unregistered');
    };
  }

  /**
   * Notify all registered listeners about a new message
   * @private
   * @param {string} message - The received message
   */
  _notifyListeners(message) {
    this.messageListeners.forEach((callback) => {
      try {
        callback(message);
      } catch (error) {
        console.error('[ChatService] Error in message listener:', error);
      }
    });
  }

  /**
   * Disconnect from the server
   * @returns {Promise<void>}
   */
  disconnect() {
    return new Promise((resolve) => {
      if (this.socket) {
        this.socket.destroy();
        this.socket = null;
      }
      this.isConnected = false;
      this.messageListeners = [];
      console.log('[ChatService] Disconnected');
      resolve();
    });
  }

  /**
   * Check if connected
   * @returns {boolean}
   */
  getIsConnected() {
    return this.isConnected;
  }

  /**
   * Get current username
   * @returns {string|null}
   */
  getUsername() {
    return this.username;
  }
}

// Export singleton instance
const chatService = new ChatService();
export default chatService;
