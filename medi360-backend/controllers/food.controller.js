/**
 * Food/Nutrition Controller
 * Handles all food tracking and nutrition-related operations
 */

const Food = require('../models/Food.model');
const HealthProfile = require('../models/HealthProfile.model');
const WeightGoal = require('../models/WeightGoal.model');
const nutritionService = require('../services/nutritionCalculator');

/**
 * @desc    Add a meal/food entry
 * @route   POST /api/food
 * @access  Private
 */
exports.addMeal = async (req, res, next) => {
  try {
    const { mealType, foodItems, nutrition, date, notes } = req.body;
    
    // Validation
    if (!mealType || !foodItems) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mealType and foodItems'
      });
    }
    
    let calculatedNutrition = nutrition;
    // Auto calculate if not provided
    if (!calculatedNutrition || !calculatedNutrition.calories) {
      const foodDescriptions = foodItems.map(item => `${item.quantity} ${item.unit} ${item.name}`).join(', ');
      calculatedNutrition = await nutritionService.calculateNutrition(foodDescriptions);
    }
    
    const meal = await Food.create({
      user: req.user.id,
      mealType,
      foodItems,
      nutrition: {
        calories: calculatedNutrition.calories,
        protein: calculatedNutrition.protein || 0,
        carbs: calculatedNutrition.carbs || 0,
        fats: calculatedNutrition.fats || 0,
        fiber: calculatedNutrition.fiber || 0,
        sugar: calculatedNutrition.sugar || 0
      },
      date: date || new Date(),
      notes
    });
    
    res.status(201).json({
      success: true,
      message: 'Meal logged successfully',
      data: { meal }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get meals by date
 * @route   GET /api/food/date/:date
 * @access  Private
 */
exports.getMealsByDate = async (req, res, next) => {
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
    
    const meals = await Food.find({
      user: req.user.id,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ date: 1 });
    
    res.json({
      success: true,
      count: meals.length,
      data: { meals }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get daily nutrition summary
 * @route   GET /api/food/summary/daily/:date
 * @access  Private
 */
exports.getDailyNutritionSummary = async (req, res, next) => {
  try {
    const { date } = req.params;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required (format: YYYY-MM-DD)'
      });
    }
    
    const summary = await Food.getDailyNutritionSummary(req.user.id, date);
    
    // Get health profile for personalized recommendations
    const healthProfile = await HealthProfile.findOne({ user: req.user.id });
    
    let recommendations = null;
    if (healthProfile) {
      const age = healthProfile.age || 25;
      const gender = healthProfile.gender || 'male';
      const activityLevel = healthProfile.lifestyle?.exerciseFrequency || 'moderate';
      const bmi = healthProfile.measurements?.bmi;
      
      // Calculate recommended daily intake (basic calculation)
      let baseCalories = gender === 'male' ? 2500 : 2000;
      
      if (activityLevel === 'sedentary') baseCalories *= 0.9;
      else if (activityLevel === 'very active') baseCalories *= 1.2;
      
      recommendations = {
        dailyCalories: Math.round(baseCalories),
        protein: Math.round(baseCalories * 0.15 / 4), // 15% of calories, 4 cal/g
        carbs: Math.round(baseCalories * 0.50 / 4), // 50% of calories, 4 cal/g
        fats: Math.round(baseCalories * 0.35 / 9), // 35% of calories, 9 cal/g
        fiber: gender === 'male' ? 38 : 25
      };
      
      // Add progress percentages
      summary.progress = {
        calories: Math.round((summary.totalCalories / recommendations.dailyCalories) * 100),
        protein: Math.round((summary.totalProtein / recommendations.protein) * 100),
        carbs: Math.round((summary.totalCarbs / recommendations.carbs) * 100),
        fats: Math.round((summary.totalFats / recommendations.fats) * 100),
        fiber: Math.round((summary.totalFiber / recommendations.fiber) * 100)
      };
    }
    
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
 * @desc    Get weekly nutrition summary
 * @route   GET /api/food/summary/weekly/:startDate
 * @access  Private
 */
exports.getWeeklyNutritionSummary = async (req, res, next) => {
  try {
    let { startDate } = req.params;
    
    if (!startDate) {
      // Default to current week (Monday)
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startDate = new Date(today.setDate(diff)).toISOString().split('T')[0];
    }
    
    const summary = await Food.getWeeklyNutritionSummary(req.user.id, startDate);
    
    res.json({
      success: true,
      data: { summary }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a meal
 * @route   PUT /api/food/:mealId
 * @access  Private
 */
exports.updateMeal = async (req, res, next) => {
  try {
    const { mealId } = req.params;
    
    let meal = await Food.findOne({ _id: mealId, user: req.user.id });
    
    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }
    
    // Update fields
    const { mealType, foodItems, nutrition, date, notes } = req.body;
    
    if (mealType) meal.mealType = mealType;
    if (foodItems) meal.foodItems = foodItems;
    if (nutrition) {
      meal.nutrition = {
        calories: nutrition.calories || meal.nutrition.calories,
        protein: nutrition.protein !== undefined ? nutrition.protein : meal.nutrition.protein,
        carbs: nutrition.carbs !== undefined ? nutrition.carbs : meal.nutrition.carbs,
        fats: nutrition.fats !== undefined ? nutrition.fats : meal.nutrition.fats,
        fiber: nutrition.fiber !== undefined ? nutrition.fiber : meal.nutrition.fiber,
        sugar: nutrition.sugar !== undefined ? nutrition.sugar : meal.nutrition.sugar
      };
    }
    if (date) meal.date = date;
    if (notes !== undefined) meal.notes = notes;
    
    await meal.save();
    
    res.json({
      success: true,
      message: 'Meal updated successfully',
      data: { meal }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a meal
 * @route   DELETE /api/food/:mealId
 * @access  Private
 */
exports.deleteMeal = async (req, res, next) => {
  try {
    const { mealId } = req.params;
    
    const meal = await Food.findOneAndDelete({ _id: mealId, user: req.user.id });
    
    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Meal deleted successfully'
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recent meals (last 7 days)
 * @route   GET /api/food/recent
 * @access  Private
 */
exports.getRecentMeals = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const meals = await Food.find({
      user: req.user.id,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: -1 }).limit(50);
    
    res.json({
      success: true,
      count: meals.length,
      data: { meals }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get nutrition insights
 * @route   GET /api/food/insights
 * @access  Private
 */
exports.getNutritionInsights = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const meals = await Food.find({
      user: req.user.id,
      date: { $gte: thirtyDaysAgo }
    });
    
    if (meals.length === 0) {
      return res.json({
        success: true,
        message: 'No data available yet. Start logging meals to see insights!',
        data: { insights: null }
      });
    }
    
    // Calculate averages
    const totalDays = 30;
    const totalCalories = meals.reduce((sum, m) => sum + m.nutrition.calories, 0);
    const totalProtein = meals.reduce((sum, m) => sum + m.nutrition.protein, 0);
    const totalCarbs = meals.reduce((sum, m) => sum + m.nutrition.carbs, 0);
    const totalFats = meals.reduce((sum, m) => sum + m.nutrition.fats, 0);
    
    // Meal type distribution
    const mealTypeCount = {
      breakfast: meals.filter(m => m.mealType === 'breakfast').length,
      lunch: meals.filter(m => m.mealType === 'lunch').length,
      dinner: meals.filter(m => m.mealType === 'dinner').length,
      snack: meals.filter(m => m.mealType === 'snack').length
    };
    
    const insights = {
      period: '30 days',
      totalMeals: meals.length,
      averages: {
        caloriesPerDay: Math.round(totalCalories / totalDays),
        proteinPerDay: Math.round((totalProtein / totalDays) * 10) / 10,
        carbsPerDay: Math.round((totalCarbs / totalDays) * 10) / 10,
        fatsPerDay: Math.round((totalFats / totalDays) * 10) / 10,
        mealsPerDay: Math.round((meals.length / totalDays) * 10) / 10
      },
      mealTypeDistribution: mealTypeCount,
      macroRatio: {
        protein: Math.round((totalProtein * 4 / totalCalories) * 100) || 0,
        carbs: Math.round((totalCarbs * 4 / totalCalories) * 100) || 0,
        fats: Math.round((totalFats * 9 / totalCalories) * 100) || 0
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
 * @desc    Get personalized food recommendations
 * @route   GET /api/food/recommendations
 * @access  Private
 */
exports.getFoodRecommendations = async (req, res, next) => {
  try {
    const healthProfile = await HealthProfile.findOne({ user: req.user.id });
    const weightGoal = await WeightGoal.findOne({ user: req.user.id });
    
    // Some basic dummy recommendations
    const recommendations = [];

    let focus = 'balanced';
    if (weightGoal && weightGoal.currentWeight > weightGoal.targetWeight) focus = 'weight-loss';
    if (weightGoal && weightGoal.currentWeight < weightGoal.targetWeight) focus = 'muscle-gain';

    if (focus === 'weight-loss') {
      recommendations.push({
        mealType: 'Breakfast',
        options: ['oatmeal with fruit', 'greek yogurt with berries', 'boiled eggs + whole wheat toast']
      });
      recommendations.push({
        mealType: 'Lunch',
        options: ['grilled chicken salad', 'lentil soup', 'quinoa bowl with roasted veggies']
      });
      recommendations.push({
        mealType: 'Dinner',
        options: ['baked salmon with asparagus', 'lentils + brown rice', 'zucchini noodles with turkey meatballs']
      });
      recommendations.push({
        mealType: 'Snack',
        options: ['apple slices with almond butter', 'carrot sticks with hummus', 'handful of almonds']
      });
    } else if (focus === 'muscle-gain') {
      recommendations.push({
        mealType: 'Breakfast',
        options: ['protein pancakes', 'scrambled eggs with cheese and spinach', 'mass gainer shake']
      });
      recommendations.push({
        mealType: 'Lunch',
        options: ['chicken breast with sweet potato and broccoli', 'beef stir-fry with rice', 'tuna pasta salad']
      });
      recommendations.push({
        mealType: 'Dinner',
        options: ['steak with roasted potatoes', 'salmon avocado bowl', 'large portion of lentils + brown rice']
      });
      recommendations.push({
        mealType: 'Snack',
        options: ['protein bar', 'cottage cheese with pineapple', 'hard-boiled eggs']
      });
    } else {
      recommendations.push({
        mealType: 'Breakfast',
        options: ['avocado toast with egg', 'smoothie bowl', 'oatmeal with fruit']
      });
      recommendations.push({
        mealType: 'Lunch',
        options: ['turkey wrap', 'quinoa salad', 'grilled chicken salad']
      });
      recommendations.push({
        mealType: 'Dinner',
        options: ['stir-fried tofu', 'baked chicken with quinoa', 'lentils + brown rice']
      });
      recommendations.push({
        mealType: 'Snack',
        options: ['mixed nuts', 'fruit salad', 'yogurt']
      });
    }

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};