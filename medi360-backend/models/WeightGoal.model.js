/**
 * Weight Goal Tracking Model
 */

const mongoose = require('mongoose');

const weightGoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentWeight: {
    type: Number,
    required: true
  },
  targetWeight: {
    type: Number,
    required: true
  },
  targetTimelineWeeks: {
    type: Number,
    required: true
  },
  dailyCaloriesTarget: {
    type: Number
  },
  recommendedProtein: {
    type: Number
  },
  weeklyWeightChange: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt on save
weightGoalSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('WeightGoal', weightGoalSchema);
