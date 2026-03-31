/**
 * Food/Nutrition Routes
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  addMeal,
  analyzeAndLogFood,
  getMealsByDate,
  getDailyNutritionSummary,
  getWeeklyNutritionSummary,
  updateMeal,
  deleteMeal,
  getRecentMeals,
  getNutritionInsights,
  getFoodRecommendations
} = require('../controllers/food.controller');
const {
  analyzeFoodImage,
  saveFoodImageMeal
} = require('../controllers/foodImage.controller');
const { protect } = require('../middleware/auth');

// Multer config for in-memory image upload (max 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// All routes require authentication
router.use(protect);

// @route   POST /api/food
// @desc    Add a new meal
router.post('/', addMeal);

// @route   POST /api/food/analyze
// @desc    Analyze and log a meal using AI
router.post('/analyze', analyzeAndLogFood);

// @route   POST /api/food/image-analyze
// @desc    Analyze food from an image using AI Vision
router.post('/image-analyze', upload.single('image'), analyzeFoodImage);

// @route   POST /api/food/image-save
// @desc    Save analyzed food items from image scan as a meal
router.post('/image-save', saveFoodImageMeal);

// @route   GET /api/food/date/:date
// @desc    Get meals by specific date (format: YYYY-MM-DD)
router.get('/date/:date', getMealsByDate);

// @route   GET /api/food/summary/daily/:date
// @desc    Get daily nutrition summary
router.get('/summary/daily/:date', getDailyNutritionSummary);

// @route   GET /api/food/summary/weekly/:startDate?
// @desc    Get weekly nutrition summary (optional startDate, defaults to current week)
router.get('/summary/weekly/:startDate?', getWeeklyNutritionSummary);

// @route   GET /api/food/recent
// @desc    Get recent meals (last 7 days)
router.get('/recent', getRecentMeals);

// @route   GET /api/food/insights
// @desc    Get nutrition insights (last 30 days)
router.get('/insights', getNutritionInsights);

// @route   GET /api/food/recommendations
// @desc    Get food recommendations based on health profile
router.get('/recommendations', getFoodRecommendations);

// @route   PUT /api/food/:mealId
// @desc    Update a meal
router.put('/:mealId', updateMeal);

// @route   DELETE /api/food/:mealId
// @desc    Delete a meal
router.delete('/:mealId', deleteMeal);

module.exports = router;