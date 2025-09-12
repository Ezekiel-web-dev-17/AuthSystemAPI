# 🔐 AuthSystemAPI

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-5.1+-lightgrey.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

A robust, production-ready authentication system built with Node.js, TypeScript, and MongoDB. Features comprehensive security measures, email verification, JWT-based authentication, and advanced protection against common web attacks.

## ✨ Features

### 🔒 Security First
- **JWT Authentication** with access and refresh tokens
- **Password Hashing** using bcryptjs with 12 salt rounds
- **Rate Limiting** and DDoS protection via Arcjet
- **Bot Detection** with allowlist for legitimate crawlers
- **CORS Protection** with configurable origins
- **Security Headers** via Helmet middleware
- **Input Validation** and sanitization

### 📧 Email System
- **Email Verification** required before account activation
- **Password Reset** with secure token-based flow
- **Beautiful HTML Templates** for all email communications
- **Mailtrap Integration** for reliable email delivery
- **Token Expiration** for enhanced security

### 🛡️ Advanced Protection
- **Arcjet Shield** protection against SQL injection and XSS
- **Token Bucket Rate Limiting** (5 requests per 10 seconds)
- **Environment-based Configuration** for different deployment stages
- **Comprehensive Error Handling** with detailed logging
- **Admin Role Management** for privileged operations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- MongoDB instance (local or cloud)
- Email service credentials (Mailtrap recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/AuthSystemAPI.git
   cd AuthSystemAPI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create environment files for different stages:
   
   `.env.development.local`:
   ```env
   # Server Configuration
   PORT=4000
   NODE_ENV=development
   BASE_URL=http://localhost:3000/verify-email
   FORGOT_PASSWORD_URL=http://localhost:3000/reset-password
   
   # Database
   MONGO_URI=mongodb://localhost:27017/authsystem
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=2m
   JWT_REFRESH_SECRET=your-refresh-secret-here
   JWT_REFRESH_EXPIRES_IN=7d
   
   # Arcjet Security
   ARCJET_KEY=your-arcjet-key-here
   ARCJET_ENV=development
   
   # Email Configuration (Mailtrap)
   MAIL_HOST=live.smtp.mailtrap.io
   MAIL_PORT=587
   MAIL_USER=your-mailtrap-username
   MAIL_PASS=your-mailtrap-password
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## 📖 API Documentation

### Base URL
```
http://localhost:4000/api/v1
```

### Authentication Flow

#### 1. User Registration
```http
POST /auth/signUp
Content-Type: application/json

{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

#### 2. Email Verification
```http
GET /verify-email?token={verification_token}&userId={user_id}
```

#### 3. User Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

#### 4. Access Protected Routes
```http
GET /protected-route
Authorization: Bearer {access_token}
```

#### 5. Refresh Token
```http
POST /auth/refresh-token
Content-Type: application/json

{
  "token": "{refresh_token}"
}
```

### Password Reset Flow

#### 1. Request Password Reset
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john.doe@example.com"
}
```

#### 2. Reset Password
```http
POST /auth/reset-password?token={reset_token}&userId={user_id}
Content-Type: application/json

{
  "newPassword": "newSecurePassword123"
}
```

## 🔧 Project Structure

```
src/
├── config/           # Environment and app configuration
│   └── app.config.ts
├── controllers/      # Request handlers and business logic
│   ├── auth.controller.ts
│   └── verify.controller.ts
├── Database/         # Database connection setup
│   └── DBConnect.ts
├── helper/          # Utility functions and templates
│   ├── emailTemplate.ts
│   └── fogotPassword.ts
├── middleware/      # Custom middleware functions
│   ├── admin.middleware.ts
│   ├── arcjet.middleware.ts
│   ├── auth.middleware.ts
│   └── error.middleware.ts
├── models/          # Mongoose schemas and models
│   ├── user.model.ts
│   └── verified.model.ts
├── routes/          # API route definitions
│   ├── auth.route.ts
│   └── verify.route.ts
└── server.ts        # Application entry point
```

## 🛠️ Technologies Used

### Core Stack
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.9+
- **Framework**: Express.js 5.1+
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)

### Security & Protection
- **Arcjet**: Advanced security platform
- **Helmet**: Security headers middleware
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing
- **Morgan**: HTTP request logger

### Development Tools
- **tsx**: TypeScript execution engine
- **nodemon**: Development auto-restart
- **TypeScript**: Static type checking
- **ES Modules**: Modern module system

### Email & Communication
- **Nodemailer**: Email sending
- **Mailtrap**: Email testing platform
- **HTML Templates**: Beautiful email designs

## 🧪 Testing

### Manual Testing with Postman

1. **Import Collection**: Use the provided Postman documentation
2. **Set Environment Variables**: Configure base URL and tokens
3. **Test Complete Flow**: Registration → Verification → Login → Protected Routes

### Testing Flow Example

```bash
# 1. Register new user
curl -X POST http://localhost:4000/api/v1/auth/signUp \
  -H "Content-Type: application/json" \
  -d '{"firstname":"Test","lastname":"User","email":"test@example.com","password":"password123"}'

# 2. Check email and verify (use token from email)
curl -X GET "http://localhost:4000/api/v1/verify-email?token=TOKEN&userId=USER_ID"

# 3. Login to get tokens
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🔐 Security Considerations

### JWT Token Management
- **Short-lived Access Tokens**: 2 minutes (configurable)
- **Longer Refresh Tokens**: 7 days (configurable)
- **Secure Token Storage**: Never store in localStorage in production
- **Token Rotation**: Refresh tokens on each use

### Password Security
- **Minimum Length**: 6 characters (configurable)
- **Hashing Algorithm**: bcryptjs with 12 salt rounds
- **Reset Tokens**: Cryptographically secure random tokens
- **Token Expiration**: 15-minute expiry for reset tokens

### Rate Limiting
- **Global Rate Limit**: 5 requests per 10 seconds per IP
- **Refill Strategy**: Token bucket algorithm
- **Bot Protection**: Intelligent bot detection with search engine allowlist

## 📊 Monitoring & Logging

### Development Logging
```typescript
// Morgan HTTP request logging
app.use(morgan("dev"));

// Custom error logging with stack traces
if (process.env.NODE_ENV !== "production") {
  console.error("🔥 Error:", err);
}
```

### Production Considerations
- Remove detailed error messages
- Implement proper logging service (Winston, etc.)
- Set up monitoring (Datadog, New Relic, etc.)
- Configure alerts for failed authentication attempts

## 🚀 Deployment

### Environment Variables Checklist
- [ ] `MONGO_URI` - Database connection string
- [ ] `JWT_SECRET` - Strong, unique JWT signing key
- [ ] `JWT_REFRESH_SECRET` - Separate refresh token secret
- [ ] `ARCJET_KEY` - Arcjet API key
- [ ] `MAIL_*` - Email service credentials
- [ ] `BASE_URL` - Frontend application URL
- [ ] `NODE_ENV=production`

### Database Indexes
Ensure these indexes exist in MongoDB for optimal performance:

```javascript
// Users collection
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "isEmailVerified": 1 })

// Email verification collection
db.emailverifications.createIndex({ "userId": 1 })
db.emailverifications.createIndex({ "tokenHash": 1 }, { unique: true })
db.emailverifications.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Use meaningful commit messages
- Add JSDoc comments for public functions
- Update documentation for API changes
- Ensure all tests pass before PR

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Arcjet** for advanced security protection
- **Mailtrap** for reliable email testing
- **MongoDB** team for excellent database tools
- **Express.js** community for the robust framework
- **TypeScript** team for type safety

## 📞 Support

- **Documentation**: [API Documentation](docs/api.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/AuthSystemAPI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/AuthSystemAPI/discussions)
- **Email**: [support@authsystemapi.dev](mailto:tabukeezekiel9@gmail.com)

---

<div align="center">
  <strong>Built with ❤️ and TypeScript</strong>
  <br>
  <sub>A production-ready authentication system for modern applications</sub>
</div>
