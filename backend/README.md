# Log Management Dashboard - Backend API

A comprehensive authentication and authorization service built with Express.js, TypeScript, and PostgreSQL with TimescaleDB extension.

## 🏗️ Architecture

```
backend/
├── src/
│   ├── config/          # Database and configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Authentication and validation
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript interfaces
│   ├── utils/           # Utility functions
│   └── index.ts         # Main server file
```

## 🚀 Features

- **Authentication**: JWT-based authentication with API key support
- **Authorization**: Role-based access control
- **Database**: PostgreSQL with TimescaleDB for time-series data
- **Validation**: Request validation using express-validator
- **Security**: Password hashing with bcrypt, secure JWT tokens
- **API Documentation**: Swagger-compatible documentation

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- TimescaleDB extension

## 🛠️ Installation

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # The .env file is already configured for Docker
   # If you need to modify database settings, edit backend/env
   ```

4. **Start the database with Docker**
   ```bash
   # From the project root
   docker-compose up -d postgres
   ```

5. **Start the application**
   ```bash
   npm run dev
   # The database schema will be automatically created
   ```

### Option 2: Local PostgreSQL Setup

1. **Install PostgreSQL and TimescaleDB**
   ```bash
   # Install PostgreSQL and TimescaleDB extension
   # Create database
   createdb log_management
   ```

2. **Set up environment variables**
   ```bash
   # Edit backend/env with your local database credentials
   ```

3. **Start the application**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `7000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `log_management` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `password` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `JWT_EXPIRES_IN` | JWT expiration time | `24h` |

## 🗄️ Database Schema

### Users Table
```sql
users {
    UUID id PK "Primary Key"
    TEXT email UK "Unique"
    TEXT password_hash
    TEXT api_key UK "Unique"
    TIMESTAMP created_at "Defaults to NOW()"
}
```

### Logs Table (TimescaleDB Hypertable)
```sql
logs {
    TIMESTAMP timestamp PK "Hypertable Time Column"
    UUID user_id FK "Foreign Key to users.id"
    TEXT level "e.g., INFO, WARN, ERROR"
    TEXT message
    JSONB metadata "Optional structured data"
}
```

### Traces Table
```sql
traces {
    UUID trace_id PK "Primary Key"
    UUID user_id FK "Foreign Key to users.id"
    TEXT root_span_name
    BIGINT start_time_unix_nano "Trace start time"
    BIGINT duration_nano "Total trace duration"
    INTEGER span_count
    TIMESTAMP created_at "Defaults to NOW()"
}
```

### Spans Table
```sql
spans {
    UUID span_id PK "Primary Key"
    UUID trace_id FK "Foreign Key to traces.trace_id"
    UUID parent_span_id "Nullable, for root spans"
    TEXT name "e.g., 'HTTP GET /slow', 'db-query'"
    BIGINT start_time_unix_nano
    BIGINT end_time_unix_nano
    JSONB attributes "Custom tags/metadata"
}
```

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "api_key": "generated-api-key",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "jwt-token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "api_key": "api-key",
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

### Get User Profile
```http
GET /auth/profile
Authorization: Bearer <jwt-token>
```

### Refresh API Key
```http
POST /auth/refresh-api-key
Authorization: Bearer <jwt-token>
```

## 🔑 Authentication Methods

### JWT Authentication
Include the JWT token in the Authorization header:
```http
Authorization: Bearer <jwt-token>
```

### API Key Authentication
Include the API key in the x-api-key header:
```http
x-api-key: <api-key>
```

## 🚀 Running the Application

### Development with Docker
```bash
# Start the database
docker-compose up -d postgres

# Start the application
npm run dev
```

### Development (Local Database)
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## 🐳 Docker Commands

### Start Database Only
```bash
docker-compose up -d postgres
```

### Stop Database
```bash
docker-compose down
```

### View Database Logs
```bash
docker-compose logs postgres
```

### Reset Database (WARNING: This will delete all data)
```bash
docker-compose down -v
docker-compose up -d postgres
```

## 📊 API Documentation

The API includes Swagger-compatible documentation in the route files. You can view the documentation by:

1. Starting the server
2. Visiting the endpoints with proper documentation comments
3. Using tools like Swagger UI or Postman

## 🔒 Security Features

- **Password Hashing**: Uses bcrypt with salt rounds of 12
- **JWT Tokens**: Secure token-based authentication
- **API Keys**: Alternative authentication method
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Parameterized queries
- **CORS**: Cross-origin resource sharing enabled

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
