const Medicine = require('../models/Medicine.model');

// @desc    Get Today's Reminders
// @route   GET /api/reminders/today
exports.getTodayReminders = async (req, res, next) => {
  try {
    const now = new Date();
    
    // Find active medicines
    const activeMedicines = await Medicine.find({
      user: req.user.id,
      startDate: { $lte: now },
      endDate: { $gte: now },
      reminderEnabled: true
    });

    res.json({ success: true, count: activeMedicines.length, data: activeMedicines });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark Medicine Taken
// @route   POST /api/reminders/markTaken
exports.markTaken = async (req, res, next) => {
  try {
    const { medicineId, time } = req.body;

    if (!medicineId || !time) {
      return res.status(400).json({ success: false, message: "medicineId and time are required." });
    }

    const medicine = await Medicine.findOne({ _id: medicineId, user: req.user.id });
    if (!medicine) return res.status(404).json({ success: false, message: "Medicine not found." });

    // Mark taken for today
    medicine.takenLog.push({
      date: new Date(),
      time,
      taken: true
    });
    
    await medicine.save();
    res.json({ success: true, data: medicine });
  } catch (error) {
    next(error);
  }
};
