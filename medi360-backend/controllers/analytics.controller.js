/**
 * Analytics Controller
 * Provides health insights and statistics
 * 
 * Features:
 * - User symptom trends
 * - Health metrics summary
 * - Consultation history
 * - Risk assessment trends
 */

const ChatSession = require('../models/ChatSession.model');
const HealthProfile = require('../models/HealthProfile.model');

/**
 * @desc    Get user health analytics dashboard
 * @route   GET /api/analytics/dashboard
 * @access  Private
 */
exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get health profile
    const healthProfile = await HealthProfile.findOne({ user: userId });
    
    // Get chat statistics
    const totalConsultations = await ChatSession.countDocuments({ user: userId });
    const emergencyConsultations = await ChatSession.countDocuments({
      user: userId,
      'summary.emergencyFlagged': true
    });
    
    // Get recent consultations
    const recentConsultations = await ChatSession.find({ user: userId })
      .sort({ lastMessageAt: -1 })
      .limit(5)
      .select('sessionTitle summary status startedAt lastMessageAt');
    
    // Calculate health score (simple algorithm)
    let healthScore = 100;
    
    if (healthProfile) {
      // Deduct for risk factors
      if (healthProfile.bmi && (healthProfile.bmi < 18.5 || healthProfile.bmi > 30)) {
        healthScore -= 10;
      }
      
      if (healthProfile.lifestyle.smokingStatus === 'current') {
        healthScore -= 15;
      }
      
      if (healthProfile.lifestyle.alcoholConsumption === 'heavy') {
        healthScore -= 10;
      }
      
      if (healthProfile.lifestyle.exerciseFrequency === 'sedentary') {
        healthScore -= 10;
      }
      
      if (healthProfile.knownConditions.length > 0) {
        healthScore -= (healthProfile.knownConditions.length * 5);
      }
    }
    
    healthScore = Math.max(0, Math.min(100, healthScore));
    
    res.status(200).json({
      success: true,
      data: {
        healthScore,
        statistics: {
          totalConsultations,
          emergencyConsultations,
          activeConditions: healthProfile ? healthProfile.knownConditions.length : 0,
          currentMedications: healthProfile ? healthProfile.currentMedications.length : 0
        },
        recentConsultations,
        hasHealthProfile: !!healthProfile
      }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get symptom frequency analysis
 * @route   GET /api/analytics/symptoms
 * @access  Private
 */
exports.getSymptomAnalysis = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { timeframe = '30d' } = req.query;
    
    // Calculate date range
    const daysAgo = parseInt(timeframe) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    
    // Get chat sessions in timeframe
    const sessions = await ChatSession.find({
      user: userId,
      createdAt: { $gte: startDate }
    });
    
    // Aggregate symptoms
    const symptomFrequency = {};
    const severityDistribution = {
      low: 0,
      moderate: 0,
      high: 0,
      emergency: 0
    };
    
    sessions.forEach(session => {
      // Count symptoms
      if (session.summary.reportedSymptoms) {
        session.summary.reportedSymptoms.forEach(symptomObj => {
          const symptom = symptomObj.symptom;
          symptomFrequency[symptom] = (symptomFrequency[symptom] || 0) + 1;
        });
      }
      
      // Count severity
      if (session.summary.overallSeverity) {
        severityDistribution[session.summary.overallSeverity]++;
      }
    });
    
    // Sort symptoms by frequency
    const topSymptoms = Object.entries(symptomFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([symptom, count]) => ({ symptom, count }));
    
    res.status(200).json({
      success: true,
      data: {
        timeframe: `${daysAgo} days`,
        totalSessions: sessions.length,
        topSymptoms,
        severityDistribution
      }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get health trends over time
 * @route   GET /api/analytics/trends
 * @access  Private
 */
exports.getHealthTrends = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get all consultations grouped by month
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const sessions = await ChatSession.find({
      user: userId,
      createdAt: { $gte: sixMonthsAgo }
    }).sort({ createdAt: 1 });
    
    // Group by month
    const monthlyData = {};
    
    sessions.forEach(session => {
      const month = session.createdAt.toISOString().slice(0, 7); // YYYY-MM
      
      if (!monthlyData[month]) {
        monthlyData[month] = {
          consultations: 0,
          symptoms: new Set(),
          emergencies: 0
        };
      }
      
      monthlyData[month].consultations++;
      
      if (session.summary.emergencyFlagged) {
        monthlyData[month].emergencies++;
      }
      
      if (session.summary.reportedSymptoms) {
        session.summary.reportedSymptoms.forEach(s => {
          monthlyData[month].symptoms.add(s.symptom);
        });
      }
    });
    
    // Format for response
    const trends = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      consultations: data.consultations,
      uniqueSymptoms: data.symptoms.size,
      emergencies: data.emergencies
    }));
    
    res.status(200).json({
      success: true,
      data: { trends }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get health recommendations based on profile and history
 * @route   GET /api/analytics/recommendations
 * @access  Private
 */
exports.getPersonalizedRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const healthProfile = await HealthProfile.findOne({ user: userId });
    const recentSessions = await ChatSession.find({ user: userId })
      .sort({ lastMessageAt: -1 })
      .limit(10);
    
    const recommendations = [];
    
    // Health profile based recommendations
    if (healthProfile) {
      if (healthProfile.bmi && healthProfile.bmi > 30) {
        recommendations.push({
          category: 'Weight Management',
          priority: 'high',
          suggestion: 'Consider consulting a nutritionist for weight management guidance',
          reason: 'BMI indicates obesity range'
        });
      }
      
      if (healthProfile.lifestyle.smokingStatus === 'current') {
        recommendations.push({
          category: 'Lifestyle',
          priority: 'high',
          suggestion: 'Smoking cessation programs can significantly improve health',
          reason: 'Current smoking habit detected'
        });
      }
      
      if (healthProfile.lifestyle.exerciseFrequency === 'sedentary') {
        recommendations.push({
          category: 'Physical Activity',
          priority: 'moderate',
          suggestion: 'Start with 30 minutes of walking 3-4 times per week',
          reason: 'Low physical activity levels'
        });
      }
      
      if (healthProfile.lifestyle.sleepHours && healthProfile.lifestyle.sleepHours < 6) {
        recommendations.push({
          category: 'Sleep Health',
          priority: 'moderate',
          suggestion: 'Aim for 7-9 hours of sleep per night',
          reason: 'Insufficient sleep duration'
        });
      }
    }
    
    // Session history based recommendations
    const emergencyCount = recentSessions.filter(s => s.summary.emergencyFlagged).length;
    
    if (emergencyCount > 0) {
      recommendations.push({
        category: 'Medical Attention',
        priority: 'high',
        suggestion: 'Schedule a comprehensive health checkup with your doctor',
        reason: 'Recent emergency-level symptoms reported'
      });
    }
    
    // Generic recommendations if profile incomplete
    if (!healthProfile) {
      recommendations.push({
        category: 'Profile Completion',
        priority: 'high',
        suggestion: 'Complete your health profile for personalized recommendations',
        reason: 'Health profile not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { recommendations }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export user health data
 * @route   GET /api/analytics/export
 * @access  Private
 */
exports.exportHealthData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const healthProfile = await HealthProfile.findOne({ user: userId });
    const sessions = await ChatSession.find({ user: userId })
      .sort({ createdAt: -1 });
    
    const exportData = {
      generatedAt: new Date().toISOString(),
      healthProfile,
      consultationHistory: sessions.map(s => ({
        date: s.startedAt,
        type: s.sessionType,
        symptoms: s.summary.reportedSymptoms,
        severity: s.summary.overallSeverity,
        emergency: s.summary.emergencyFlagged
      }))
    };
    
    res.status(200).json({
      success: true,
      data: exportData
    });
    
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
