/**
 * Chat Controller
 * Handles medical chatbot interactions
 * 
 * Features:
 * - Symptom analysis
 * - Context-aware responses
 * - Emergency detection
 * - Personalized recommendations
 */

const ChatSession = require('../models/ChatSession.model');
const HealthProfile = require('../models/HealthProfile.model');
const MedicalAIService = require('../services/medicalAI.service');

/**
 * @desc    Create new chat session
 * @route   POST /api/chat/session
 * @access  Private
 */
exports.createSession = async (req, res, next) => {
  try {
    const { sessionType } = req.body;
    
    const session = await ChatSession.create({
      user: req.user.id,
      sessionType: sessionType || 'symptom-check',
      sessionTitle: `Medical Consultation - ${new Date().toLocaleDateString()}`
    });
    
    // Add welcome message
    await session.addMessage(
      'system',
      'Hello! I\'m your MEDI-360 medical assistant. I can help you understand your symptoms and provide general health guidance. Please describe your symptoms or health concerns.',
      { disclaimerShown: true }
    );
    
    res.status(201).json({
      success: true,
      message: 'Chat session created',
      data: { session }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send message in chat session
 * @route   POST /api/chat/session/:sessionId/message
 * @access  Private
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }
    
    // Find session
    const session = await ChatSession.findOne({
      _id: sessionId,
      user: req.user.id
    });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }
    
    // Add user message
    await session.addMessage('user', message);
    
    // Get user health profile for personalization
    const healthProfile = await HealthProfile.findOne({ user: req.user.id });
    
    // Extract symptoms from message
    const symptoms = this.extractSymptoms(message);
    
    // Analyze with AI service
    const analysis = MedicalAIService.analyzeSymptoms(
      symptoms,
      healthProfile,
      session.getConversationContext()
    );
    
    // Generate response
    const aiResponse = MedicalAIService.generateResponse(analysis, healthProfile);
    
    // Add AI response
    await session.addMessage('assistant', aiResponse, {
      severity: analysis.severity,
      identifiedSymptoms: analysis.identifiedSymptoms,
      recommendations: analysis.recommendations,
      disclaimerShown: true
    });
    
    // Update session summary
    if (analysis.emergencyDetected) {
      session.summary.emergencyFlagged = true;
    }
    
    session.summary.overallSeverity = analysis.severity;
    
    if (analysis.identifiedSymptoms && analysis.identifiedSymptoms.length > 0) {
      analysis.identifiedSymptoms.forEach(symptom => {
        session.summary.reportedSymptoms.push({
          symptom,
          severity: analysis.severity,
          reportedAt: new Date()
        });
      });
    }
    
    await session.save();
    
    res.status(200).json({
      success: true,
      data: {
        message: aiResponse,
        analysis: {
          severity: analysis.severity,
          emergency: analysis.emergencyDetected,
          symptoms: analysis.identifiedSymptoms
        }
      }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get chat session
 * @route   GET /api/chat/session/:sessionId
 * @access  Private
 */
exports.getSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    const session = await ChatSession.findOne({
      _id: sessionId,
      user: req.user.id
    });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { session }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's chat sessions
 * @route   GET /api/chat/sessions
 * @access  Private
 */
exports.getUserSessions = async (req, res, next) => {
  try {
    const { limit = 10, status } = req.query;
    
    const query = { user: req.user.id };
    
    if (status) {
      query.status = status;
    }
    
    const sessions = await ChatSession.find(query)
      .sort({ lastMessageAt: -1 })
      .limit(parseInt(limit))
      .select('sessionTitle sessionType summary status startedAt lastMessageAt');
    
    res.status(200).json({
      success: true,
      count: sessions.length,
      data: { sessions }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Complete chat session
 * @route   PUT /api/chat/session/:sessionId/complete
 * @access  Private
 */
exports.completeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    const session = await ChatSession.findOne({
      _id: sessionId,
      user: req.user.id
    });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }
    
    await session.completeSession();
    
    res.status(200).json({
      success: true,
      message: 'Session completed successfully',
      data: { session }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete chat session
 * @route   DELETE /api/chat/session/:sessionId
 * @access  Private
 */
exports.deleteSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    const session = await ChatSession.findOneAndDelete({
      _id: sessionId,
      user: req.user.id
    });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Session deleted successfully'
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: Extract symptoms from user message
 */
exports.extractSymptoms = (message) => {
  const normalizedMessage = message.toLowerCase();
  const symptoms = [];
  
  // Simple keyword extraction
  // Future Enhancement: Use NLP for better extraction
  
  const symptomKeywords = [
    'headache', 'fever', 'cough', 'pain', 'ache', 'nausea',
    'vomiting', 'dizziness', 'fatigue', 'shortness of breath',
    'chest pain', 'abdominal pain', 'sore throat', 'runny nose',
    'congestion', 'weakness', 'sweating', 'chills'
  ];
  
  symptomKeywords.forEach(keyword => {
    if (normalizedMessage.includes(keyword)) {
      symptoms.push(keyword);
    }
  });
  
  // If no specific symptoms found, return generic
  if (symptoms.length === 0) {
    symptoms.push('general discomfort');
  }
  
  return symptoms;
};

module.exports = exports;
