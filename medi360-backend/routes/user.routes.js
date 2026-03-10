/**
 * User Routes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Placeholder for future user-specific endpoints
router.get('/profile', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User profile endpoint - to be implemented',
    data: req.user
  });
});

module.exports = router;
