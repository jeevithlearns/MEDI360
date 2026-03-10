/**
 * Food/Meal Tracking Model
 * Tracks user's daily food intake and nutrition
 */

const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  
  foodItems: [{
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: String,
      required: true
    },
    unit: {
      type: String,
      default: 'serving'
    }
  }],
  
  nutrition: {
    calories: {
      type: Number,
      required: true,
      min: 0
    },
    protein: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    carbs: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    fats: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    fiber: {
      type: Number,
      min: 0,
      default: 0
    },
    sugar: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  
  date: {
    type: Date,
    required: true,
    default: Date.now
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

// Compound index for efficient date-based queries
foodSchema.index({ user: 1, date: -1 });

// Update updatedAt on save
foodSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance method to get formatted date
foodSchema.methods.getFormattedDate = function() {
  return this.date.toISOString().split('T')[0];
};

// Static method to get daily nutrition summary
foodSchema.statics.getDailyNutritionSummary = async function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const meals = await this.find({
    user: userId,
    date: { $gte: startOfDay, $lte: endOfDay }
  });
  
  const summary = {
    date: startOfDay.toISOString().split('T')[0],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    totalFiber: 0,
    totalSugar: 0,
    mealCount: meals.length,
    mealsByType: {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snack: 0
    },
    meals: []
  };
  
  meals.forEach(meal => {
    summary.totalCalories += meal.nutrition.calories;
    summary.totalProtein += meal.nutrition.protein;
    summary.totalCarbs += meal.nutrition.carbs;
    summary.totalFats += meal.nutrition.fats;
    summary.totalFiber += meal.nutrition.fiber || 0;
    summary.totalSugar += meal.nutrition.sugar || 0;
    summary.mealsByType[meal.mealType]++;
    
    summary.meals.push({
      _id: meal._id,
      mealType: meal.mealType,
      foodItems: meal.foodItems,
      nutrition: meal.nutrition,
      time: meal.date,
      notes: meal.notes
    });
  });
  
  // Round to 2 decimal places
  summary.totalCalories = Math.round(summary.totalCalories);
  summary.totalProtein = Math.round(summary.totalProtein * 10) / 10;
  summary.totalCarbs = Math.round(summary.totalCarbs * 10) / 10;
  summary.totalFats = Math.round(summary.totalFats * 10) / 10;
  summary.totalFiber = Math.round(summary.totalFiber * 10) / 10;
  summary.totalSugar = Math.round(summary.totalSugar * 10) / 10;
  
  return summary;
};

// Static method to get weekly nutrition summary
foodSchema.statics.getWeeklyNutritionSummary = async function(userId, startDate) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  
  const meals = await this.find({
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
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      mealCount: 0
    };
  }
  
  // Aggregate meals
  meals.forEach(meal => {
    const dateKey = meal.date.toISOString().split('T')[0];
    if (dailySummaries[dateKey]) {
      dailySummaries[dateKey].calories += meal.nutrition.calories;
      dailySummaries[dateKey].protein += meal.nutrition.protein;
      dailySummaries[dateKey].carbs += meal.nutrition.carbs;
      dailySummaries[dateKey].fats += meal.nutrition.fats;
      dailySummaries[dateKey].mealCount++;
    }
  });
  
  // Calculate weekly totals and averages
  const weeklyData = Object.values(dailySummaries);
  const totals = weeklyData.reduce((acc, day) => ({
    calories: acc.calories + day.calories,
    protein: acc.protein + day.protein,
    carbs: acc.carbs + day.carbs,
    fats: acc.fats + day.fats,
    mealCount: acc.mealCount + day.mealCount
  }), { calories: 0, protein: 0, carbs: 0, fats: 0, mealCount: 0 });
  
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    dailyData: weeklyData,
    weeklyTotals: {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fats: Math.round(totals.fats * 10) / 10,
      totalMeals: totals.mealCount
    },
    weeklyAverages: {
      avgCaloriesPerDay: Math.round(totals.calories / 7),
      avgProteinPerDay: Math.round((totals.protein / 7) * 10) / 10,
      avgCarbsPerDay: Math.round((totals.carbs / 7) * 10) / 10,
      avgFatsPerDay: Math.round((totals.fats / 7) * 10) / 10,
      avgMealsPerDay: Math.round((totals.mealCount / 7) * 10) / 10
    }
  };
};

module.exports = mongoose.model('Food', foodSchema);