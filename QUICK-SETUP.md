# 🚀 QUICK SETUP GUIDE - 10 Minutes

## ⚡ Super Fast Setup

### Step 1: Get Gemini API Key (2 min) - FREE!

1. Open: **https://aistudio.google.com/app/apikey**
2. Click **"Create API Key"**
3. Copy the key (starts with `AIza...`)

---

### Step 2: Backend Setup (3 min)

```bash
cd medi360-backend

# Install
npm install

# Configure
cp .env.example .env

# Edit .env - Add your:
# - MongoDB URI (if not default)
# - Gemini API key
nano .env
```

**Your .env:**
```
MONGO_URI=mongodb://localhost:27017/medi360
GEMINI_API_KEY=AIzaSy...YourKeyHere
```

```bash
# Start
npm run dev
```

✅ Should see: "MongoDB Connected" & "Server running on port 5000"

---

### Step 3: Frontend Setup (3 min)

**NEW TERMINAL:**

```bash
cd medi360-frontend

# Install
npm install

# Start
npm run dev
```

✅ Should see: "Local: http://localhost:3000"

---

### Step 4: Test (2 min)

1. Open: **http://localhost:3000**
2. Click **"Get Started"**
3. Register account
4. Go to **Chat**
5. Type: **"I have a headache"**

✅ Should get intelligent AI response!

---

## ✅ Verification

### Backend Working:
```bash
curl http://localhost:5000/api/health
# Should return: {"success":true}
```

### Frontend Working:
- Open http://localhost:3000
- See animated landing page
- Can register/login

### AI Working:
- Chat gives intelligent responses
- Not template responses
- References your health profile

---

## 🐛 Issues?

### MongoDB not running:
```bash
# Start MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # Mac
```

### Port 5000 already in use:
```bash
# Change in .env
PORT=5001
```

### API Key error:
```bash
# Check .env has:
GEMINI_API_KEY=AIza...
# No spaces, no quotes
```

---

## 🎉 Done!

Your MEDI-360 with AI is running!

**Test AI:**
- Go to Chat
- Type symptoms
- Get intelligent responses

**Enjoy!** 🚀
