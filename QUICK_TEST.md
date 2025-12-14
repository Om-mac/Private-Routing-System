# OmChat Quick Test Checklist

## Before You Start
- [ ] C++ TCP server is running and listening on a port
- [ ] You know the server's IP address and port number
- [ ] iOS simulator or Android emulator is running
- [ ] All dependencies are installed (`npm install`)

---

## Quick Start (Copy & Paste)

### Terminal 1: Development Server
```bash
cd /Users/tapdiyaom/Desktop/OmChat/OmChat
npm start
```

### Terminal 2: Run iOS
```bash
cd /Users/tapdiyaom/Desktop/OmChat/OmChat
npm run ios
```

### Terminal 3: Run Android (Optional)
```bash
cd /Users/tapdiyaom/Desktop/OmChat/OmChat
npm run android
```

---

## Test Checklist

### ✅ App Load
- [ ] App launches without crashing
- [ ] Login screen appears
- [ ] Inputs are visible and editable

### ✅ Connection Test
- [ ] Enter server IP: `192.168.1.100` (or your server IP)
- [ ] Enter port: `9999` (or your server port)
- [ ] Enter username: `TestUser`
- [ ] Click CONNECT
- [ ] Chat screen appears (no error)
- [ ] Header shows "Connected as TestUser"

### ✅ Messaging Test
- [ ] Enter Recipient ID: `RecipientName`
- [ ] Enter Message: `Hello World`
- [ ] Click SEND
- [ ] Message appears in green bubble on RIGHT
- [ ] Timestamp is visible
- [ ] Message list auto-scrolls

### ✅ Receive Test (Multi-Device)
- [ ] Open app on 2nd device/simulator
- [ ] Connect with different username
- [ ] Send message from Device 1 to Device 2
- [ ] Message appears on Device 2 in gray bubble on LEFT
- [ ] Timestamp is visible

### ✅ UI/UX Test
- [ ] Colors match WhatsApp style (green #25D366)
- [ ] Message bubbles are rounded
- [ ] Layout is responsive on screen rotate
- [ ] No lag when typing or scrolling
- [ ] Buttons are clickable and responsive

### ✅ Disconnect Test
- [ ] Click EXIT button
- [ ] Returns to login screen
- [ ] Inputs are cleared
- [ ] Can reconnect with new credentials

### ✅ Error Handling
- [ ] Wrong IP shows error alert
- [ ] Wrong port shows error alert
- [ ] Empty username shows error alert
- [ ] Empty recipient ID shows error alert
- [ ] Empty message shows error alert

---

## Console Output to Look For

```
✅ Success Logs:
[ChatService] Connected to 192.168.1.100:9999
[ChatService] Login sent for user: TestUser
[ChatService] Message sent to RecipientName
[ChatService] Received: [incoming message]

⚠️ Warning/Info Logs:
[ChatService] Message listener registered
[ChatService] Not connected to server

❌ Error Logs (Should investigate):
[ChatService] Socket error:
[ChatService] Connection timeout
[ChatService] Exception sending message:
```

---

## Test Results

### All Tests Pass? ✅
You're ready to:
1. Deploy to physical devices
2. Add more features
3. Optimize performance
4. Push code to GitHub

### Some Tests Fail? ❌
1. Check TESTING_GUIDE.md Troubleshooting section
2. Verify C++ server is running correctly
3. Check IP/port are correct
4. Review console logs for errors

---

## Commands Reference

```bash
# Start dev server (Terminal 1)
npm start

# Run iOS (Terminal 2)
npm run ios

# Run Android (Terminal 3)
npm run android

# Stop any running process
Ctrl + C

# Clean cache and rebuild
npm start -- --reset-cache

# View Android logs
adb logcat | grep "ChatService"

# Check project structure
ls -la src/
```

---

## Still Need Help?

1. Check `/TESTING_GUIDE.md` for detailed steps
2. Review `/src/services/ChatService.js` for TCP protocol
3. Check `/README.md` for setup instructions
4. See console logs for error messages
