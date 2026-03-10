const express = require('express');
const { uploadPrescription, getPrescriptions, getSinglePrescription } = require('../controllers/prescription.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/upload', uploadPrescription);
router.get('/', getPrescriptions);
router.get('/:id', getSinglePrescription);

module.exports = router;
