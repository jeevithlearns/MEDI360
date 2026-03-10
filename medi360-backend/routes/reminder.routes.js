const express = require('express');
const { getTodayReminders, markTaken } = require('../controllers/reminder.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/today', getTodayReminders);
router.post('/markTaken', markTaken);

module.exports = router;
