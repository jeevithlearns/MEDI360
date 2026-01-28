/**
 * Health Profile Controller
 * Manages user health information and medical history
 */

const HealthProfile = require('../models/HealthProfile.model');

/**
 * @desc    Create health profile
 * @route   POST /api/health-profile
 * @access  Private
 */
exports.createProfile = async (req, res, next) => {
  try {
    // Check if profile already exists
    const existingProfile = await HealthProfile.findOne({ user: req.user.id });
    
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Health profile already exists. Use update endpoint instead.'
      });
    }
    
    // Create new profile
    const profileData = {
      user: req.user.id,
      ...req.body
    };
    
    const profile = await HealthProfile.create(profileData);
    
    res.status(201).json({
      success: true,
      message: 'Health profile created successfully',
      data: { profile }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user health profile
 * @route   GET /api/health-profile
 * @access  Private
 */
exports.getProfile = async (req, res, next) => {
  try {
    const profile = await HealthProfile.findOne({ user: req.user.id })
      .populate('user', 'fullName email');
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Health profile not found. Please create one first.'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { profile }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update health profile
 * @route   PUT /api/health-profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    let profile = await HealthProfile.findOne({ user: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Health profile not found. Please create one first.'
      });
    }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        profile[key] = req.body[key];
      }
    });
    
    profile.lastReviewedBy = req.user.id;
    profile.lastReviewedAt = new Date();
    
    await profile.save();
    
    res.status(200).json({
      success: true,
      message: 'Health profile updated successfully',
      data: { profile }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get health risk summary
 * @route   GET /api/health-profile/risk-summary
 * @access  Private
 */
exports.getRiskSummary = async (req, res, next) => {
  try {
    const profile = await HealthProfile.findOne({ user: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Health profile not found'
      });
    }
    
    const riskSummary = profile.getHealthRiskSummary();
    
    res.status(200).json({
      success: true,
      data: { riskSummary }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add medical condition
 * @route   POST /api/health-profile/condition
 * @access  Private
 */
exports.addCondition = async (req, res, next) => {
  try {
    const { name, diagnosedDate, severity, notes } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Condition name is required'
      });
    }
    
    const profile = await HealthProfile.findOne({ user: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Health profile not found'
      });
    }
    
    profile.knownConditions.push({
      name,
      diagnosedDate,
      severity: severity || 'moderate',
      notes
    });
    
    await profile.save();
    
    res.status(200).json({
      success: true,
      message: 'Condition added successfully',
      data: { profile }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add allergy
 * @route   POST /api/health-profile/allergy
 * @access  Private
 */
exports.addAllergy = async (req, res, next) => {
  try {
    const { allergen, reaction, severity } = req.body;
    
    if (!allergen) {
      return res.status(400).json({
        success: false,
        message: 'Allergen name is required'
      });
    }
    
    const profile = await HealthProfile.findOne({ user: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Health profile not found'
      });
    }
    
    profile.allergies.push({
      allergen,
      reaction,
      severity: severity || 'moderate'
    });
    
    await profile.save();
    
    res.status(200).json({
      success: true,
      message: 'Allergy added successfully',
      data: { profile }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add medication
 * @route   POST /api/health-profile/medication
 * @access  Private
 */
exports.addMedication = async (req, res, next) => {
  try {
    const { name, dosage, frequency, startDate, prescribedBy, notes } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Medication name is required'
      });
    }
    
    const profile = await HealthProfile.findOne({ user: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Health profile not found'
      });
    }
    
    profile.currentMedications.push({
      name,
      dosage,
      frequency,
      startDate,
      prescribedBy,
      notes
    });
    
    await profile.save();
    
    res.status(200).json({
      success: true,
      message: 'Medication added successfully',
      data: { profile }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check medication compatibility
 * @route   POST /api/health-profile/check-medication
 * @access  Private
 */
exports.checkMedicationCompatibility = async (req, res, next) => {
  try {
    const { medicationName } = req.body;
    
    if (!medicationName) {
      return res.status(400).json({
        success: false,
        message: 'Medication name is required'
      });
    }
    
    const profile = await HealthProfile.findOne({ user: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Health profile not found'
      });
    }
    
    const compatibility = profile.checkMedicationCompatibility(medicationName);
    
    res.status(200).json({
      success: true,
      data: { compatibility }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete health profile
 * @route   DELETE /api/health-profile
 * @access  Private
 */
exports.deleteProfile = async (req, res, next) => {
  try {
    const profile = await HealthProfile.findOneAndDelete({ user: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Health profile not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Health profile deleted successfully'
    });
    
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
