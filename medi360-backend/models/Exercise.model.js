/**
 * Exercise/Activity Tracking Model
 * Tracks user's physical activities and workouts
 */

const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  exerciseQuery: {
    type: String
  },
  
  exerciseType: {
    type: String,
    required: true,
    enum: [
      'cardio',
      'strength',
      'flexibility',
      'sports',
      'walking',
      'running',
      'cycling',
      'swimming',
      'yoga',
      'weightlifting',
      'hiit',
      'dance',
      'other'
    ]
  },
  
  exerciseName: {
    type: String,
    required: true
  },
  
  duration: {
    type: Number,
    required: true,
    min: 1,
    // Duration in minutes
  },
  
  caloriesBurned: {
    type: Number,
    required: true,
    min: 0
  },
  
  intensity: {
    type: String,
    enum: ['low', 'moderate', 'high', 'very high'],
    default: 'moderate'
  },
  
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  distance: {
    value: {
      type: Number,
      min: 0
    },
    unit: {
      type: String,
      enum: ['km', 'miles', 'meters'],
      default: 'km'
    }
  },
  
  sets: {
    type: Number,
    min: 1
  },
  
  reps: {
    type: Number,
    min: 1
  },
  
  weight: {
    value: {
      type: Number,
      min: 0
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs'],
      default: 'kg'
    }
  },
  
  heartRate: {
    average: {
      type: Number,
      min: 0
    },
    max: {
      type: Number,
      min: 0
    }
  },
  
  notes: {
    type: String,
    maxlength: 500
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
exerciseSchema.index({ user: 1, date: -1 });

// Update updatedAt on save
exerciseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance method to calculate MET (Metabolic Equivalent)
exerciseSchema.methods.calculateMET = function() {
  const metValues = {
    low: 3.5,
    moderate: 5.0,
    high: 7.5,
    'very high': 10.0
  };
  return metValues[this.intensity] || 5.0;
};

// Static method to get daily activity summary
exerciseSchema.statics.getDailyActivitySummary = async function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const exercises = await this.find({
    user: userId,
    date: { $gte: startOfDay, $lte: endOfDay }
  });
  
  const summary = {
    date: startOfDay.toISOString().split('T')[0],
    totalDuration: 0,
    totalCaloriesBurned: 0,
    exerciseCount: exercises.length,
    byType: {},
    byIntensity: {
      low: 0,
      moderate: 0,
      high: 0,
      'very high': 0
    },
    exercises: []
  };
  
  exercises.forEach(exercise => {
    summary.totalDuration += exercise.duration;
    summary.totalCaloriesBurned += exercise.caloriesBurned;
    
    // Count by type
    if (!summary.byType[exercise.exerciseType]) {
      summary.byType[exercise.exerciseType] = {
        count: 0,
        duration: 0,
        calories: 0
      };
    }
    summary.byType[exercise.exerciseType].count++;
    summary.byType[exercise.exerciseType].duration += exercise.duration;
    summary.byType[exercise.exerciseType].calories += exercise.caloriesBurned;
    
    // Count by intensity
    summary.byIntensity[exercise.intensity]++;
    
    summary.exercises.push({
      _id: exercise._id,
      exerciseQuery: exercise.exerciseQuery,
      exerciseType: exercise.exerciseType,
      exerciseName: exercise.exerciseName,
      duration: exercise.duration,
      caloriesBurned: exercise.caloriesBurned,
      intensity: exercise.intensity,
      time: exercise.date,
      notes: exercise.notes
    });
  });
  
  summary.totalCaloriesBurned = Math.round(summary.totalCaloriesBurned);
  
  return summary;
};

// Static method to get weekly activity summary
exerciseSchema.statics.getWeeklyActivitySummary = async function(userId, startDate) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  
  const exercises = await this.find({
    user: userId,
    date: { $gte: start, $lt: end }
  }).sort({ date: 1 });
  
  const dailySummaries = {};
  
  // Initialize 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    const dateKey = date.toISOString().split('T')[0];
    dailySummaries[dateKey] = {
      date: dateKey,
      duration: 0,
      caloriesBurned: 0,
      exerciseCount: 0,
      activeMinutes: 0
    };
  }
  
  // Aggregate exercises
  exercises.forEach(exercise => {
    const dateKey = exercise.date.toISOString().split('T')[0];
    if (dailySummaries[dateKey]) {
      dailySummaries[dateKey].duration += exercise.duration;
      dailySummaries[dateKey].caloriesBurned += exercise.caloriesBurned;
      dailySummaries[dateKey].exerciseCount++;
      
      // Count active minutes (moderate or higher intensity)
      if (['moderate', 'high', 'very high'].includes(exercise.intensity)) {
        dailySummaries[dateKey].activeMinutes += exercise.duration;
      }
    }
  });
  
  const weeklyData = Object.values(dailySummaries);
  
  // Calculate weekly totals
  const totals = weeklyData.reduce((acc, day) => ({
    duration: acc.duration + day.duration,
    caloriesBurned: acc.caloriesBurned + day.caloriesBurned,
    exerciseCount: acc.exerciseCount + day.exerciseCount,
    activeMinutes: acc.activeMinutes + day.activeMinutes
  }), { duration: 0, caloriesBurned: 0, exerciseCount: 0, activeMinutes: 0 });
  
  // Count active days (days with at least 30 minutes of activity)
  const activeDays = weeklyData.filter(day => day.activeMinutes >= 30).length;
  
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    dailyData: weeklyData,
    weeklyTotals: {
      totalDuration: totals.duration,
      totalCaloriesBurned: Math.round(totals.caloriesBurned),
      totalExercises: totals.exerciseCount,
      totalActiveMinutes: totals.activeMinutes,
      activeDays: activeDays
    },
    weeklyAverages: {
      avgDurationPerDay: Math.round(totals.duration / 7),
      avgCaloriesPerDay: Math.round(totals.caloriesBurned / 7),
      avgExercisesPerDay: Math.round((totals.exerciseCount / 7) * 10) / 10,
      avgActiveMinutesPerDay: Math.round(totals.activeMinutes / 7)
    },
    goals: {
      weeklyActiveMinutesGoal: 150, // WHO recommendation
      weeklyActiveMinutesAchieved: totals.activeMinutes,
      goalProgress: Math.min(Math.round((totals.activeMinutes / 150) * 100), 100),
      activeDaysGoal: 5,
      activeDaysAchieved: activeDays
    }
  };
};

// Static method to get monthly overview
exerciseSchema.statics.getMonthlyOverview = async function(userId, year, month) {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
  
  const exercises = await this.find({
    user: userId,
    date: { $gte: startOfMonth, $lte: endOfMonth }
  });
  
  const totalDuration = exercises.reduce((sum, ex) => sum + ex.duration, 0);
  const totalCalories = exercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0);
  
  const typeBreakdown = {};
  exercises.forEach(ex => {
    if (!typeBreakdown[ex.exerciseType]) {
      typeBreakdown[ex.exerciseType] = { count: 0, duration: 0 };
    }
    typeBreakdown[ex.exerciseType].count++;
    typeBreakdown[ex.exerciseType].duration += ex.duration;
  });
  
  return {
    month: `${year}-${month.toString().padStart(2, '0')}`,
    totalExercises: exercises.length,
    totalDuration,
    totalCaloriesBurned: Math.round(totalCalories),
    avgDurationPerSession: exercises.length > 0 ? Math.round(totalDuration / exercises.length) : 0,
    typeBreakdown
  };
};

module.exports = mongoose.model('Exercise', exerciseSchema);