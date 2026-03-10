const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequencyPerDay: {
    type: Number,
    required: true
  },
  times: [
    {
      type: String // e.g., "08:00", "20:00"
    }
  ],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reminderEnabled: {
    type: Boolean,
    default: true
  },
  takenLog: [
    {
      date: Date,
      time: String,
      taken: {
        type: Boolean,
        default: false
      }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Medicine', MedicineSchema);
