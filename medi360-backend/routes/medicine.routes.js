const express = require('express');
const { getMedicines, addMedicine } = require('../controllers/medicine.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getMedicines);
router.post('/', addMedicine); // Manual add option

module.exports = router;
