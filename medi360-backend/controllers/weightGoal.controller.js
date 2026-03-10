const WeightGoal = require('../models/WeightGoal.model');
const HealthProfile = require('../models/HealthProfile.model');

// Create or Update Weight Goal
exports.setWeightGoal = async (req, res, next) => {
  try {
    const { currentWeight, targetWeight, targetTimelineWeeks } = req.body;

    if (!currentWeight || !targetWeight || !targetTimelineWeeks) {
      return res.status(400).json({ success: false, message: 'currentWeight, targetWeight, targetTimelineWeeks are required' });
    }

    const healthProfile = await HealthProfile.findOne({ user: req.user.id });
    if (!healthProfile) {
      return res.status(404).json({ success: false, message: 'HealthProfile not found, needed for BMR calculating' });
    }

    // BMR formula (Mifflin-St Jeor)
    // Men: (10 x weight) + (6.25 x height) - (5 x age) + 5
    // Women: (10 x weight) + (6.25 x height) - (5 x age) - 161
    const age = healthProfile.age || 30;
    const gender = healthProfile.gender || 'male';
    const heightCm = healthProfile.measurements?.height || 170;

    let bmr;
    if (gender === 'male') {
      bmr = (10 * currentWeight) + (6.25 * heightCm) - (5 * age) + 5;
    } else {
      bmr = (10 * currentWeight) + (6.25 * heightCm) - (5 * age) - 161;
    }

    // TDEE estimation (Assume active factor 1.375)
    let activityLevelMultiplier = 1.375; // light activity
    if (healthProfile.lifestyle && healthProfile.lifestyle.exerciseFrequency) {
      switch (healthProfile.lifestyle.exerciseFrequency) {
        case 'sedentary': activityLevelMultiplier = 1.2; break;
        case 'moderate': activityLevelMultiplier = 1.55; break;
        case 'very active': activityLevelMultiplier = 1.725; break;
      }
    }
    const tdee = bmr * activityLevelMultiplier;

    // Weight Target math
    // 1 kg = 7700 calories
    const weightDiff = currentWeight - targetWeight; // positive if losing
    const totalCalorieDeficit = weightDiff * 7700;
    const dailyCalorieDeficit = totalCalorieDeficit / (targetTimelineWeeks * 7);

    // If gaining weight, dailyCalorieDeficit will be negative, meaning surplus
    const dailyCaloriesTarget = Math.round(tdee - dailyCalorieDeficit);

    // Recommend Protein: ~1.6g per kilo of target weight is standard
    const recommendedProtein = Math.round(targetWeight * 1.6);

    // Weekly change goal
    const weeklyWeightChange = - (weightDiff / targetTimelineWeeks);

    const goalData = {
      user: req.user.id,
      currentWeight,
      targetWeight,
      targetTimelineWeeks,
      dailyCaloriesTarget,
      recommendedProtein,
      weeklyWeightChange: parseFloat(weeklyWeightChange.toFixed(2))
    };

    const goal = await WeightGoal.findOneAndUpdate(
      { user: req.user.id },
      { $set: goalData },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

exports.getWeightGoal = async (req, res, next) => {
  try {
    const goal = await WeightGoal.findOne({ user: req.user.id });
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'No weight goal found'
      });
    }
    res.json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};
