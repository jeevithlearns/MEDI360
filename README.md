# 🏥 MEDI-360 — Personal Medical Assistance System

> **A full-stack AI-powered health platform** featuring a REST API backend, a React web application, and a React Native mobile app — all powered by Google Gemini AI.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Quick Start](#quick-start)
   - [Prerequisites](#prerequisites)
   - [Environment Setup](#environment-setup)
   - [Running the Backend](#running-the-backend)
   - [Running the Frontend (Web)](#running-the-frontend-web)
   - [Running the Mobile App](#running-the-mobile-app)
6. [Backend API Reference](#backend-api-reference)
   - [Authentication](#authentication-routes)
   - [Health Profile](#health-profile-routes)
   - [Food & Nutrition](#food--nutrition-routes)
   - [Exercise & Activity](#exercise--activity-routes)
   - [Health Insights](#health-insights-routes)
   - [Weight Goal](#weight-goal-routes)
   - [AI Chat (Medical Assistant)](#ai-chat-routes)
   - [Prescriptions](#prescription-routes)
   - [Medicines & Reminders](#medicine--reminder-routes)
7. [Frontend Pages & Routes](#frontend-pages--routes)
8. [Mobile Screens](#mobile-screens)
9. [Backend Architecture](#backend-architecture)
10. [Database Models](#database-models)
11. [AI & Services Layer](#ai--services-layer)
12. [Security](#security)
13. [Environment Variables](#environment-variables)
14. [Scripts Reference](#scripts-reference)
15. [Contributing](#contributing)
16. [License](#license)

---

## Overview

MEDI-360 is a comprehensive personal health management platform that combines traditional health tracking with cutting-edge AI capabilities. It enables users to:

- Track daily meals and calories with AI-assisted food analysis
- Log workouts and get exercise recommendations
- Chat with an AI medical assistant for symptom checking
- Upload and parse prescriptions using OCR + AI
- Monitor health metrics through rich analytics dashboards
- Set and track weight loss / gain goals
- Receive smart medicine reminders
- View personalized health insights and ML-driven predictions

The system is built across three sub-projects:

| Sub-project | Technology | Purpose |
|---|---|---|
| `medi360-backend` | Node.js + Express + MongoDB | REST API server |
| `medi360-frontend` | React 18 + Vite + TailwindCSS | Web application |
| `medi360-mobile` | React Native + Expo | iOS & Android mobile app |

---

## Features

### 🤖 AI-Powered Capabilities
- **AI Food Analysis** — Describe a meal in natural language; Gemini AI extracts nutritional data automatically
- **AI Workout Analysis** — Describe a workout; AI calculates calories burned and logs the activity
- **Medical AI Chat** — Symptom checker and health Q&A powered by Gemini with severity assessment and emergency detection
- **Prescription OCR** — Upload a photo of a prescription; AI extracts medicine names, dosages, and schedules
- **Personalized Recommendations** — AI-generated food and exercise recommendations based on your health profile
- **ML Predictions** — Machine-learning driven health predictions and risk scoring

### 📊 Health Tracking & Analytics
- **Food Tracking** — Daily meal logging with calories, macros (protein, carbs, fat, fiber)
- **Exercise Tracking** — Workout logging with MET-based calorie burn calculations
- **Nutrition Dashboard** — Daily/weekly nutrition summaries and trend charts
- **Weight Goal Tracking** — Set targets, log progress, view graphical progress
- **Medical Insights** — AI-generated health insights based on aggregated health data
- **Overall Analysis** — Cross-domain health report combining nutrition, activity, and health metrics

### 🔐 Authentication & Security
- JWT-based stateless authentication
- bcrypt password hashing
- Role-based route protection (middleware guards)
- Helmet security headers
- Configurable rate limiting (dev: 10,000 req/window, prod: 100 req/window)
- CORS configured per environment

### 📱 Cross-Platform
- Full-featured **Web App** (React + Vite)
- Native **Mobile App** (React Native + Expo) for iOS and Android
- Shared backend API consumed by both clients

### 💊 Medicine & Prescription Management
- Upload prescription images → AI parses medicine details
- View prescription history
- Set medicine reminders
- Automated reminder engine via `node-cron`

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | Runtime |
| **Express.js 4** | Web framework |
| **MongoDB** | NoSQL database |
| **Mongoose 8** | ODM / schema modeling |
| **@google/generative-ai** | Gemini AI SDK |
| **jsonwebtoken** | JWT authentication |
| **bcryptjs** | Password hashing |
| **express-rate-limit** | Rate limiting |
| **express-validator** | Input validation |
| **helmet** | HTTP security headers |
| **morgan** | HTTP request logging |
| **node-cron** | Scheduled tasks (reminders) |
| **axios** | HTTP client (external APIs) |
| **dotenv** | Environment management |
| **nodemon** | Dev auto-restart |

### Frontend (Web)
| Technology | Purpose |
|---|---|
| **React 18** | UI library |
| **Vite 5** | Build tool & dev server |
| **React Router DOM 6** | Client-side routing |
| **TailwindCSS 3** | Utility-first styling |
| **Recharts** | Data visualization / charts |
| **Axios** | HTTP client |
| **react-hot-toast** | Toast notifications |
| **react-icons** | Icon library |
| **@headlessui/react** | Accessible UI components |
| **date-fns** | Date utilities |

### Mobile (React Native)
| Technology | Purpose |
|---|---|
| **React Native 0.83** | Cross-platform native UI |
| **Expo ~55** | Managed RN workflow |
| **React Navigation 7** | Screen navigation |
| **expo-notifications** | Push notifications |
| **expo-image-picker** | Camera / gallery access |
| **expo-linear-gradient** | Gradient UI elements |
| **react-native-chart-kit** | Native charts |
| **lucide-react-native** | Icon library |
| **AsyncStorage** | Local persistent storage |
| **Axios** | HTTP client |

---

## Project Structure

```
MEDI360-main/
├── medi360-backend/              # Express REST API
│   ├── controllers/              # Route handler logic
│   │   ├── auth.controller.js
│   │   ├── food.controller.js
│   │   ├── exercise.controller.js
│   │   ├── healthProfile.controller.js
│   │   ├── healthInsights.controller.js
│   │   ├── chat.controller.js
│   │   ├── prescription.controller.js
│   │   ├── medicine.controller.js
│   │   ├── reminder.controller.js
│   │   ├── weightGoal.controller.js
│   │   └── analytics.controller.js
│   ├── middleware/               # Express middleware
│   │   ├── auth.js               # JWT protect middleware
│   │   └── errorHandler.js       # Global error handler
│   ├── models/                   # Mongoose schemas
│   │   ├── User.model.js
│   │   ├── HealthProfile.model.js
│   │   ├── Food.model.js
│   │   ├── Exercise.model.js
│   │   ├── ChatSession.model.js
│   │   ├── Prescription.model.js
│   │   ├── Medicine.model.js
│   │   └── WeightGoal.model.js
│   ├── routes/                   # Express routers
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── food.routes.js
│   │   ├── exercise.routes.js
│   │   ├── healthInsights.routes.js
│   │   ├── healthProfile.routes.js
│   │   ├── weightGoal.routes.js
│   │   ├── prescription.routes.js
│   │   ├── medicine.routes.js
│   │   ├── reminder.routes.js
│   │   ├── chat.routes.js
│   │   └── analytics.routes.js
│   ├── services/                 # Business logic & AI services
│   │   ├── medicalAI.service.js  # Core Gemini AI integration
│   │   ├── aiAnalysisService.js  # Food/exercise AI analysis
│   │   ├── mlPrediction.service.js # ML health predictions
│   │   ├── contextEngine.js      # Health context builder
│   │   ├── geminiContextBuilder.js
│   │   ├── nutritionCalculator.js
│   │   ├── exerciseCalculator.js
│   │   ├── weightPlannerService.js
│   │   ├── ocrService.js         # Prescription OCR
│   │   └── reminderEngine.js     # Cron-based reminders
│   ├── utils/                    # Helper utilities
│   ├── .env.example              # Environment template
│   ├── package.json
│   └── server.js                 # App entry point
│
├── medi360-frontend/             # React Web App
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Layout.jsx        # App shell (sidebar + nav)
│   │   │   ├── PrivateRoute.jsx  # Auth guard component
│   │   │   ├── ActivitySummary.jsx
│   │   │   ├── NutritionSummary.jsx
│   │   │   ├── FoodForm.jsx
│   │   │   ├── ExerciseForm.jsx
│   │   │   └── UiComponents.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state
│   │   ├── pages/                # Page-level components (22 pages)
│   │   ├── services/             # API service layer
│   │   ├── App.jsx               # Router configuration
│   │   ├── main.jsx              # Entry point
│   │   └── index.css             # Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── medi360-mobile/               # React Native App
    ├── src/
    │   ├── screens/              # App screens (12 screens)
    │   ├── components/           # Native UI components
    │   ├── navigation/           # React Navigation setup
    │   ├── services/             # API client & AuthContext
    │   └── theme.js              # Design tokens (colors, spacing)
    ├── App.js                    # Root component
    ├── app.json                  # Expo config
    └── package.json
```

---

## Quick Start

### Prerequisites

Make sure you have the following installed:

| Tool | Version | Notes |
|---|---|---|
| **Node.js** | ≥ 18.x | [nodejs.org](https://nodejs.org) |
| **npm** | ≥ 9.x | Comes with Node |
| **MongoDB** | ≥ 6.x | Local or [Atlas](https://mongodb.com/atlas) |
| **Expo CLI** | Latest | `npm install -g expo-cli` (for mobile) |
| **Git** | Any | |

You also need a free **Google Gemini API key**:
👉 [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

---

### Environment Setup

Copy the example environment file into the backend folder:

```bash
cd medi360-backend
copy .env.example .env
```

Edit `.env` and fill in your values:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/medi360
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:5173
GEMINI_API_KEY=AIzaSy...your-key-here
```

> ⚠️ **Never commit your `.env` file.** It is listed in `.gitignore` by default.

---

### Running the Backend

```bash
cd medi360-backend
npm install
npm run dev      # Development (nodemon, auto-restart)
# or
npm start        # Production
```

The API server will start at: **`http://localhost:5000`**

Health check endpoint: `GET http://localhost:5000/api/health`

---

### Running the Frontend (Web)

```bash
cd medi360-frontend
npm install
npm run dev
```

The web app will be available at: **`http://localhost:5173`**

> Make sure the backend is running first.

For a production build:
```bash
npm run build
npm run preview
```

---

### Running the Mobile App

```bash
cd medi360-mobile
npm install
npm start           # Opens Expo Dev Tools
# or
npm run android     # Android emulator
npm run ios         # iOS simulator (macOS only)
```

> Make sure the backend API URL in `src/services/api.js` is configured to point to your backend server (e.g., your machine's local IP when testing on a physical device).

---

## Backend API Reference

All routes are prefixed with `/api`. All protected routes require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

---

### Authentication Routes
**Base:** `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | ❌ | Register a new user |
| `POST` | `/login` | ❌ | Login and receive JWT |
| `GET` | `/me` | ✅ | Get current user info |
| `POST` | `/logout` | ✅ | Logout |
| `PUT` | `/password` | ✅ | Update password |

**Register body:**
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword"
}
```

**Login body:**
```json
{
  "email": "jane@example.com",
  "password": "securepassword"
}
```

**Login response:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": { "_id": "...", "fullName": "Jane Doe", "email": "jane@example.com" }
}
```

---

### Health Profile Routes
**Base:** `/api/health-profile` | 🔒 All routes protected

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/` | Create health profile |
| `GET` | `/` | Get user's health profile |
| `PUT` | `/` | Update health profile |
| `DELETE` | `/` | Delete health profile |
| `GET` | `/risk-summary` | Get AI-powered risk assessment |
| `POST` | `/condition` | Add a medical condition |
| `POST` | `/allergy` | Add an allergy |
| `POST` | `/medication` | Add a current medication |
| `POST` | `/check-medication` | Check medication compatibility |

**Create / Update profile body:**
```json
{
  "age": 30,
  "gender": "female",
  "height": 165,
  "weight": 65,
  "bloodType": "O+",
  "conditions": [],
  "allergies": [],
  "medications": [],
  "activityLevel": "moderate"
}
```

---

### Food & Nutrition Routes
**Base:** `/api/food` | 🔒 All routes protected

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/` | Manually add a meal |
| `POST` | `/analyze` | 🤖 AI-analyze and log a meal |
| `GET` | `/date/:date` | Get meals for a specific date (YYYY-MM-DD) |
| `GET` | `/summary/daily/:date` | Get daily nutrition summary |
| `GET` | `/summary/weekly/:startDate?` | Get weekly nutrition summary |
| `GET` | `/recent` | Get meals from last 7 days |
| `GET` | `/insights` | Get AI nutrition insights (30 days) |
| `GET` | `/recommendations` | Get AI food recommendations |
| `PUT` | `/:mealId` | Update a meal entry |
| `DELETE` | `/:mealId` | Delete a meal entry |

**AI Analyze Meal body:**
```json
{
  "description": "I had a bowl of oatmeal with banana and a cup of black coffee for breakfast"
}
```

**Manual Add Meal body:**
```json
{
  "name": "Oatmeal with banana",
  "mealType": "breakfast",
  "calories": 350,
  "protein": 10,
  "carbs": 65,
  "fat": 6,
  "fiber": 8
}
```

---

### Exercise & Activity Routes
**Base:** `/api/exercise` | 🔒 All routes protected

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/` | Manually log an exercise |
| `POST` | `/analyze` | 🤖 AI-analyze and log a workout |
| `GET` | `/date/:date` | Get exercises for a specific date |
| `GET` | `/summary/daily/:date` | Get daily activity summary |
| `GET` | `/summary/weekly/:startDate?` | Get weekly activity summary |
| `GET` | `/summary/monthly/:year/:month` | Get monthly activity overview |
| `GET` | `/recent` | Get recent exercises (last 7 days) |
| `GET` | `/insights` | Get AI exercise insights (30 days) |
| `GET` | `/recommendations` | Get personalized exercise recommendations |
| `PUT` | `/:exerciseId` | Update an exercise entry |
| `DELETE` | `/:exerciseId` | Delete an exercise entry |

**AI Analyze Workout body:**
```json
{
  "description": "I jogged for 30 minutes at a moderate pace along the park trail"
}
```

---

### Health Insights Routes
**Base:** `/api/health-insights` | 🔒 All routes protected

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard` | Get comprehensive health dashboard |
| `GET` | `/weekly` | Get combined weekly health summary |
| `GET` | `/recommendations` | Get overall health recommendations |
| `GET` | `/personalized` | Get AI recommendation engine insights |
| `GET` | `/progress/:weeks?` | Get progress over N weeks (default: 4) |

---

### Weight Goal Routes
**Base:** `/api/weight-goal` | 🔒 All routes protected

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/` | Set a weight goal |
| `GET` | `/` | Get current weight goal and progress |

**Set Weight Goal body:**
```json
{
  "currentWeight": 80,
  "targetWeight": 72,
  "targetDate": "2025-12-31",
  "goalType": "lose"
}
```

---

### AI Chat Routes
**Base:** `/api/chat` | 🔒 All routes protected

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/session` | Create a new chat session |
| `GET` | `/sessions` | Get all user chat sessions |
| `GET` | `/session/:sessionId` | Get a specific chat session |
| `PUT` | `/session/:sessionId/complete` | Mark a session as complete |
| `DELETE` | `/session/:sessionId` | Delete a session |
| `POST` | `/session/:sessionId/message` | Send a message in a session |

**Create Session body:**
```json
{
  "sessionType": "symptom-check"
}
```

**Send Message body:**
```json
{
  "message": "I have had a headache and mild fever for 2 days"
}
```

**Message response includes AI severity analysis:**
```json
{
  "success": true,
  "data": {
    "message": "Based on your symptoms...",
    "analysis": {
      "severity": "moderate",
      "emergency": false,
      "conditions": ["tension headache", "viral infection"]
    }
  }
}
```

---

### Prescription Routes
**Base:** `/api/prescriptions` | 🔒 All routes protected

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/upload` | Upload a prescription (image → AI OCR parse) |
| `GET` | `/` | Get all prescriptions |
| `GET` | `/:id` | Get a specific prescription |

---

### Medicine & Reminder Routes
**Base:** `/api/medicine` and `/api/reminders` | 🔒 All routes protected

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/medicine` | Get all medicines |
| `GET` | `/api/reminders` | Get all reminders |

---

### Analytics Routes
**Base:** `/api/analytics` | 🔒 All routes protected

Provides aggregated analytics data for charts and dashboards.

---

### Health Check
```http
GET /api/health
```
```json
{
  "success": true,
  "message": "MEDI-360 API is running",
  "timestamp": "2026-03-18T08:00:00.000Z",
  "environment": "development",
  "version": "1.0.0"
}
```

---

## Frontend Pages & Routes

The web app uses React Router DOM v6. All protected routes are wrapped with `<PrivateRoute>` which redirects to `/login` if not authenticated.

| Route | Component | Auth | Description |
|---|---|---|---|
| `/` | `LandingPage` | ❌ | Marketing landing page |
| `/login` | `Login` | ❌ | User login form |
| `/register` | `Register` | ❌ | New user registration |
| `/dashboard` | `Dashboard` | ✅ | Main health dashboard |
| `/overall-analysis` | `OverallAnalysis` | ✅ | Cross-domain health report |
| `/health-profile` | `HealthProfile` | ✅ | View/edit health profile |
| `/chat` | `Chat` | ✅ | AI health assistant chat |
| `/food-tracking` | `FoodTracking` | ✅ | Log and view meals |
| `/exercise-tracking` | `ExerciseTracking` | ✅ | Log and view workouts |
| `/weight-goal` | `WeightGoalDashboard` | ✅ | Set and track weight goals |
| `/prescription-upload` | `PrescriptionUpload` | ✅ | Upload prescription images |
| `/prescriptions` | `PrescriptionHistory` | ✅ | View prescription history |
| `/reminders` | `MedicineReminderDashboard` | ✅ | Manage medicine reminders |
| `/404` | `NotFound` | ❌ | 404 error page |

### Key Frontend Components

| Component | Description |
|---|---|
| `Layout.jsx` | App shell with sidebar navigation and top bar |
| `PrivateRoute.jsx` | Higher-order component for route protection |
| `AuthContext.jsx` | Global auth state (login, logout, token management) |
| `UiComponents.jsx` | Shared UI primitives (buttons, cards, badges) |
| `FoodForm.jsx` | Meal input form with AI-analyze functionality |
| `ExerciseForm.jsx` | Workout input form with AI-analyze functionality |
| `ActivitySummary.jsx` | Daily activity stats summary card |
| `NutritionSummary.jsx` | Daily nutrition stats summary card |

---

## Mobile Screens

The React Native mobile app features 12 screens:

| Screen | Description |
|---|---|
| `LoginScreen` | User authentication |
| `RegisterScreen` | New account creation |
| `DashboardScreen` | Home dashboard with health overview |
| `HealthProfileScreen` | Health profile management |
| `MedicalChatScreen` | AI health assistant (Gemini-powered) |
| `FoodTrackingScreen` | Log meals and view nutrition |
| `ExerciseTrackingScreen` | Log workouts and activity |
| `WeightGoalScreen` | Set and track weight goals |
| `PrescriptionUploadScreen` | Camera upload for prescriptions |
| `MedicineReminderScreen` | Manage medicine reminders |
| `MedicalHubScreen` | Medical hub and drug safety info |
| `DrugSafetyScreen` | Drug interaction and safety checks |

### Mobile Navigation Structure
- **Auth Stack** — Login → Register (unauthenticated users)
- **App Navigator** — Tab/stack navigation (authenticated users)
  - Bottom tab: Dashboard, Food, Exercise, Medical Chat, More

---

## Backend Architecture

```
Request → Express → Rate Limiter → CORS → Auth Middleware (JWT)
       → Route Handler → Controller → Service Layer → Database (MongoDB)
                                               ↕
                                        Gemini AI API
```

### Layer Responsibilities

| Layer | Responsibility |
|---|---|
| **Routes** | Define HTTP method + path, attach middleware |
| **Middleware** | JWT auth, input validation, error handling |
| **Controllers** | Parse request, call services, format response |
| **Services** | Business logic, AI calls, data calculations |
| **Models** | MongoDB schema definitions and methods |

---

## Database Models

### `User`
| Field | Type | Description |
|---|---|---|
| `fullName` | String | User's full name |
| `email` | String (unique) | Login email |
| `password` | String (hashed) | bcrypt hashed password |
| `role` | String | `user` or `admin` |
| `isActive` | Boolean | Account status |
| `createdAt` | Date | Auto timestamp |

### `HealthProfile`
| Field | Type | Description |
|---|---|---|
| `user` | ObjectId | Reference to User |
| `age` | Number | Age of user |
| `gender` | String | Gender |
| `height` | Number | Height in cm |
| `weight` | Number | Weight in kg |
| `bloodType` | String | Blood group |
| `activityLevel` | String | sedentary/light/moderate/active |
| `conditions` | Array | Medical conditions |
| `allergies` | Array | Known allergies |
| `medications` | Array | Current medications |

### `Food`
| Field | Type | Description |
|---|---|---|
| `user` | ObjectId | Reference to User |
| `name` | String | Meal name |
| `mealType` | String | breakfast/lunch/dinner/snack |
| `calories` | Number | Total calories |
| `protein` | Number | Grams of protein |
| `carbs` | Number | Grams of carbohydrates |
| `fat` | Number | Grams of fat |
| `fiber` | Number | Grams of fiber |
| `date` | Date | Date of meal |
| `aiGenerated` | Boolean | Whether AI analyzed this |

### `Exercise`
| Field | Type | Description |
|---|---|---|
| `user` | ObjectId | Reference to User |
| `name` | String | Exercise/activity name |
| `type` | String | cardio/strength/flexibility/sports |
| `duration` | Number | Duration in minutes |
| `caloriesBurned` | Number | Estimated calories burned |
| `date` | Date | Date of exercise |
| `aiGenerated` | Boolean | Whether AI analyzed this |

### `ChatSession`
| Field | Type | Description |
|---|---|---|
| `user` | ObjectId | Reference to User |
| `sessionType` | String | Type of chat (e.g., symptom-check) |
| `messages` | Array | Array of `{role, content, metadata, timestamp}` |
| `status` | String | active / completed |
| `summary` | String | AI-generated session summary |

### `Prescription`
| Field | Type | Description |
|---|---|---|
| `user` | ObjectId | Reference to User |
| `imageData` | String | Base64 encoded image |
| `parsedData` | Object | AI-extracted medicine data |
| `uploadedAt` | Date | Timestamp |

### `Medicine`
| Field | Type | Description |
|---|---|---|
| `user` | ObjectId | Reference to User |
| `name` | String | Medicine name |
| `dosage` | String | Dosage instructions |
| `frequency` | String | How often to take |

### `WeightGoal`
| Field | Type | Description |
|---|---|---|
| `user` | ObjectId | Reference to User |
| `currentWeight` | Number | Starting weight (kg) |
| `targetWeight` | Number | Goal weight (kg) |
| `targetDate` | Date | Target completion date |
| `goalType` | String | lose / gain / maintain |

---

## AI & Services Layer

### `medicalAI.service.js`
Core service wrapping the Google Gemini API. Handles:
- Chat conversations with medical context
- Symptom analysis and severity classification
- Emergency detection
- Health recommendations

### `aiAnalysisService.js`
AI-powered analysis for food and exercise:
- Parses natural language food descriptions → nutritional data
- Parses natural language workout descriptions → exercise data

### `mlPrediction.service.js`
Machine learning predictions for:
- Health risk assessment
- Trend analysis
- Predictive health metrics

### `contextEngine.js` + `geminiContextBuilder.js`
Builds rich context from user's health profile and history before making AI calls, ensuring recommendations are personalized and accurate.

### `nutritionCalculator.js`
Calculates BMR (Basal Metabolic Rate), TDEE (Total Daily Energy Expenditure), and macro targets based on health profile.

### `exerciseCalculator.js`
MET-based calorie burn calculations for various exercise types.

### `weightPlannerService.js`
Generates weekly calorie deficit/surplus plans to reach weight goals by `targetDate`.

### `ocrService.js`
Processes prescription images using Gemini Vision to extract:
- Medicine names
- Dosages
- Frequencies
- Doctor's instructions

### `reminderEngine.js`
`node-cron` based background task that:
- Runs on a schedule
- Checks due medicine reminders
- Triggers notification delivery

---

## Security

| Feature | Implementation |
|---|---|
| **Authentication** | JWT with configurable expiry (default 7d) |
| **Password Storage** | bcrypt with configurable rounds (default 10) |
| **HTTP Headers** | `helmet` for XSS, clickjacking, MIME sniffing protection |
| **Rate Limiting** | `express-rate-limit` — 100 req/15min (prod), 10,000/15min (dev) |
| **Input Validation** | `express-validator` on all public-facing inputs |
| **CORS** | Configurable origin via `CORS_ORIGIN` env variable |
| **Error Handling** | Centralized error handler, no stack traces exposed in prod |

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | ✅ | `development` | Environment mode |
| `PORT` | ✅ | `5000` | Server port |
| `MONGO_URI` | ✅ | — | MongoDB connection string |
| `JWT_SECRET` | ✅ | — | Secret key for JWT signing |
| `JWT_EXPIRE` | ❌ | `7d` | JWT token expiry |
| `BCRYPT_ROUNDS` | ❌ | `10` | bcrypt hashing rounds |
| `CORS_ORIGIN` | ✅ | `http://localhost:3000` | Allowed CORS origin |
| `GEMINI_API_KEY` | ✅ | — | Google Gemini AI API key |
| `RATE_LIMIT_WINDOW_MS` | ❌ | `900000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX_REQUESTS` | ❌ | `100` | Max requests per window |

---

## Scripts Reference

### Backend (`medi360-backend`)
```bash
npm start          # Start production server (node server.js)
npm run dev        # Start development server (nodemon)
npm test           # Run tests with coverage (jest)
```

### Frontend Web (`medi360-frontend`)
```bash
npm run dev        # Start Vite dev server (http://localhost:5173)
npm run build      # Build production bundle to /dist
npm run preview    # Preview production build locally
npm run lint       # Lint JS/JSX files with ESLint
```

### Mobile (`medi360-mobile`)
```bash
npm start          # Start Expo dev server
npm run android    # Launch on Android emulator
npm run ios        # Launch on iOS simulator (macOS only)
npm run web        # Launch in browser (Expo Web)
```

---

## Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes: `git commit -m "feat: add your feature"`
4. **Push** to the branch: `git push origin feature/your-feature-name`
5. **Open a Pull Request**

### Commit Message Convention
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation update
- `style:` — Code style / formatting
- `refactor:` — Code refactoring
- `test:` — Adding or updating tests

---

## License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 CMRU CSE Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

> **⚠️ Medical Disclaimer:** MEDI-360 is a personal health management tool for informational purposes only. It is **not** a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical decisions.
