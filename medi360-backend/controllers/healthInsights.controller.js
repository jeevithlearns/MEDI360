/**
 * Integrated Health Insights Controller
 * Combines data from Health Profile, Food, Exercise for comprehensive insights
 */

const HealthProfile = require('../models/HealthProfile.model');
const Food = require('../models/Food.model');
const Exercise = require('../models/Exercise.model');
const Medicine = require('../models/Medicine.model');
const { buildUserHealthContext } = require('../services/contextEngine');

/**
 * @desc    Get comprehensive health dashboard
 * @route   GET /api/health-insights/dashboard
 * @access  Private
 */
exports.getHealthDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    
    // Get health profile
    const healthProfile = await HealthProfile.findOne({ user: userId });
    
    // Get today's nutrition
    const dailyNutrition = await Food.getDailyNutritionSummary(userId, today);
    
    // Get today's activity
    const dailyActivity = await Exercise.getDailyActivitySummary(userId, today);
    
    // Calculate calorie balance
    let calorieBalance = null;
    if (healthProfile) {
      const age = healthProfile.age || 25;
      const gender = healthProfile.gender || 'male';
      const activityLevel = healthProfile.lifestyle?.exerciseFrequency || 'moderate';
      
      // Basic BMR calculation (Mifflin-St Jeor) using stored height/weight
      const weightValue = healthProfile.weight?.value || 70;
      const heightCm = healthProfile.height?.value || 170;
      
      let bmr;
      if (gender === 'male') {
        bmr = 10 * weightValue + 6.25 * heightCm - 5 * age + 5;
      } else {
        bmr = 10 * weightValue + 6.25 * heightCm - 5 * age - 161;
      }
      
      // Activity multipliers
      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        'very-active': 1.9
      };
      
      const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);
      const caloriesConsumed = dailyNutrition.totalCalories;
      const caloriesBurned = dailyActivity.totalCaloriesBurned;
      
      calorieBalance = {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        consumed: caloriesConsumed,
        burned: caloriesBurned,
        netCalories: caloriesConsumed - caloriesBurned,
        deficit: Math.round(tdee - (caloriesConsumed - caloriesBurned)),
        recommendation: ''
      };
      
      if (calorieBalance.deficit > 500) {
        calorieBalance.recommendation = '⚠️ Large calorie deficit - consider eating more';
      } else if (calorieBalance.deficit < -500) {
        calorieBalance.recommendation = '⚠️ Calorie surplus - consider more activity or reducing intake';
      } else {
        calorieBalance.recommendation = '✅ Good calorie balance!';
      }
    }
    
    res.json({
      success: true,
      data: {
        date: today,
        healthProfile: healthProfile ? {
          age: healthProfile.age,
          gender: healthProfile.gender,
          bmi: healthProfile.bmi,
          weight: healthProfile.weight,
          height: healthProfile.height
        } : null,
        nutrition: dailyNutrition,
        activity: dailyActivity,
        calorieBalance
      }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get weekly health summary
 * @route   GET /api/health-insights/weekly
 * @access  Private
 */
exports.getWeeklyHealthSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get start of week (Monday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startDate = new Date(today.setDate(diff)).toISOString().split('T')[0];
    
    // Get weekly summaries
    const nutritionSummary = await Food.getWeeklyNutritionSummary(userId, startDate);
    const activitySummary = await Exercise.getWeeklyActivitySummary(userId, startDate);
    
    // Calculate combined insights
    const weeklyInsights = {
      totalCaloriesConsumed: nutritionSummary.weeklyTotals.calories,
      totalCaloriesBurned: activitySummary.weeklyTotals.totalCaloriesBurned,
      netCalories: nutritionSummary.weeklyTotals.calories - activitySummary.weeklyTotals.totalCaloriesBurned,
      avgNetCaloriesPerDay: Math.round(
        (nutritionSummary.weeklyTotals.calories - activitySummary.weeklyTotals.totalCaloriesBurned) / 7
      ),
      activeDays: activitySummary.weeklyTotals.activeDays,
      mealsLogged: nutritionSummary.weeklyTotals.totalMeals,
      workoutsCompleted: activitySummary.weeklyTotals.totalExercises
    };
    
    res.json({
      success: true,
      data: {
        period: `${startDate} to ${nutritionSummary.endDate}`,
        nutrition: nutritionSummary,
        activity: activitySummary,
        insights: weeklyInsights
      }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get personalized health recommendations
 * @route   GET /api/health-insights/recommendations
 * @access  Private
 */
exports.getPersonalizedRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const context = await buildUserHealthContext(userId);
    
    const insights = [];

    // 1. Calorie deficit warning
    if (context.calorieBalance && context.calorieBalance.netBalance < -500) {
      insights.push(`You are ${Math.abs(context.calorieBalance.netBalance)} calories below your target. Make sure you're eating enough!`);
    } else if (context.calorieBalance && context.calorieBalance.netBalance > 500) {
      insights.push(`You are ${context.calorieBalance.netBalance} calories over your target.`);
    }

    // 2. Low protein intake
    if (context.nutritionSummaryToday && context.nutritionSummaryToday.totalProtein < 50) {
      insights.push("Your protein intake is low today. Consider adding some lean meats, eggs, or beans.");
    }

    // 3. Insufficient activity
    if (context.weeklyExerciseSummary && context.weeklyExerciseSummary.weeklyTotals) {
      const activeMins = context.weeklyExerciseSummary.weeklyTotals.totalActiveMinutes;
      if (activeMins < 150) {
        insights.push(`Your weekly activity goal is not met. You have ${activeMins} active minutes so far (Goal: 150).`);
      } else {
        insights.push(`Great job! You've met your weekly activity goal with ${activeMins} active minutes.`);
      }
    }

    // 4. Medication fatigue
    if (context.activeMedicines && context.activeMedicines.length > 2) {
      insights.push("You are taking multiple medications. If you're feeling unusually tired, it could be medication fatigue. Speak to your doctor if symptoms persist.");
    }

    res.json({
      success: true,
      data: { insights }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get legacy health recommendations
 * @route   GET /api/health-insights/recommendations
 * @access  Private
 */
exports.getLegacyRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get all data
    const healthProfile = await HealthProfile.findOne({ user: userId });
    
    if (!healthProfile) {
      return res.json({
        success: true,
        message: 'Complete your health profile to get personalized recommendations',
        data: { recommendations: [] }
      });
    }
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentMeals = await Food.find({
      user: userId,
      date: { $gte: thirtyDaysAgo }
    });
    
    const recentExercises = await Exercise.find({
      user: userId,
      date: { $gte: thirtyDaysAgo }
    });
    
    const recommendations = [];
    
    // BMI-based recommendations
    const bmi = healthProfile.measurements?.bmi;
    if (bmi) {
      if (bmi < 18.5) {
        recommendations.push({
          category: 'Weight Management',
          priority: 'high',
          message: 'Your BMI indicates you are underweight',
          suggestions: [
            'Increase calorie intake with nutrient-dense foods',
            'Focus on strength training to build muscle mass',
            'Consider consulting a nutritionist'
          ]
        });
      } else if (bmi > 25 && bmi < 30) {
        recommendations.push({
          category: 'Weight Management',
          priority: 'medium',
          message: 'Your BMI indicates you are overweight',
          suggestions: [
            'Aim for a modest calorie deficit (300-500 calories)',
            'Increase physical activity to 200+ minutes per week',
            'Focus on whole foods and reduce processed foods'
          ]
        });
      } else if (bmi >= 30) {
        recommendations.push({
          category: 'Weight Management',
          priority: 'high',
          message: 'Your BMI indicates obesity',
          suggestions: [
            'Consult with a healthcare provider for a personalized plan',
            'Start with low-impact exercises like walking or swimming',
            'Track your food intake carefully',
            'Consider joining a weight management program'
          ]
        });
      }
    }
    
    // Exercise recommendations
    const totalExerciseMinutes = recentExercises.reduce((sum, ex) => sum + ex.duration, 0);
    const avgMinutesPerWeek = (totalExerciseMinutes / 30) * 7;
    
    if (avgMinutesPerWeek < 75) {
      recommendations.push({
        category: 'Physical Activity',
        priority: 'high',
        message: 'You are not meeting the minimum recommended activity level',
        suggestions: [
          'Aim for at least 150 minutes of moderate activity per week',
          'Start with 10-15 minute walks and gradually increase',
          'Try to be active on at least 5 days per week'
        ]
      });
    } else if (avgMinutesPerWeek < 150) {
      recommendations.push({
        category: 'Physical Activity',
        priority: 'medium',
        message: 'You are close to meeting the recommended activity level',
        suggestions: [
          'Try to reach 150 minutes of moderate activity per week',
          'Add 2-3 strength training sessions per week',
          'Consider increasing intensity for better results'
        ]
      });
    }
    
    // Nutrition recommendations
    const avgCalories = recentMeals.length > 0 
      ? recentMeals.reduce((sum, m) => sum + m.nutrition.calories, 0) / (recentMeals.length / 3)
      : 0;
    
    const avgProtein = recentMeals.length > 0
      ? recentMeals.reduce((sum, m) => sum + m.nutrition.protein, 0) / (recentMeals.length / 3)
      : 0;
    
    if (avgProtein < 50) {
      recommendations.push({
        category: 'Nutrition',
        priority: 'medium',
        message: 'Your protein intake appears low',
        suggestions: [
          'Aim for at least 0.8g of protein per kg of body weight',
          'Include protein sources in every meal',
          'Good options: lean meat, fish, eggs, legumes, dairy'
        ]
      });
    }
    
    // Condition-specific recommendations
    if (healthProfile.knownConditions && healthProfile.knownConditions.length > 0) {
      healthProfile.knownConditions.forEach(condition => {
        if (condition.name.toLowerCase().includes('diabetes')) {
          recommendations.push({
            category: 'Medical Condition Management',
            priority: 'high',
            message: `Managing ${condition.name}`,
            suggestions: [
              'Monitor carbohydrate intake carefully',
              'Regular exercise helps regulate blood sugar',
              'Check blood glucose as recommended by your doctor',
              'Stay consistent with medication timing'
            ]
          });
        } else if (condition.name.toLowerCase().includes('hypertension') || 
                   condition.name.toLowerCase().includes('blood pressure')) {
          recommendations.push({
            category: 'Medical Condition Management',
            priority: 'high',
            message: `Managing ${condition.name}`,
            suggestions: [
              'Reduce sodium intake (aim for <2300mg/day)',
              'Regular cardiovascular exercise',
              'Maintain healthy weight',
              'Limit alcohol consumption'
            ]
          });
        }
      });
    }
    
    // Lifestyle recommendations
    if (healthProfile.lifestyle?.smokingStatus === 'current') {
      recommendations.push({
        category: 'Lifestyle',
        priority: 'critical',
        message: 'Smoking significantly impacts your health',
        suggestions: [
          'Consider joining a smoking cessation program',
          'Speak with your doctor about smoking cessation aids',
          'Set a quit date and create a plan',
          'Seek support from friends, family, or support groups'
        ]
      });
    }
    
    if (healthProfile.lifestyle?.sleepHours < 7) {
      recommendations.push({
        category: 'Lifestyle',
        priority: 'medium',
        message: 'You may not be getting enough sleep',
        suggestions: [
          'Aim for 7-9 hours of sleep per night',
          'Establish a consistent sleep schedule',
          'Create a relaxing bedtime routine',
          'Limit screen time before bed'
        ]
      });
    }
    
    res.json({
      success: true,
      data: { 
        recommendations,
        totalRecommendations: recommendations.length,
        breakdown: {
          critical: recommendations.filter(r => r.priority === 'critical').length,
          high: recommendations.filter(r => r.priority === 'high').length,
          medium: recommendations.filter(r => r.priority === 'medium').length
        }
      }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get progress tracking
 * @route   GET /api/health-insights/progress/:weeks
 * @access  Private
 */
exports.getProgressTracking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const weeks = parseInt(req.params.weeks) || 4;
    
    const weeksAgo = new Date();
    weeksAgo.setDate(weeksAgo.getDate() - (weeks * 7));
    
    const meals = await Food.find({
      user: userId,
      date: { $gte: weeksAgo }
    }).sort({ date: 1 });
    
    const exercises = await Exercise.find({
      user: userId,
      date: { $gte: weeksAgo }
    }).sort({ date: 1 });
    
    // Group by week
    const weeklyData = [];
    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(weeksAgo);
      weekStart.setDate(weekStart.getDate() + (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const weekMeals = meals.filter(m => 
        m.date >= weekStart && m.date < weekEnd
      );
      
      const weekExercises = exercises.filter(ex =>
        ex.date >= weekStart && ex.date < weekEnd
      );
      
      weeklyData.push({
        week: i + 1,
        startDate: weekStart.toISOString().split('T')[0],
        nutrition: {
          totalCalories: weekMeals.reduce((sum, m) => sum + m.nutrition.calories, 0),
          avgCaloriesPerDay: Math.round(weekMeals.reduce((sum, m) => sum + m.nutrition.calories, 0) / 7),
          mealsLogged: weekMeals.length
        },
        activity: {
          totalMinutes: weekExercises.reduce((sum, ex) => sum + ex.duration, 0),
          totalCaloriesBurned: weekExercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0),
          workouts: weekExercises.length
        }
      });
    }
    
    // Calculate trends
    const firstWeek = weeklyData[0];
    const lastWeek = weeklyData[weeklyData.length - 1];
    
    const trends = {
      nutrition: {
        calorieChange: lastWeek.nutrition.avgCaloriesPerDay - firstWeek.nutrition.avgCaloriesPerDay,
        trend: lastWeek.nutrition.avgCaloriesPerDay > firstWeek.nutrition.avgCaloriesPerDay ? 'increasing' : 'decreasing'
      },
      activity: {
        minutesChange: lastWeek.activity.totalMinutes - firstWeek.activity.totalMinutes,
        trend: lastWeek.activity.totalMinutes > firstWeek.activity.totalMinutes ? 'increasing' : 'decreasing'
      }
    };
    
    res.json({
      success: true,
      data: {
        period: `${weeks} weeks`,
        weeklyData,
        trends
      }
    });
    
  } catch (error) {
    next(error);
  }
};

module.exports = exports;