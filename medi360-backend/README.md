# MEDI-360 Backend API

**Personal Medical Assistance System**  
Academic Capstone Project | CMR University

---

## 🏥 Project Overview

MEDI-360 is an AI-assisted personal medical assistance system that provides:
- **Symptom Analysis** - AI-powered symptom checking with severity classification
- **Personalized Health Guidance** - Context-aware recommendations based on user health profiles
- **Chat History** - Persistent medical consultation records
- **Health Analytics** - Insights into health trends and patterns
- **Emergency Detection** - Automatic identification of critical symptoms

### Architecture Alignment

This implementation strictly follows the MEDI-360 Capstone Report:
- **Section 1.4**: Objectives - Disease prediction, personalized recommendations
- **Section 2.4**: Proposed System - Rule-based + AI-ready architecture
- **Section 3.1**: Functional Requirements - All modules implemented
- **Section 3.2**: System Architecture - Layered, modular design

---

## 🛠️ Technology Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt, helmet, rate limiting
- **Architecture**: RESTful API, MVC pattern

---

## 📁 Project Structure

```
medi360-backend/
├── server.js                 # Main application entry point
├── package.json              # Dependencies and scripts
├── .env.example              # Environment configuration template
│
├── models/                   # Database schemas
│   ├── User.model.js         # User authentication model
│   ├── HealthProfile.model.js # Health information model
│   └── ChatSession.model.js  # Conversation history model
│
├── controllers/              # Business logic
│   ├── auth.controller.js    # Authentication logic
│   ├── chat.controller.js    # Chatbot interactions
│   ├── healthProfile.controller.js # Health data management
│   └── analytics.controller.js # Health insights
│
├── routes/                   # API endpoints
│   ├── auth.routes.js        # /api/auth/*
│   ├── chat.routes.js        # /api/chat/*
│   ├── healthProfile.routes.js # /api/health-profile/*
│   ├── analytics.routes.js   # /api/analytics/*
│   └── user.routes.js        # /api/users/*
│
├── middleware/               # Custom middleware
│   ├── auth.js               # JWT verification
│   └── errorHandler.js       # Global error handling
│
├── services/                 # Core business services
│   └── medicalAI.service.js  # AI medical assistant
│
└── utils/                    # Helper functions
```

---

## 🚀 Getting Started

### Prerequisites

```bash
# Required
- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm or yarn
```

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd medi360-backend

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Start MongoDB (if local)
mongod

# 5. Run the server
npm run dev  # Development mode with nodemon
npm start    # Production mode
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000

# MongoDB
MONGO_URI=mongodb://localhost:27017/medi360

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d

# Security
BCRYPT_ROUNDS=10

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure123",
  "fullName": "John Doe",
  "phoneNumber": "9876543210"
}
```

**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { "id": "...", "email": "...", "fullName": "..." },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Health Profile Endpoints

#### Create Health Profile
```http
POST /api/health-profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "age": 28,
  "gender": "male",
  "bloodGroup": "O+",
  "height": { "value": 175, "unit": "cm" },
  "weight": { "value": 70, "unit": "kg" },
  "lifestyle": {
    "smokingStatus": "never",
    "exerciseFrequency": "moderate",
    "sleepHours": 7
  }
}
```

#### Get Health Profile
```http
GET /api/health-profile
Authorization: Bearer <token>
```

#### Add Medical Condition
```http
POST /api/health-profile/condition
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Hypertension",
  "diagnosedDate": "2023-01-15",
  "severity": "moderate",
  "notes": "Under medication"
}
```

### Chat Endpoints

#### Create Chat Session
```http
POST /api/chat/session
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionType": "symptom-check"
}
```

#### Send Message
```http
POST /api/chat/session/:sessionId/message
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "I have a severe headache and fever"
}
```

**AI Response Example**:
```json
{
  "success": true,
  "data": {
    "message": "I've analyzed your symptoms. Here's what I found:\n\n**Severity Level:** MODERATE\n\n**Possible Conditions:**\n• migraine (high likelihood)\n• viral infection (moderate likelihood)\n\n**Recommendations:**\n• Consider scheduling a doctor appointment\n• Stay hydrated and rest\n• Monitor temperature regularly\n\n**Important:** This system provides general medical guidance...",
    "analysis": {
      "severity": "moderate",
      "emergency": false,
      "symptoms": ["severe headache", "fever"]
    }
  }
}
```

#### Get Chat History
```http
GET /api/chat/sessions?limit=10&status=active
Authorization: Bearer <token>
```

### Analytics Endpoints

#### Get Dashboard
```http
GET /api/analytics/dashboard
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "healthScore": 75,
    "statistics": {
      "totalConsultations": 15,
      "emergencyConsultations": 1,
      "activeConditions": 2,
      "currentMedications": 1
    },
    "recentConsultations": [...]
  }
}
```

#### Get Symptom Analysis
```http
GET /api/analytics/symptoms?timeframe=30d
Authorization: Bearer <token>
```

#### Get Health Trends
```http
GET /api/analytics/trends
Authorization: Bearer <token>
```

---

## 🤖 AI Medical Assistant

### Current Implementation: Rule-Based System

The `MedicalAIService` uses a curated symptom knowledge base:

```javascript
{
  'chest pain': {
    categories: ['cardiovascular'],
    severity: 'high',
    emergency: true,
    relatedConditions: ['heart attack', 'angina']
  }
}
```

**Features**:
- ✅ Symptom recognition and categorization
- ✅ Severity classification (low/moderate/high/emergency)
- ✅ Emergency symptom detection
- ✅ Personalized recommendations based on health profile
- ✅ Medical disclaimer on all responses

### Future Enhancement: ML Integration

```javascript
// Placeholder for Phase 2
static async predictWithML(symptoms, healthProfile, vitalSigns) {
  // TODO: Implement
  // 1. Load trained Random Forest / LSTM model
  // 2. Preprocess input features
  // 3. Make prediction
  // 4. Return structured result
}
```

**Planned ML Models** (as per Report Section 2.2):
- Random Forest for disease classification
- LSTM for temporal health pattern analysis
- Neural Networks for complex diagnosis

---

## 🔒 Security Features

### Implemented Security Measures

1. **Password Security**
   - bcrypt hashing with configurable rounds
   - Minimum password length enforcement

2. **JWT Authentication**
   - Secure token generation
   - Token expiration handling
   - Protected route middleware

3. **API Security**
   - Helmet.js for HTTP headers
   - CORS configuration
   - Rate limiting (100 requests/15 minutes)
   - Input validation with express-validator

4. **Data Privacy**
   - Password field excluded from queries by default
   - User-scoped data access
   - Secure error messages (no data leakage)

### Future Security Enhancements

```javascript
// Phase 2: As per Report Section 2.4
// - AES-256 encryption for sensitive data
// - Federated learning for privacy-preserving ML
// - HIPAA/GDPR compliance modules
// - Two-factor authentication
```

---

## 🧪 Testing

### Manual API Testing with Postman

**Collection Setup**:
1. Import the Postman collection (if provided)
2. Set environment variables:
   - `BASE_URL`: http://localhost:5000/api
   - `TOKEN`: (obtained after login)

**Test Flow**:
```
1. Register User → Get Token
2. Login → Verify Token
3. Create Health Profile
4. Start Chat Session
5. Send Symptoms → Verify AI Response
6. Check Analytics Dashboard
```

### Automated Testing (Future)

```bash
# Run test suite
npm test

# Coverage report
npm run test:coverage
```

---

## 📊 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  fullName: String,
  phoneNumber: String,
  role: String (patient/doctor/admin),
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date
}
```

### HealthProfile Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  age: Number,
  gender: String,
  bloodGroup: String,
  height: { value: Number, unit: String },
  weight: { value: Number, unit: String },
  bmi: Number (auto-calculated),
  knownConditions: [{ name, diagnosedDate, severity }],
  allergies: [{ allergen, reaction, severity }],
  currentMedications: [{ name, dosage, frequency }],
  lifestyle: {
    smokingStatus, alcoholConsumption,
    exerciseFrequency, dietType, sleepHours
  }
}
```

### ChatSession Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  sessionTitle: String,
  sessionType: String,
  messages: [{
    role: String (user/assistant/system),
    content: String,
    timestamp: Date,
    metadata: { severity, identifiedSymptoms, recommendations }
  }],
  summary: {
    reportedSymptoms: [],
    overallSeverity: String,
    emergencyFlagged: Boolean
  },
  status: String (active/completed/archived)
}
```

---

## 🔄 Future Enhancements (Phase 2)

As outlined in the capstone report:

### 1. Machine Learning Integration
```javascript
// services/ml/
├── diseasePredictor.js      # Random Forest model
├── riskForecaster.js         # LSTM temporal analysis
└── pharmacogenomics.js       # Personalized medicine
```

### 2. Wearable Device Integration
```javascript
// services/iot/
└── wearableSync.js
// Features:
// - Real-time heart rate monitoring
// - Sleep pattern analysis
// - Activity level tracking
// - Continuous glucose monitoring
```

### 3. Hospital Resource Management
```javascript
// modules/hospital/
└── resourceForecasting.js
// Features:
// - ICU bed occupancy prediction
// - Oxygen demand forecasting
// - Emergency preparedness
```

### 4. Federated Learning
```javascript
// services/federated/
└── federatedTraining.js
// Features:
// - Privacy-preserving model training
// - Cross-hospital data collaboration
// - No raw data sharing
```

---

## 🎓 Academic Alignment

This implementation satisfies the capstone project requirements:

| Requirement | Implementation | Status |
|------------|----------------|--------|
| User Authentication | JWT-based secure auth | ✅ Complete |
| Health Profile Management | Comprehensive health data model | ✅ Complete |
| AI-Assisted Diagnosis | Rule-based + AI-ready architecture | ✅ Complete |
| Chat History | Persistent conversation storage | ✅ Complete |
| Emergency Detection | Automatic severity classification | ✅ Complete |
| Personalization | Health profile-based recommendations | ✅ Complete |
| Analytics | Health trends and insights | ✅ Complete |
| Security | Password hashing, JWT, rate limiting | ✅ Complete |
| Scalability | Modular, layered architecture | ✅ Complete |
| ML Integration | Placeholder for Phase 2 | 🔄 Future |
| Wearable Sync | Placeholder for Phase 2 | 🔄 Future |
| Federated Learning | Placeholder for Phase 2 | 🔄 Future |

---

## 📝 Viva Questions & Answers

### Q1: Where is AI used in the system?
**A**: AI is implemented in `services/medicalAI.service.js`:
- Rule-based symptom analysis (current)
- Severity classification algorithm
- Emergency detection logic
- Future: ML models for disease prediction (Random Forest, LSTM)

### Q2: How is data security ensured?
**A**: Multiple security layers:
1. Password hashing with bcrypt
2. JWT token-based authentication
3. Protected API routes via middleware
4. Rate limiting to prevent abuse
5. Input validation
6. Future: AES-256 encryption, federated learning

### Q3: How is personalization achieved?
**A**: Through health profile integration:
1. User-specific health data in HealthProfile model
2. AI service considers age, conditions, medications, lifestyle
3. Chat history provides conversation context
4. Recommendations adjusted based on risk factors

### Q4: What is the system architecture?
**A**: Layered, modular architecture:
- **Presentation**: RESTful API endpoints
- **Business Logic**: Controllers and Services
- **Data Access**: Mongoose models
- **Database**: MongoDB
- **Security**: Middleware layer (auth, error handling)

### Q5: How does the system scale?
**A**: Designed for scalability:
- Stateless JWT authentication (horizontal scaling)
- MongoDB sharding support
- Microservices-ready architecture
- Future: Load balancing, caching, CDN

---

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
Error: connect ECONNREFUSED 127.0.0.1:27017
Solution: Ensure MongoDB is running - `mongod` or check service status
```

**JWT Token Invalid**
```bash
Error: Not authorized - invalid token
Solution: Check token format: "Bearer <token>" in Authorization header
```

**Port Already in Use**
```bash
Error: Port 5000 is already in use
Solution: Change PORT in .env or kill the process using the port
```

---

## 📧 Support & Contact

**Project Team**: CMR University CSE Department
**Academic Year**: 2025-26
**Guide**: Dr. Jayarajan Kandaswamy

---

## 📄 License

This is an academic project for educational purposes.

---

**Note**: This backend is production-ready for demonstration and academic evaluation. For actual deployment in medical environments, additional certifications, compliance checks (HIPAA, GDPR, DPDP Act), and clinical validations are required.
