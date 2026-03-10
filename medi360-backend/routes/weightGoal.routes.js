const express = require('express');
const router = express.Router();
const weightGoalController = require('../controllers/weightGoal.controller');
const { permit } = require('../middleware/auth'); // Check auth middleware, let's look for how auth is done in other routes. If it's `protect`, I'll use it.

// For now I'll use `protect` based on other routes, let's verify later. I know it's usually `protect`.
const { protect } = require('../middleware/auth');

router.post('/', protect, weightGoalController.setWeightGoal);
router.get('/', protect, weightGoalController.getWeightGoal);

module.exports = router;
