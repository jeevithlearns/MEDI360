/**
 * Chat Session Model
 * Stores user-chatbot conversations with context and analysis
 * 
 * Features:
 * - Persistent chat history
 * - Symptom tracking
 * - Severity classification
 * - Context-aware recommendations
 */

const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  
  content: {
    type: String,
    required: true
  },
  
  timestamp: {
    type: Date,
    default: Date.now
  },
  
  // Metadata for assistant messages
  metadata: {
    severity: {
      type: String,
      enum: ['low', 'moderate', 'high', 'emergency']
    },
    
    identifiedSymptoms: [String],
    
    recommendations: [String],
    
    disclaimerShown: {
      type: Boolean,
      default: false
    }
  }
});

const ChatSessionSchema = new mongoose.Schema({
  // User Reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Session Metadata
  sessionTitle: {
    type: String,
    default: 'Medical Consultation'
  },
  
  sessionType: {
    type: String,
    enum: ['symptom-check', 'general-query', 'medication-info', 'emergency'],
    default: 'symptom-check'
  },
  
  // Conversation History
  messages: [MessageSchema],
  
  // Session Summary
  summary: {
    reportedSymptoms: [{
      symptom: String,
      severity: String,
      reportedAt: Date
    }],
    
    overallSeverity: {
      type: String,
      enum: ['low', 'moderate', 'high', 'emergency']
    },
    
    keyRecommendations: [String],
    
    emergencyFlagged: {
      type: Boolean,
      default: false
    },
    
    referralRecommended: {
      type: Boolean,
      default: false
    }
  },
  
  // Session Status
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active'
  },
  
  // Timestamps
  startedAt: {
    type: Date,
    default: Date.now
  },
  
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  
  completedAt: Date,
  
  createdAt: {
    type: Date,
    default: Date.now
  }
  
}, {
  timestamps: true
});

// ======================
// INDEXES
// ======================

ChatSessionSchema.index({ user: 1, createdAt: -1 });
ChatSessionSchema.index({ status: 1 });
ChatSessionSchema.index({ 'summary.emergencyFlagged': 1 });

// ======================
// MIDDLEWARE
// ======================

// Update lastMessageAt on new message
ChatSessionSchema.pre('save', function(next) {
  if (this.messages && this.messages.length > 0) {
    this.lastMessageAt = this.messages[this.messages.length - 1].timestamp;
  }
  next();
});

// ======================
// METHODS
// ======================

// Add message to session
ChatSessionSchema.methods.addMessage = function(role, content, metadata = {}) {
  this.messages.push({
    role,
    content,
    timestamp: new Date(),
    metadata
  });
  
  this.lastMessageAt = new Date();
  return this.save();
};

// Analyze symptoms from messages
ChatSessionSchema.methods.analyzeSymptoms = function() {
  const symptoms = new Set();
  const severities = [];
  
  this.messages.forEach(msg => {
    if (msg.metadata && msg.metadata.identifiedSymptoms) {
      msg.metadata.identifiedSymptoms.forEach(s => symptoms.add(s));
    }
    
    if (msg.metadata && msg.metadata.severity) {
      severities.push(msg.metadata.severity);
    }
  });
  
  // Determine overall severity
  let overallSeverity = 'low';
  if (severities.includes('emergency')) {
    overallSeverity = 'emergency';
  } else if (severities.includes('high')) {
    overallSeverity = 'high';
  } else if (severities.includes('moderate')) {
    overallSeverity = 'moderate';
  }
  
  return {
    symptoms: Array.from(symptoms),
    overallSeverity,
    messageCount: this.messages.length
  };
};

// Complete session and generate summary
ChatSessionSchema.methods.completeSession = function() {
  const analysis = this.analyzeSymptoms();
  
  this.summary.reportedSymptoms = analysis.symptoms.map(s => ({
    symptom: s,
    severity: analysis.overallSeverity,
    reportedAt: new Date()
  }));
  
  this.summary.overallSeverity = analysis.overallSeverity;
  this.status = 'completed';
  this.completedAt = new Date();
  
  return this.save();
};

// Get conversation context for AI
ChatSessionSchema.methods.getConversationContext = function(limit = 10) {
  const recentMessages = this.messages.slice(-limit);
  
  return recentMessages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
};

// ======================
// STATICS
// ======================

// Get user's recent sessions
ChatSessionSchema.statics.getUserRecentSessions = function(userId, limit = 5) {
  return this.find({ user: userId })
    .sort({ lastMessageAt: -1 })
    .limit(limit)
    .select('sessionTitle sessionType summary status startedAt lastMessageAt');
};

// Get emergency sessions
ChatSessionSchema.statics.getEmergencySessions = function() {
  return this.find({ 'summary.emergencyFlagged': true, status: 'active' })
    .populate('user', 'fullName email phoneNumber')
    .sort({ lastMessageAt: -1 });
};

module.exports = mongoose.model('ChatSession', ChatSessionSchema);
