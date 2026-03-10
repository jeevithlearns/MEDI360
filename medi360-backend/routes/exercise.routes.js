/**
 * Exercise/Activity Routes
 */

const express = require('express');
const router = express.Router();
const {
  addExercise,
  analyzeAndLogWorkout,
  getExercisesByDate,
  getDailyActivitySummary,
  getWeeklyActivitySummary,
  getMonthlyOverview,
  updateExercise,
  deleteExercise,
  getRecentExercises,
  getExerciseInsights,
  getRecommendations
} = require('../controllers/exercise.controller');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// @route   POST /api/exercise
// @desc    Add a new exercise/workout
router.post('/', addExercise);

// @route   POST /api/exercise/analyze
// @desc    Analyze and log a workout using AI
router.post('/analyze', analyzeAndLogWorkout);

// @route   GET /api/exercise/date/:date
// @desc    Get exercises by specific date (format: YYYY-MM-DD)
router.get('/date/:date', getExercisesByDate);

// @route   GET /api/exercise/summary/daily/:date
// @desc    Get daily activity summary
router.get('/summary/daily/:date', getDailyActivitySummary);

// @route   GET /api/exercise/summary/weekly/:startDate?
// @desc    Get weekly activity summary (optional startDate, defaults to current week)
router.get('/summary/weekly/:startDate?', getWeeklyActivitySummary);

// @route   GET /api/exercise/summary/monthly/:year/:month
// @desc    Get monthly activity overview
router.get('/summary/monthly/:year/:month', getMonthlyOverview);

// @route   GET /api/exercise/recent
// @desc    Get recent exercises (last 7 days)
router.get('/recent', getRecentExercises);

// @route   GET /api/exercise/insights
// @desc    Get exercise insights (last 30 days)
router.get('/insights', getExerciseInsights);

// @route   GET /api/exercise/recommendations
// @desc    Get personalized exercise recommendations based on health profile
router.get('/recommendations', getRecommendations);

// @route   PUT /api/exercise/:exerciseId
// @desc    Update an exercise
router.put('/:exerciseId', updateExercise);

// @route   DELETE /api/exercise/:exerciseId
// @desc    Delete an exercise
router.delete('/:exerciseId', deleteExercise);

module.exports = router;