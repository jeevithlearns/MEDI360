const Medicine = require('../models/Medicine.model');

// @desc    Get all user medicines
// @route   GET /api/medicine
exports.getMedicines = async (req, res, next) => {
  try {
    const medicines = await Medicine.find({ user: req.user.id }).sort({ endDate: -1 });
    res.json({ success: true, count: medicines.length, data: medicines });
  } catch (error) {
    next(error);
  }
};

// @desc    Add manual medicine
// @route   POST /api/medicine
exports.addMedicine = async (req, res, next) => {
  try {
    const medicineItem = { ...req.body, user: req.user.id };
    const medicine = await Medicine.create(medicineItem);
    res.status(201).json({ success: true, data: medicine });
  } catch (error) {
    next(error);
  }
};

// Drug safety check endpoint removed as per updated requirements
