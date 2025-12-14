# OmChat Testing Guide

## Prerequisites
Before testing, you need:
1. A running C++ TCP server listening on a specific IP and port
2. Node.js and npm installed
3. Xcode (for iOS) or Android Studio (for Android)
4. React Native dev environment set up

---

## Step 1: Start the Development Server

```bash
cd /Users/tapdiyaom/Desktop/OmChat/OmChat
npm start
```

You should see:
```
Starting Metro Bundler
Waiting for messages...
```

**Keep this terminal open.**

---

## Step 2: Run on iOS

### Option A: Using Xcode Simulator (Recommended for testing)

```bash
# In a NEW terminal, run:
cd /Users/tapdiyaom/Desktop/OmChat/OmChat
npm run ios
```

This will:
1. Build the app
2. Launch the iOS simulator automatically
3. Install and run the app

**Wait for the app to load** (~60-90 seconds)

### Option B: Using Xcode directly

```bash
# Open in Xcode
cd /Users/tapdiyaom/Desktop/OmChat/OmChat/ios
xed -b OmChat.xcworkspace

# Then in Xcode:
# 1. Select an iPhone simulator from the top dropdown
# 2. Press Cmd + R to build and run
```

---

## Step 3: Run on Android

### Prerequisites:
- Android SDK installed
- Android emulator running OR physical device connected via USB

```bash
# In a NEW terminal, run:
cd /Users/tapdiyaom/Desktop/OmChat/OmChat
npm run android
```

This will:
1. Build the APK
2. Install on the emulator/device
3. Launch the app

---

## Step 4: Testing the App

### Login Screen (First Screen):

1. **Enter Server IP**: 
   - Local test: `127.0.0.1` or `localhost`
   - Network test: `192.168.x.x` (your server's IP)

2. **Enter Server Port**: 
   - Use your C++ server's listening port (e.g., `9999`)

3. **Enter Your Username**: 
   - Any username (e.g., `Alice`, `John`, `User1`)

4. **Click CONNECT button**:
   - If successful: Transitions to Chat Screen
   - If fails: Shows error alert

### Expected Success:
```
[ChatService] Connected to [IP]:[PORT]
[ChatService] Login sent for user: [username]
```

---

## Step 5: Testing Chat Functionality

### On Chat Screen:

1. **Header shows**: "Connected as [your-username]"

2. **Sending Messages**:
   - Enter **Recipient ID**: (e.g., `Alice`, `Bob`)
   - Enter **Message**: Type any text
   - Click **Send** button
   - Message appears in **GREEN bubble on the RIGHT**

3. **Receiving Messages**:
   - Messages from others appear in **GRAY bubble on the LEFT**
   - Automatically scrolls to latest message
   - Shows timestamp for each message

4. **Disconnect**:
   - Click **Exit** button to return to login screen

---

## Step 6: Multi-User Testing (Network Test)

To test messaging between multiple users:

### Setup:
1. Start your C++ TCP server
2. Run the app on 2+ devices/simulators

### Test Scenario:
```
Device 1: Alice connects from 192.168.1.100:9999
Device 2: Bob connects from 192.168.1.100:9999

Alice sends message to Bob:
  - Recipient ID: Bob
  - Message: "Hello Bob!"

Bob receives the message
```

---

## Step 7: Debugging & Logs

### View Console Logs:

**iOS:**
```bash
# In Xcode
View → Debug Area → Show Console
# Or press Cmd + Shift + C
```

**Android:**
```bash
# In Android Studio or terminal
adb logcat | grep "ChatService"
```

### Common Log Messages:
```
✅ Success:
[ChatService] Connected to 192.168.1.100:9999
[ChatService] Login sent for user: Alice
[ChatService] Message sent to Bob

❌ Errors:
[ChatService] Socket error: ECONNREFUSED
[ChatService] Connection timeout
[ChatService] Not connected to server
```

---

## Step 8: Troubleshooting

### Issue: "Connection refused"
- **Cause**: TCP server not running
- **Fix**: Start your C++ TCP server first

### Issue: "Connection timeout"
- **Cause**: Wrong IP or port
- **Fix**: Double-check server IP and port number

### Issue: "Metro bundler connection refused"
- **Cause**: Dev server stopped
- **Fix**: Run `npm start` in first terminal

### Issue: App crashes on iOS
- **Cause**: Build or dependency issue
- **Fix**: 
  ```bash
  cd ios
  pod install
  cd ..
  npm run ios
  ```

### Issue: Android build fails
- **Cause**: Android SDK issue
- **Fix**:
  ```bash
  npx react-native doctor
  # Follow suggestions
  npm run android
  ```

---

## Step 9: Expected Test Results

### ✅ Test Passes When:
1. Login screen loads with inputs
2. Server connection succeeds
3. Chat screen displays
4. Messages send and receive
5. Bubbles appear on correct sides (mine = right/green, others = left/gray)
6. Messages have timestamps
7. Auto-scrolls to latest message
8. Disconnect works

### ❌ Test Fails When:
- Cannot connect to server
- Messages don't appear
- UI crashes
- Buttons unresponsive
- Console errors appear

---

## Step 10: C++ Server Protocol (For Reference)

Your app uses these protocols with the C++ server:

```
1. CONNECTION:
   Client connects to server:port

2. LOGIN:
   Client sends: LOGIN:username\n
   Example: LOGIN:Alice\n

3. SEND MESSAGE:
   Client sends: SEND:targetUserID:messageText\n
   Example: SEND:Bob:Hello Bob!\n

4. RECEIVE MESSAGE:
   Server sends: [message format]\n
   App displays in chat
```

---

## Quick Test Command (All in One)

```bash
# Terminal 1: Start dev server
cd /Users/tapdiyaom/Desktop/OmChat/OmChat
npm start

# Terminal 2: Run iOS
npm run ios

# Terminal 3: Run Android (optional)
npm run android
```

Then test the login and messaging flow!

---

## Next Steps After Testing

If tests pass:
1. Optimize UI/UX
2. Add message persistence
3. Add user list feature
4. Add notifications
5. Add encryption for security

If tests fail:
1. Check console logs
2. Verify server is running
3. Test with correct IP/port
4. Check network connectivity
