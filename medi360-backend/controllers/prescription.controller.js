const Prescription = require('../models/Prescription.model');
const Medicine = require('../models/Medicine.model');
const ocrService = require('../services/ocrService');

// @desc    Upload & Parse Prescription
// @route   POST /api/prescriptions/upload
exports.uploadPrescription = async (req, res, next) => {
  try {
    // Expect base64 image data in body, e.g., "data:image/jpeg;base64,/9j/4AAQ..."
    const { imageBase64 } = req.body;
    
    if (!imageBase64) return res.status(400).json({ success: false, message: 'Image is required' });

    // Clean base64 string
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const mimeTypeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

    // Call OCR Service
    const extractedData = await ocrService.parsePrescriptionImage(base64Data, mimeType);
    
    // Save to DB
    const prescription = await Prescription.create({
      user: req.user.id,
      doctorName: extractedData.doctorName || 'Unknown Doctor',
      diagnosis: extractedData.diagnosis || 'Unknown',
      medicines: extractedData.medicines || [],
      prescriptionImage: imageBase64, // For production, upload this to S3/Cloudinary instead
      issuedDate: extractedData.issuedDate ? new Date(extractedData.issuedDate) : new Date()
    });

    // Automatically create medicines from prescription
    if (prescription.medicines && prescription.medicines.length > 0) {
      const medicineSchedules = prescription.medicines.map(med => {
        return {
          user: req.user.id,
          name: med.name,
          dosage: med.dosage,
          frequencyPerDay: parseInt(med.frequency.replace(/[^0-9]/g, '')) || 2, // Default 2 if parsing fails
          times: ["08:00", "20:00"], // Default times for simple impl
          startDate: new Date(),
          endDate: new Date(Date.now() + (med.durationDays || 7) * 24 * 60 * 60 * 1000), // Default 7 days
          reminderEnabled: true
        };
      });
      await Medicine.insertMany(medicineSchedules);
    }

    res.status(201).json({ success: true, data: prescription, extracted: extractedData });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's prescriptions
// @route   GET /api/prescriptions
exports.getPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: prescriptions.length, data: prescriptions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single prescription
// @route   GET /api/prescriptions/:id
exports.getSinglePrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findOne({ _id: req.params.id, user: req.user.id });
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
    res.json({ success: true, data: prescription });
  } catch (error) {
    next(error);
  }
};
