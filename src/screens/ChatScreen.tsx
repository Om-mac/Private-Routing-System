import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ViewStyle,
  TextStyle,
} from 'react-native';
import chatService from '../services/ChatService';

interface Message {
  id: string;
  text: string;
  fromMe: boolean;
  timestamp: string;
}

const ChatScreen: React.FC = () => {
  // Connection state
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Login screen inputs
  const [serverIP, setServerIP] = useState<string>('192.168.1.100');
  const [serverPort, setServerPort] = useState<string>('9999');
  const [username, setUsername] = useState<string>('');

  // Chat screen state
  const [messages, setMessages] = useState<Message[]>([]);
  const [targetUser, setTargetUser] = useState<string>('');
  const [messageText, setMessageText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const flatListRef = useRef<FlatList>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  /**
   * Setup message listener when connected
   */
  useEffect(() => {
    if (isConnected) {
      // Register listener for incoming messages
      unsubscribeRef.current = chatService.onMessage((incomingMessage: string) => {
        // Parse incoming message and add to messages array
        // Format could be: "FROM:SenderID:MessageText" or custom format
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Math.random().toString(),
            text: incomingMessage,
            fromMe: false,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      });

      return () => {
        // Cleanup listener on disconnect
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
      };
    }
  }, [isConnected]);

  /**
   * Auto scroll to latest message
   */
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  /**
   * Handle login/connection
   */
  const handleConnect = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    if (!serverIP.trim()) {
      Alert.alert('Error', 'Please enter server IP');
      return;
    }

    if (!serverPort.trim()) {
      Alert.alert('Error', 'Please enter server port');
      return;
    }

    setIsLoading(true);

    try {
      const port = parseInt(serverPort, 10);
      await chatService.connect(serverIP, port, username);
      setIsConnected(true);
      setMessages([]);
      console.log('Connected successfully');
    } catch (error) {
      Alert.alert(
        'Connection Error',
        error instanceof Error ? error.message : 'Failed to connect to server'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle sending message
   */
  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    if (!targetUser.trim()) {
      Alert.alert('Error', 'Please enter recipient ID');
      return;
    }

    try {
      await chatService.sendMessage(targetUser, messageText);

      // Add sent message to local messages array
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Math.random().toString(),
          text: `[To ${targetUser}]: ${messageText}`,
          fromMe: true,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);

      setMessageText('');
    } catch (error) {
      Alert.alert(
        'Send Error',
        error instanceof Error ? error.message : 'Failed to send message'
      );
    }
  };

  /**
   * Handle disconnect
   */
  const handleDisconnect = async () => {
    try {
      await chatService.disconnect();
      setIsConnected(false);
      setMessages([]);
      setUsername('');
      setTargetUser('');
      setMessageText('');
    } catch (error) {
      Alert.alert(
        'Disconnect Error',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };

  /**
   * Render login screen
   */
  if (!isConnected) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginContainer}>
          {/* Header */}
          <View style={styles.loginHeader}>
            <Text style={styles.loginTitle}>OmChat</Text>
            <Text style={styles.loginSubtitle}>Connect to TCP Server</Text>
          </View>

          {/* Login Card */}
          <View style={styles.loginCard}>
            {/* Server IP Input */}
            <TextInput
              style={styles.input}
              placeholder="Server IP Address"
              placeholderTextColor="#999"
              value={serverIP}
              onChangeText={setServerIP}
              editable={!isLoading}
            />

            {/* Server Port Input */}
            <TextInput
              style={styles.input}
              placeholder="Server Port"
              placeholderTextColor="#999"
              value={serverPort}
              onChangeText={setServerPort}
              keyboardType="numeric"
              editable={!isLoading}
            />

            {/* Username Input */}
            <TextInput
              style={styles.input}
              placeholder="Your Username"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              editable={!isLoading}
            />

            {/* Connect Button */}
            <TouchableOpacity
              style={[styles.connectButton, isLoading && styles.connectButtonDisabled]}
              onPress={handleConnect}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.connectButtonText}>CONNECT</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Render chat screen
   */
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View style={styles.chatHeader}>
          <View>
            <Text style={styles.headerTitle}>OmChat</Text>
            <Text style={styles.headerSubtitle}>Connected as {username}</Text>
          </View>
          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={handleDisconnect}
          >
            <Text style={styles.disconnectButtonText}>Exit</Text>
          </TouchableOpacity>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageContainer,
                item.fromMe ? styles.messageContainerRight : styles.messageContainerLeft,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  item.fromMe ? styles.messageBubbleMe : styles.messageBubbleOther,
                ]}
              >
                <Text style={[styles.messageText, item.fromMe && styles.messageTextMe]}>
                  {item.text}
                </Text>
                <Text style={[styles.messageTime, item.fromMe && styles.messageTimeMe]}>
                  {item.timestamp}
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Start a conversation</Text>
            </View>
          }
        />

        {/* Input Footer */}
        <View style={styles.inputFooter}>
          <TextInput
            style={[styles.footerInput, styles.recipientInput]}
            placeholder="Recipient ID"
            placeholderTextColor="#999"
            value={targetUser}
            onChangeText={setTargetUser}
          />

          <TextInput
            style={[styles.footerInput, styles.messageInput]}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
          />

          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  } as ViewStyle,

  // ========== LOGIN SCREEN STYLES ==========
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  } as ViewStyle,

  loginHeader: {
    alignItems: 'center',
    marginBottom: 40,
  } as ViewStyle,

  loginTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#25D366',
    marginBottom: 8,
  } as TextStyle,

  loginSubtitle: {
    fontSize: 14,
    color: '#666',
  } as TextStyle,

  loginCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,

  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 14,
    color: '#000',
  } as TextStyle,

  connectButton: {
    backgroundColor: '#25D366',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  } as ViewStyle,

  connectButtonDisabled: {
    opacity: 0.6,
  } as ViewStyle,

  connectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  } as TextStyle,

  // ========== CHAT SCREEN STYLES ==========
  chatContainer: {
    flex: 1,
  } as ViewStyle,

  chatHeader: {
    backgroundColor: '#25D366',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,

  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  } as TextStyle,

  headerSubtitle: {
    fontSize: 12,
    color: '#e0f7e0',
    marginTop: 4,
  } as TextStyle,

  disconnectButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  } as ViewStyle,

  disconnectButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  } as TextStyle,

  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    flexGrow: 1,
    justifyContent: 'flex-end',
  } as ViewStyle,

  messageContainer: {
    marginVertical: 6,
    flexDirection: 'row',
  } as ViewStyle,

  messageContainerLeft: {
    justifyContent: 'flex-start',
  } as ViewStyle,

  messageContainerRight: {
    justifyContent: 'flex-end',
  } as ViewStyle,

  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  } as ViewStyle,

  messageBubbleMe: {
    backgroundColor: '#25D366',
    borderBottomRightRadius: 4,
  } as ViewStyle,

  messageBubbleOther: {
    backgroundColor: '#e0e0e0',
    borderBottomLeftRadius: 4,
  } as ViewStyle,

  messageText: {
    fontSize: 14,
    color: '#333',
  } as TextStyle,

  messageTextMe: {
    color: 'white',
  } as TextStyle,

  messageTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  } as TextStyle,

  messageTimeMe: {
    color: 'rgba(255, 255, 255, 0.7)',
  } as TextStyle,

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  emptyText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  } as TextStyle,

  emptySubtext: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
  } as TextStyle,

  inputFooter: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  } as ViewStyle,

  footerInput: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#000',
  } as TextStyle,

  recipientInput: {
    flex: 0.3,
    maxHeight: 40,
  } as ViewStyle,

  messageInput: {
    flex: 1,
    maxHeight: 80,
  } as ViewStyle,

  sendButton: {
    backgroundColor: '#25D366',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 40,
  } as ViewStyle,

  sendButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  } as TextStyle,
});

export default ChatScreen;
