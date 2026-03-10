/**
 * MEDI-360 Chat Controller
 * ENGINE: Gemini 2.5 Flash (Proven to work)
 * FORMAT: Clean Text & Emojis (No ugly hashes)
 */

const ChatSession = require('../models/ChatSession.model');
const HealthProfile = require('../models/HealthProfile.model');
const Food = require('../models/Food.model');
const Exercise = require('../models/Exercise.model');
const WeightGoal = require('../models/WeightGoal.model');

// --- 1. Create Session ---
exports.createSession = async (req, res, next) => {
  try {
    const { sessionType } = req.body;
    
    const session = await ChatSession.create({
      user: req.user.id,
      sessionType: sessionType || 'symptom-check',
      sessionTitle: `Medical Consultation - ${new Date().toLocaleDateString()}`
    });
    
    // Clean Welcome Message
    const welcomeMessage = `Hello! 👋 I'm your MEDI-360 AI assistant.

I can help you with:
🩺 Checking Symptoms
💊 Home Remedies
🚑 When to see a Doctor

Please describe what you're feeling in detail.`;
    
    await session.addMessage('system', welcomeMessage, { 
      aiPowered: true,
      provider: 'MEDI-360 AI'
    });
    
    res.status(201).json({ success: true, data: { session } });
  } catch (error) { next(error); }
};

// --- 2. Send Message ---
exports.sendMessage = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;
    
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message is required' });
    
    const session = await ChatSession.findOne({ _id: sessionId, user: req.user.id });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    
    await session.addMessage('user', message);
    const healthProfile = await HealthProfile.findOne({ user: req.user.id });
    const weightGoal = await WeightGoal.findOne({ user: req.user.id });
    
    // Fetch summaries
    const todayStr = new Date().toISOString().split('T')[0];
    let foodSummary = null;
    let exerciseSummary = null;
    try {
      foodSummary = await Food.getDailyNutritionSummary(req.user.id, todayStr);
      exerciseSummary = await Exercise.getWeeklyActivitySummary(req.user.id, todayStr); // Using today as start is fine for simple usage, or a valid start date
    } catch(err) {
      console.error("Error fetching summaries for context", err);
    }
    
    const enhancedContext = {
      healthProfile,
      foodSummary,
      exerciseSummary,
      weightGoal
    };
    
    // --- CALL REAL AI (Gemini 2.5) ---
    let aiResponse;
    try {
      // Trying Gemini 2.5 Flash first (It worked for you before)
      aiResponse = await callGeminiClean(message, session, enhancedContext, 'gemini-2.5-flash');
    } catch (error) {
      console.error("Gemini 2.5 Failed:", error.message);
      try {
        // Fallback to Gemini 1.5 if 2.5 hiccups
        console.log("Retrying with Gemini 1.5...");
        aiResponse = await callGeminiClean(message, session, enhancedContext, 'gemini-1.5-flash');
    } catch (backupError) {
        console.log("⚠️ API Failed, switching to Local Backup...");
        aiResponse = generateSmartLocalResponse(message);
      }
    }
    
    const symptoms = extractSymptoms(message);
    const severity = detectSeverity(aiResponse);
    const isEmergency = detectEmergency(aiResponse);
    
    await session.addMessage('assistant', aiResponse, {
      severity,
      identifiedSymptoms: symptoms,
      aiPowered: true,
      provider: 'Gemini Clean'
    });
    
    if (isEmergency) session.summary.emergencyFlagged = true;
    session.summary.overallSeverity = severity;
    await session.save();
    
    res.json({
      success: true,
      data: {
        message: aiResponse,
        analysis: { severity, emergency: isEmergency, symptoms }
      }
    });
    
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ success: false, message: 'Server error processing request' });
  }
};

// --- 3. The "Clean Text" Prompt Engine ---
async function callGeminiClean(userMessage, session, enhancedContext, modelName) {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) throw new Error("GEMINI_API_KEY is missing");
  
  const { healthProfile, foodSummary, exerciseSummary, weightGoal } = enhancedContext;

  // INSTRUCTION: Do NOT use Markdown (hashes/asterisks)
  const systemPrompt = `You are MEDI-360, a professional Medical AI and Wellness Coach.
  
CONTEXT:
Patient Age: ${healthProfile?.age || 'Unknown'}
Gender: ${healthProfile?.gender || 'Unknown'}
Current Weight: ${weightGoal?.currentWeight || 'Unknown'} kg
Target Weight: ${weightGoal?.targetWeight || 'Unknown'} kg
Daily Calorie Target: ${weightGoal?.dailyCaloriesTarget || 'Unknown'} kcal

TODAY'S NUTRITION:
Calories Consumed: ${foodSummary?.totalCalories || 0} kcal
Protein: ${foodSummary?.totalProtein || 0}g
Carbs: ${foodSummary?.totalCarbs || 0}g
Fats: ${foodSummary?.totalFats || 0}g

WEEKLY EXERCISE:
Calories Burned: ${exerciseSummary?.weeklyTotals?.totalCaloriesBurned || 0} kcal
Active Minutes: ${exerciseSummary?.weeklyTotals?.totalActiveMinutes || 0} mins

INSTRUCTIONS:
1. Analyze the user's input safely and consider the context.
2. If the user asks about food, macros, or weight goals, use the context provided to give personalized advice.
3. Respond in PLAIN TEXT only. 
4. Do NOT use markdown symbols like #, *, or **.
5. Use Emojis for sections.
6. Use "•" for bullet points.

REQUIRED OUTPUT FORMAT (General Health):

🩺 ANALYSIS
[Brief explanation here]

💊 IMMEDIATE ADVICE
• [Step 1]
• [Step 2]

⚠️ WARNING SIGNS
• [Symptom to watch for]

---
Disclaimer: I am an AI. Please consult a doctor for a professional diagnosis.

REQUIRED OUTPUT FORMAT (Nutrition & Fitness):

🍏 NUTRITION & FITNESS REVIEW
[Brief personalized assessment based on context vs input]

💡 RECOMMENDATIONS
• [Step 1]
• [Step 2]

---
Disclaimer: I am an AI wellness coach, not a certified nutritionist.`;



  // Request Body
  const requestBody = {
    contents: [{
      parts: [{ text: `SYSTEM INSTRUCTIONS:\n${systemPrompt}\n\nUSER MESSAGE:\n${userMessage}\n\nAI RESPONSE:` }]
    }]
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Status ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// --- 4. Smart Local Backup (Clean Text) ---
function generateSmartLocalResponse(message) {
  const msg = message.toLowerCase();
  
  if (msg.includes('chest') || msg.includes('pain') && msg.includes('left')) {
    return `🚨 MEDICAL EMERGENCY

Possible heart issue detected.

🚑 ACTION PLAN
• Call 108/911 immediately.
• Do not drive yourself.
• Sit down and rest.

---
Please treat this as an emergency.`;
  }
  
  return `🩺 SYMPTOM ANALYSIS
I have noted your symptoms: "${message}".

💊 GENERAL ADVICE
• Rest: Allow your body to recover.
• Hydrate: Drink plenty of water.
• Monitor: Watch for fever or worsening pain.

⚠️ WHEN TO SEE A DOCTOR
• If symptoms persist > 24 hours.
• If pain becomes severe.

---
Disclaimer: This is an AI assessment.`;
}

// --- 5. Helpers ---
function extractSymptoms(message) {
  const commonSymptoms = ['fever', 'headache', 'pain', 'cough', 'nausea', 'vomiting', 'dizzy', 'tired', 'chest pain', 'rash'];
  return commonSymptoms.filter(s => message.toLowerCase().includes(s));
}

function detectSeverity(text) {
  const lower = text.toLowerCase();
  if (lower.includes('emergency') || lower.includes('call 911') || lower.includes('call 108')) return 'emergency';
  if (lower.includes('seek medical') || lower.includes('consult a doctor')) return 'moderate';
  return 'low';
}

function detectEmergency(text) { return detectSeverity(text) === 'emergency'; }

// --- 6. Other Routes ---
exports.getSession = async (req, res, next) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.sessionId, user: req.user.id });
    if (!session) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: { session } });
  } catch (error) { next(error); }
};

exports.getUserSessions = async (req, res, next) => {
  try {
    const sessions = await ChatSession.find({ user: req.user.id }).sort({ lastMessageAt: -1 }).limit(10);
    res.json({ success: true, count: sessions.length, data: { sessions } });
  } catch (error) { next(error); }
};

exports.completeSession = async (req, res, next) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.sessionId, user: req.user.id });
    if (session) await session.completeSession();
    res.json({ success: true, message: 'Session completed' });
  } catch (error) { next(error); }
};

exports.deleteSession = async (req, res, next) => {
  try {
    await ChatSession.findOneAndDelete({ _id: req.params.sessionId, user: req.user.id });
    res.json({ success: true, message: 'Session deleted' });
  } catch (error) { next(error); }
};