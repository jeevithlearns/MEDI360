/**
 * Health Profile Routes
 */

const express = require('express');
const router = express.Router();
const healthProfileController = require('../controllers/healthProfile.controller');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Profile management
router.post('/', healthProfileController.createProfile);
router.get('/', healthProfileController.getProfile);
router.put('/', healthProfileController.updateProfile);
router.delete('/', healthProfileController.deleteProfile);

// Risk assessment
router.get('/risk-summary', healthProfileController.getRiskSummary);

// Medical data management
router.post('/condition', healthProfileController.addCondition);
router.post('/allergy', healthProfileController.addAllergy);
router.post('/medication', healthProfileController.addMedication);

// Medication compatibility check
router.post('/check-medication', healthProfileController.checkMedicationCompatibility);

module.exports = router;
