/**
 * Analytics Routes
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/dashboard', analyticsController.getDashboard);
router.get('/symptoms', analyticsController.getSymptomAnalysis);
router.get('/trends', analyticsController.getHealthTrends);
router.get('/recommendations', analyticsController.getPersonalizedRecommendations);
router.get('/export', analyticsController.exportHealthData);

module.exports = router;
