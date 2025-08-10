# Sprint 1 Test Guide: Log Ingestion & Real-Time View

## 🎯 **Goal**
A user can send a log via curl and see it appear instantly on their dashboard.

## 🚀 **Setup Instructions**

### **Step 1: Start Services**
```bash
# From project root
docker-compose up -d postgres redis

# Start backend
cd backend
npm run dev

# Start frontend (in new terminal)
cd frontend
npm run dev
```

### **Step 2: Register/Login to Get API Key**
1. Go to `http://localhost:5173/signup`
2. Create account with email and password
3. Copy your API key from the dashboard sidebar
4. Or login at `http://localhost:5173/login`

## 🧪 **Test Scenarios**

### **Test 1: Basic Log Ingestion**
```bash
curl -X POST http://localhost:7000/ingest/logs \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -d '{
    "level": "INFO",
    "message": "User logged in successfully",
    "metadata": {
      "userId": "12345",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0"
    }
  }'
```

**Expected Result:**
- ✅ HTTP 201 response
- ✅ Log appears instantly in dashboard
- ✅ Log is color-coded (blue for INFO)
- ✅ Metadata is expandable

### **Test 2: Different Log Levels**
```bash
# ERROR log
curl -X POST http://localhost:7000/ingest/logs \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -d '{
    "level": "ERROR",
    "message": "Database connection failed",
    "metadata": {
      "errorCode": "DB_CONN_001",
      "retryCount": 3
    }
  }'

# WARN log
curl -X POST http://localhost:7000/ingest/logs \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -d '{
    "level": "WARN",
    "message": "High memory usage detected",
    "metadata": {
      "memoryUsage": "85%",
      "threshold": "80%"
    }
  }'

# DEBUG log
curl -X POST http://localhost:7000/ingest/logs \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -d '{
    "level": "DEBUG",
    "message": "Processing request parameters",
    "metadata": {
      "params": {"id": 123, "type": "user"}
    }
  }'
```

**Expected Result:**
- ✅ ERROR logs: Red color, ❌ icon
- ✅ WARN logs: Yellow color, ⚠️ icon
- ✅ INFO logs: Blue color, ℹ️ icon
- ✅ DEBUG logs: Gray color, 🔍 icon

### **Test 3: Real-Time Streaming**
1. Open dashboard in browser
2. Send multiple logs rapidly:
```bash
for i in {1..10}; do
  curl -X POST http://localhost:7000/ingest/logs \
    -H "Content-Type: application/json" \
    -H "x-api-key: YOUR_API_KEY_HERE" \
    -d "{
      \"level\": \"INFO\",
      \"message\": \"Test log $i\",
      \"metadata\": {\"testId\": $i}
    }"
  sleep 0.5
done
```

**Expected Result:**
- ✅ Logs appear in real-time
- ✅ Auto-scroll to bottom
- ✅ Connection status shows "🟢 Connected"

### **Test 4: WebSocket Authentication**
```bash
# Test with invalid API key
curl -X POST http://localhost:7000/ingest/logs \
  -H "Content-Type: application/json" \
  -H "x-api-key: INVALID_KEY" \
  -d '{
    "level": "INFO",
    "message": "This should fail"
  }'
```

**Expected Result:**
- ✅ HTTP 401 Unauthorized response
- ✅ No log appears in dashboard

### **Test 5: Validation Errors**
```bash
# Missing required fields
curl -X POST http://localhost:7000/ingest/logs \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -d '{
    "level": "INFO"
  }'

# Invalid log level
curl -X POST http://localhost:7000/ingest/logs \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -d '{
    "level": "INVALID",
    "message": "This should fail"
  }'
```

**Expected Result:**
- ✅ HTTP 400 Bad Request
- ✅ Detailed validation error messages

## 🔍 **Verification Checklist**

### **Backend Verification:**
- ✅ `/ingest/logs` endpoint responds with 201
- ✅ API key authentication works
- ✅ Logs are stored in TimescaleDB
- ✅ Redis pub/sub is working
- ✅ WebSocket server is running on `/ws/logs`

### **Frontend Verification:**
- ✅ Dashboard loads without errors
- ✅ WebSocket connection established
- ✅ Real-time log updates work
- ✅ Log color-coding is correct
- ✅ Auto-scroll functionality works
- ✅ Connection status indicator works

### **Database Verification:**
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d log_management

# Check logs table
SELECT * FROM logs ORDER BY timestamp DESC LIMIT 5;
```

### **Redis Verification:**
```bash
# Connect to Redis
docker-compose exec redis redis-cli

# Check Redis channels
PUBSUB CHANNELS logs:*
```

## 🐛 **Troubleshooting**

### **Common Issues:**

1. **WebSocket Connection Failed**
   - Check if backend is running on port 7000
   - Verify JWT token is valid
   - Check browser console for errors

2. **Logs Not Appearing**
   - Verify API key is correct
   - Check if user IDs match
   - Verify Redis is running

3. **Database Connection Issues**
   - Ensure PostgreSQL container is running
   - Check database credentials in `.env`
   - Verify TimescaleDB extension is enabled

4. **Frontend Not Loading**
   - Check if frontend is running on port 5173
   - Verify all dependencies are installed
   - Check browser console for errors

## 📊 **Performance Metrics**

### **Expected Performance:**
- ✅ Log ingestion: < 100ms response time
- ✅ Real-time display: < 500ms latency
- ✅ WebSocket connection: < 2s establishment
- ✅ Auto-scroll: Smooth, no lag

### **Load Testing:**
```bash
# Send 100 logs rapidly
for i in {1..100}; do
  curl -X POST http://localhost:7000/ingest/logs \
    -H "Content-Type: application/json" \
    -H "x-api-key: YOUR_API_KEY_HERE" \
    -d "{
      \"level\": \"INFO\",
      \"message\": \"Load test log $i\"
    }" &
done
wait
```

## ✅ **Success Criteria**

**Sprint 1 is complete when:**
1. ✅ User can register/login and get API key
2. ✅ User can send logs via curl with API key
3. ✅ Logs appear instantly in dashboard
4. ✅ Real-time streaming works via WebSocket
5. ✅ Logs are color-coded by level
6. ✅ Auto-scroll functionality works
7. ✅ Logs are persisted in TimescaleDB
8. ✅ Redis pub/sub is working
9. ✅ Authentication works for both API and WebSocket
10. ✅ Error handling and validation work correctly

## 🎉 **Congratulations!**

If all tests pass, you've successfully completed **Sprint 1: Log Ingestion & Real-Time View**! 

**Next Steps:**
- Move to Sprint 2: Advanced Log Features
- Implement log filtering and search
- Add log aggregation and metrics
- Build trace ingestion and visualization 