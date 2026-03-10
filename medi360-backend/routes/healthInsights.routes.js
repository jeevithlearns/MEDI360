/**
 * Integrated Health Insights Routes
 * Combines Food, Exercise, and Health Profile data
 */

const express = require('express');
const router = express.Router();
const {
  getHealthDashboard,
  getWeeklyHealthSummary,
  getPersonalizedRecommendations,
  getProgressTracking
} = require('../controllers/healthInsights.controller');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// @route   GET /api/health-insights/dashboard
// @desc    Get comprehensive health dashboard (today's nutrition + activity + calorie balance)
router.get('/dashboard', getHealthDashboard);

// @route   GET /api/health-insights/weekly
// @desc    Get weekly health summary (combines nutrition and activity)
router.get('/weekly', getWeeklyHealthSummary);

// @route   GET /api/health-insights/recommendations
// @desc    Get personalized health recommendations based on all data
router.get('/recommendations', getPersonalizedRecommendations);

// @route   GET /api/health-insights/progress/:weeks
// @desc    Get progress tracking over specified weeks (default: 4)
router.get('/progress/:weeks?', getProgressTracking);

module.exports = router;