const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorName: {
    type: String,
    required: false
  },
  diagnosis: {
    type: String,
    required: false
  },
  medicines: [
    {
      name: String,
      dosage: String,
      frequency: String,
      durationDays: Number,
      instructions: String
    }
  ],
  prescriptionImage: {
    type: String, // String path or base64
    required: true
  },
  issuedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Prescription', PrescriptionSchema);
