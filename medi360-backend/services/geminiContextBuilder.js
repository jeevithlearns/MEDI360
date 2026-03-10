const HealthProfile = require('../models/HealthProfile.model');
const Medicine = require('../models/Medicine.model');
const Prescription = require('../models/Prescription.model');
const Food = require('../models/Food.model');
const Exercise = require('../models/Exercise.model');
const WeightGoal = require('../models/WeightGoal.model');

// Build Comprehensive Context for Gemini
exports.buildHealthContext = async (userId) => {
  try {
    const healthProfile = await HealthProfile.findOne({ user: userId });
    
    // Fetch Active Medicines
    const now = new Date();
    const activeMedicines = await Medicine.find({
      user: userId,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    // Fetch Recent Prescriptions (Last 5)
    const prescriptionHistory = await Prescription.find({ user: userId })
      .sort({ issuedDate: -1 })
      .limit(5);

    const weightGoal = await WeightGoal.findOne({ user: userId });
    
    const todayStr = new Date().toISOString().split('T')[0];
    let foodSummary = null;
    let exerciseSummary = null;

    try {
      foodSummary = await Food.getDailyNutritionSummary(userId, todayStr);
      exerciseSummary = await Exercise.getWeeklyActivitySummary(userId, todayStr);
    } catch(err) {
      console.warn("Context Builder: Summaries fetch error", err.message);
    }

    return {
      healthProfile,
      activeMedicines,
      prescriptionHistory,
      foodSummary,
      exerciseSummary,
      weightGoal
    };
  } catch (error) {
    console.error('Gemini Context Builder Error:', error);
    return {};
  }
};
