# WebSocket Debugging Guide

## 🔍 **Debugging Steps**

### **Step 1: Check Backend Logs**
```bash
# Check if backend is running
ps aux | grep node

# Check backend logs
cd backend
npm run dev
```

**Look for these messages:**
- ✅ `🚀 Server is running on PORT 7000`
- ✅ `📡 WebSocket endpoint: ws://localhost:7000/ws/logs`
- ✅ `✅ Redis Publisher connected`
- ✅ `✅ Redis Subscriber connected`

### **Step 2: Check Frontend Console**
1. Open browser developer tools (F12)
2. Go to Console tab
3. Login to the application
4. Look for WebSocket messages

**Expected Console Messages:**
```
🔌 Attempting WebSocket connection...
✅ WebSocket connected successfully
✅ WebSocket authenticated successfully
📡 WebSocket connection status: Connected to real-time log stream
```

### **Step 3: Test WebSocket Connection Manually**

**Using Browser Console:**
```javascript
// Test WebSocket connection
const token = localStorage.getItem('token'); // Get your JWT token
const ws = new WebSocket(`ws://localhost:7000/ws/logs?token=${token}`);

ws.onopen = () => console.log('✅ WebSocket connected');
ws.onmessage = (event) => console.log('📨 Message:', JSON.parse(event.data));
ws.onclose = (event) => console.log('🔌 Closed:', event.code, event.reason);
ws.onerror = (error) => console.error('❌ Error:', error);
```

### **Step 4: Check Authentication**

**Verify JWT Token:**
```javascript
// In browser console
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);
console.log('Token length:', token?.length);
```

### **Step 5: Common Issues & Solutions**

#### **Issue 1: "No token provided"**
**Cause:** JWT token not available when WebSocket tries to connect
**Solution:** 
- Make sure you're logged in
- Check if token is stored in localStorage
- Wait for authentication to complete before WebSocket connects

#### **Issue 2: "Authentication failed"**
**Cause:** Invalid or expired JWT token
**Solution:**
- Logout and login again
- Check if token is valid
- Verify JWT_SECRET in backend

#### **Issue 3: "Connection refused"**
**Cause:** Backend not running or wrong port
**Solution:**
- Start backend: `cd backend && npm run dev`
- Check if port 7000 is available
- Verify Docker services are running

#### **Issue 4: "Max reconnection attempts reached"**
**Cause:** WebSocket keeps failing to connect
**Solution:**
- Check backend logs for errors
- Verify Redis is running
- Check network connectivity

### **Step 6: Manual Testing**

**Test Log Ingestion:**
```bash
# Get your API key from the dashboard
curl -X POST http://localhost:7000/ingest/logs \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -d '{
    "level": "INFO",
    "message": "Test log from curl"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-01T00:00:00Z",
    "user_id": "your-user-id",
    "level": "INFO",
    "message": "Test log from curl"
  },
  "message": "Log ingested successfully"
}
```

### **Step 7: Check Redis Connection**

```bash
# Connect to Redis
docker-compose exec redis redis-cli

# Check if Redis is working
PING

# Check active channels
PUBSUB CHANNELS logs:*
```

### **Step 8: Database Verification**

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d log_management

# Check if logs are being stored
SELECT COUNT(*) FROM logs;

# Check recent logs
SELECT * FROM logs ORDER BY timestamp DESC LIMIT 5;
```

## 🐛 **Quick Fixes**

### **Fix 1: Restart Everything**
```bash
# Stop all services
docker-compose down

# Start services
docker-compose up -d postgres redis

# Start backend
cd backend && npm run dev

# Start frontend (in new terminal)
cd frontend && npm run dev
```

### **Fix 2: Clear Browser Data**
1. Open browser developer tools
2. Go to Application tab
3. Clear localStorage
4. Refresh page and login again

### **Fix 3: Check Environment Variables**
```bash
# Check backend .env file
cat backend/env

# Verify these values:
# - JWT_SECRET is set
# - REDIS_HOST=localhost
# - REDIS_PORT=6379
```

## 📊 **Expected Behavior**

### **Successful Connection:**
1. ✅ Backend starts without errors
2. ✅ Redis connects successfully
3. ✅ WebSocket server initializes
4. ✅ Frontend connects to WebSocket
5. ✅ Authentication succeeds
6. ✅ Real-time logs appear in dashboard

### **Failed Connection:**
1. ❌ Check backend logs for errors
2. ❌ Check browser console for WebSocket errors
3. ❌ Verify all services are running
4. ❌ Check network connectivity

## 🆘 **Still Having Issues?**

If the problem persists:

1. **Check backend logs** for specific error messages
2. **Check browser console** for WebSocket errors
3. **Verify all services** are running (PostgreSQL, Redis, Backend, Frontend)
4. **Test with a simple WebSocket client** to isolate the issue
5. **Check network connectivity** between frontend and backend

**Common Error Messages:**
- `ECONNREFUSED`: Backend not running
- `Authentication failed`: Invalid JWT token
- `No token provided`: Not logged in
- `Max reconnection attempts`: Persistent connection issues 