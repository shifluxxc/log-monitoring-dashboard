# API Key Display Test Guide

## 🧪 **Testing the API Key Display**

### Step 1: Start the Backend
```bash
# From project root
docker-compose up -d postgres
cd backend
npm run dev
```

### Step 2: Start the Frontend
```bash
# From project root
cd frontend
npm run dev
```

### Step 3: Test Registration
1. Go to `http://localhost:5173/signup`
2. Create a new account with:
   - Email: `test@example.com`
   - Password: `SecurePass123`
3. After registration, you should be redirected to the dashboard
4. Check the right sidebar for the API Key display

### Step 4: Test Login
1. Go to `http://localhost:5173/login`
2. Login with the same credentials
3. Check the header for the API key preview
4. Check the right sidebar for the full API key display

## 🔍 **What to Look For:**

### In the Header:
- API key preview (first 8 characters + "...")
- Copy button to copy the full key

### In the Dashboard Sidebar:
- Full API key display (hidden by default)
- Show/Hide toggle button
- Copy button
- Refresh button
- Usage example with curl command

## 🐛 **Troubleshooting:**

### If API key is not showing:
1. Check browser console for errors
2. Verify backend is running on port 7000
3. Check that user data includes `api_key` field
4. Verify the AuthContext is properly storing user data

### If registration fails:
1. Check backend logs for database connection issues
2. Verify PostgreSQL is running in Docker
3. Check that the database schema was created properly

## 📋 **Expected API Key Format:**
- 64 characters long
- Hexadecimal string
- Example: `a1b2c3d4e5f6...`

## 🔧 **API Key Usage:**
```bash
# Using the API key for authenticated requests
curl -H "x-api-key: YOUR_API_KEY" \
  http://localhost:7000/auth/profile
``` 