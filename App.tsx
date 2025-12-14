/**
 * OmChat - React Native TCP Chat Application
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ChatScreen from './src/screens/ChatScreen';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#25D366" />
      <ChatScreen />
    </SafeAreaProvider>
  );
}

export default App;
