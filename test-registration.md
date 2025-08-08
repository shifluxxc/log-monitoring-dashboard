# Testing User Registration with API Key

## 🧪 **Test Registration Endpoint**

### Request:
```bash
curl -X POST http://localhost:7000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

### Expected Response:
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "api_key": "64-character-hex-string",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

## 🔑 **API Key Details:**

- **Length**: 64 characters (32 bytes converted to hex)
- **Format**: Hexadecimal string
- **Uniqueness**: Guaranteed unique per user
- **Usage**: Can be used for API authentication

## 📝 **Example Usage:**

```bash
# Register a new user
curl -X POST http://localhost:7000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "developer@example.com",
    "password": "MySecurePass123"
  }'

# Use the returned API key for authenticated requests
curl -X GET http://localhost:7000/auth/profile \
  -H "x-api-key: YOUR_API_KEY_HERE"
``` 