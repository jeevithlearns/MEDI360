/**
 * Exercise/Activity Controller
 * Handles all exercise tracking and activity-related operations
 */

const Exercise = require('../models/Exercise.model');
const HealthProfile = require('../models/HealthProfile.model');
const exerciseCalculator = require('../services/exerciseCalculator');

/**
 * @desc    Add an exercise/workout
 * @route   POST /api/exercise
 * @access  Private
 */
exports.addExercise = async (req, res, next) => {
  try {
    const {
      exerciseType,
      exerciseName,
      duration,
      caloriesBurned,
      intensity,
      date,
      distance,
      sets,
      reps,
      weight,
      heartRate,
      notes
    } = req.body;
    
    // Validation
    if (!exerciseType || !exerciseName || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Please provide exerciseType, exerciseName, and duration'
      });
    }

    let calculatedCalories = caloriesBurned;
    if (calculatedCalories === undefined || calculatedCalories === null || calculatedCalories === '' || Number(calculatedCalories) === 0) {
      const hp = await HealthProfile.findOne({ user: req.user.id });
      const weight = hp?.measurements?.weight || 70;
      calculatedCalories = exerciseCalculator.calculateCaloriesBurned(exerciseType, duration, weight);
    }
    
    const exercise = await Exercise.create({
      user: req.user.id,
      exerciseType,
      exerciseName,
      duration,
      caloriesBurned: calculatedCalories,
      intensity: intensity || 'moderate',
      date: date || new Date(),
      distance,
      sets,
      reps,
      weight,
      heartRate,
      notes
    });
    
    res.status(201).json({
      success: true,
      message: 'Exercise logged successfully',
      data: { exercise }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get exercises by date
 * @route   GET /api/exercise/date/:date
 * @access  Private
 */
exports.getExercisesByDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required (format: YYYY-MM-DD)'
      });
    }
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const exercises = await Exercise.find({
      user: req.user.id,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ date: 1 });
    
    res.json({
      success: true,
      count: exercises.length,
      data: { exercises }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get daily activity summary
 * @route   GET /api/exercise/summary/daily/:date
 * @access  Private
 */
exports.getDailyActivitySummary = async (req, res, next) => {
  try {
    const { date } = req.params;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required (format: YYYY-MM-DD)'
      });
    }
    
    const summary = await Exercise.getDailyActivitySummary(req.user.id, date);
    
    // Add recommendations based on WHO guidelines
    const recommendations = {
      dailyActiveMinutesGoal: 30,
      weeklyActiveMinutesGoal: 150,
      message: summary.totalDuration >= 30 
        ? '🎉 Great job! You met the daily activity goal!'
        : `💪 ${30 - summary.totalDuration} more minutes to reach today's goal`
    };
    
    res.json({
      success: true,
      data: {
        summary,
        recommendations
      }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get weekly activity summary
 * @route   GET /api/exercise/summary/weekly/:startDate
 * @access  Private
 */
exports.getWeeklyActivitySummary = async (req, res, next) => {
  try {
    let { startDate } = req.params;
    
    if (!startDate) {
      // Default to current week (Monday)
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startDate = new Date(today.setDate(diff)).toISOString().split('T')[0];
    }
    
    const summary = await Exercise.getWeeklyActivitySummary(req.user.id, startDate);
    
    res.json({
      success: true,
      data: { summary }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get monthly activity overview
 * @route   GET /api/exercise/summary/monthly/:year/:month
 * @access  Private
 */
exports.getMonthlyOverview = async (req, res, next) => {
  try {
    const { year, month } = req.params;
    
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Year and month parameters are required'
      });
    }
    
    const overview = await Exercise.getMonthlyOverview(
      req.user.id, 
      parseInt(year), 
      parseInt(month)
    );
    
    res.json({
      success: true,
      data: { overview }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an exercise
 * @route   PUT /api/exercise/:exerciseId
 * @access  Private
 */
exports.updateExercise = async (req, res, next) => {
  try {
    const { exerciseId } = req.params;
    
    let exercise = await Exercise.findOne({ _id: exerciseId, user: req.user.id });
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }
    
    // Update fields
    const allowedUpdates = [
      'exerciseType', 'exerciseName', 'duration', 'caloriesBurned', 
      'intensity', 'date', 'distance', 'sets', 'reps', 'weight', 
      'heartRate', 'notes'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        exercise[field] = req.body[field];
      }
    });
    
    await exercise.save();
    
    res.json({
      success: true,
      message: 'Exercise updated successfully',
      data: { exercise }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an exercise
 * @route   DELETE /api/exercise/:exerciseId
 * @access  Private
 */
exports.deleteExercise = async (req, res, next) => {
  try {
    const { exerciseId } = req.params;
    
    const exercise = await Exercise.findOneAndDelete({ 
      _id: exerciseId, 
      user: req.user.id 
    });
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Exercise deleted successfully'
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recent exercises (last 7 days)
 * @route   GET /api/exercise/recent
 * @access  Private
 */
exports.getRecentExercises = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const exercises = await Exercise.find({
      user: req.user.id,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: -1 }).limit(50);
    
    res.json({
      success: true,
      count: exercises.length,
      data: { exercises }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get exercise insights
 * @route   GET /api/exercise/insights
 * @access  Private
 */
exports.getExerciseInsights = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const exercises = await Exercise.find({
      user: req.user.id,
      date: { $gte: thirtyDaysAgo }
    });
    
    if (exercises.length === 0) {
      return res.json({
        success: true,
        message: 'No data available yet. Start logging workouts to see insights!',
        data: { insights: null }
      });
    }
    
    // Calculate totals and averages
    const totalDuration = exercises.reduce((sum, ex) => sum + ex.duration, 0);
    const totalCalories = exercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0);
    
    // Exercise type breakdown
    const typeBreakdown = {};
    exercises.forEach(ex => {
      if (!typeBreakdown[ex.exerciseType]) {
        typeBreakdown[ex.exerciseType] = {
          count: 0,
          totalDuration: 0,
          totalCalories: 0
        };
      }
      typeBreakdown[ex.exerciseType].count++;
      typeBreakdown[ex.exerciseType].totalDuration += ex.duration;
      typeBreakdown[ex.exerciseType].totalCalories += ex.caloriesBurned;
    });
    
    // Intensity distribution
    const intensityCount = {
      low: exercises.filter(ex => ex.intensity === 'low').length,
      moderate: exercises.filter(ex => ex.intensity === 'moderate').length,
      high: exercises.filter(ex => ex.intensity === 'high').length,
      'very high': exercises.filter(ex => ex.intensity === 'very high').length
    };
    
    // Calculate active days
    const uniqueDates = [...new Set(exercises.map(ex => ex.date.toISOString().split('T')[0]))];
    const activeDays = uniqueDates.length;
    
    // Most common exercise type
    const mostCommonType = Object.entries(typeBreakdown)
      .sort((a, b) => b[1].count - a[1].count)[0];
    
    const insights = {
      period: '30 days',
      totalWorkouts: exercises.length,
      activeDays,
      averages: {
        workoutsPerWeek: Math.round((exercises.length / 30) * 7 * 10) / 10,
        durationPerWorkout: Math.round(totalDuration / exercises.length),
        caloriesPerWorkout: Math.round(totalCalories / exercises.length),
        durationPerDay: Math.round(totalDuration / 30),
        caloriesPerDay: Math.round(totalCalories / 30)
      },
      totals: {
        duration: totalDuration,
        caloriesBurned: Math.round(totalCalories)
      },
      typeBreakdown,
      intensityDistribution: intensityCount,
      favoriteExercise: mostCommonType ? {
        type: mostCommonType[0],
        count: mostCommonType[1].count
      } : null,
      consistency: {
        activeDays,
        inactiveDays: 30 - activeDays,
        consistencyScore: Math.round((activeDays / 30) * 100)
      }
    };
    
    res.json({
      success: true,
      data: { insights }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get personalized exercise recommendations
 * @route   GET /api/exercise/recommendations
 * @access  Private
 */
exports.getRecommendations = async (req, res, next) => {
  try {
    const healthProfile = await HealthProfile.findOne({ user: req.user.id });
    
    if (!healthProfile) {
      return res.json({
        success: true,
        message: 'Complete your health profile to get personalized recommendations',
        data: { recommendations: null }
      });
    }
    
    const age = healthProfile.age || 25;
    const bmi = healthProfile.measurements?.bmi || 22;
    const exerciseLevel = healthProfile.lifestyle?.exerciseFrequency || 'moderate';
    
    let recommendations = {
      weeklyMinutes: 150,
      sessionsPerWeek: 3-5,
      sessionDuration: 30-50,
      recommendedTypes: [],
      intensity: 'moderate'
    };
    
    // Adjust based on BMI
    if (bmi > 25) {
      recommendations.recommendedTypes.push('walking', 'swimming', 'cycling');
      recommendations.focus = 'Weight management and cardiovascular health';
    } else if (bmi < 18.5) {
      recommendations.recommendedTypes.push('strength', 'weightlifting');
      recommendations.focus = 'Muscle building and strength';
    } else {
      recommendations.recommendedTypes.push('cardio', 'strength', 'flexibility');
      recommendations.focus = 'Overall fitness and health maintenance';
    }
    
    // Adjust based on age
    if (age > 60) {
      recommendations.intensity = 'low to moderate';
      recommendations.recommendedTypes.push('walking', 'yoga', 'swimming');
      recommendations.specialNote = 'Focus on low-impact exercises and flexibility';
    } else if (age < 30) {
      recommendations.intensity = 'moderate to high';
      recommendations.recommendedTypes.push('hiit', 'sports', 'running');
    }
    
    // Current activity level
    if (exerciseLevel === 'sedentary') {
      recommendations.message = 'Start with 10-15 minute sessions and gradually increase';
      recommendations.weeklyMinutes = 75;
    } else if (exerciseLevel === 'very active') {
      recommendations.weeklyMinutes = 300;
      recommendations.message = 'Maintain your excellent activity level!';
    }
    
    res.json({
      success: true,
      data: { recommendations }
    });
    
  } catch (error) {
    next(error);
  }
};