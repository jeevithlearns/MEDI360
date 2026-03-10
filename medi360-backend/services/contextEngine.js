const HealthProfile = require('../models/HealthProfile.model');
const Medicine = require('../models/Medicine.model');
const Prescription = require('../models/Prescription.model');
const Food = require('../models/Food.model');
const Exercise = require('../models/Exercise.model');
const WeightGoal = require('../models/WeightGoal.model');

/**
 * Builds a comprehensive health context object for a user.
 * This aggregates data from multiple models to provide a holistic view.
 */
exports.buildUserHealthContext = async (userId) => {
  try {
    const healthProfile = await HealthProfile.findOne({ user: userId }).lean();
    
    const now = new Date();
    const activeMedicines = await Medicine.find({
      user: userId,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).lean();

    const prescriptionHistory = await Prescription.find({ user: userId })
      .sort({ issuedDate: -1 })
      .limit(5).lean();

    const weightGoal = await WeightGoal.findOne({ user: userId }).lean();
    
    const todayStr = new Date().toISOString().split('T')[0];
    
    let nutritionSummaryToday = null;
    let weeklyExerciseSummary = null;

    try {
      nutritionSummaryToday = await Food.getDailyNutritionSummary(userId, todayStr);
      weeklyExerciseSummary = await Exercise.getWeeklyActivitySummary(userId, todayStr);
    } catch(err) {
      console.warn("Context Engine: Summaries fetch error", err.message);
    }

    // Determine calorie balance if possible
    let calorieBalance = null;
    if (nutritionSummaryToday && weeklyExerciseSummary) {
        // Average daily burn in past week vs today's consumed
        const avgBurn = weeklyExerciseSummary.weeklyAverages?.avgCaloriesPerDay || 0;
        const consumed = nutritionSummaryToday.totalCalories || 0;
        calorieBalance = {
            consumedToday: consumed,
            avgBurnedPerDay: avgBurn,
            netBalance: consumed - avgBurn
        };
    }

    // Future extension
    const sleepData = { status: "not_tracked", estimatedHours: 7 };

    return {
      healthProfile,
      nutritionSummaryToday,
      weeklyExerciseSummary,
      activeMedicines,
      prescriptionHistory,
      weightGoal,
      calorieBalance,
      sleepData
    };
  } catch (error) {
    console.error('Context Engine Error:', error);
    return {};
  }
};
