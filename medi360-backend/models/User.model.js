/**
 * User Model
 * Stores user authentication and basic profile information
 * 
 * Security Features:
 * - Password hashing with bcrypt
 * - JWT token generation
 * - Protected password field
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  // Authentication Fields
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password in queries by default
  },
  
  // Basic Profile
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
  },
  
  // User Metadata
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  lastLogin: {
    type: Date
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ======================
// INDEXES
// ======================

UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: -1 });

// ======================
// MIDDLEWARE
// ======================

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update timestamp on save
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// ======================
// METHODS
// ======================

// Compare password for authentication
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Generate JWT token
UserSchema.methods.generateAuthToken = function() {
  const payload = {
    id: this._id,
    email: this.email,
    role: this.role
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Get public profile (exclude sensitive data)
UserSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    email: this.email,
    fullName: this.fullName,
    phoneNumber: this.phoneNumber,
    role: this.role,
    isEmailVerified: this.isEmailVerified,
    createdAt: this.createdAt
  };
};

// ======================
// VIRTUAL RELATIONSHIPS
// ======================

// Virtual for health profile
UserSchema.virtual('healthProfile', {
  ref: 'HealthProfile',
  localField: '_id',
  foreignField: 'user',
  justOne: true
});

// Virtual for chat history
UserSchema.virtual('chatHistory', {
  ref: 'ChatSession',
  localField: '_id',
  foreignField: 'user'
});

module.exports = mongoose.model('User', UserSchema);
