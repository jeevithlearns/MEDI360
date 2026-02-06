/**
 * Health Profile Model
 * Stores comprehensive user health information
 * 
 * As per MEDI-360 Report Section 3.1 (Requirements)
 * Supports personalized diagnosis and AI-assisted recommendations
 */

const mongoose = require('mongoose');

const HealthProfileSchema = new mongoose.Schema({
  // Link to User
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Basic Demographics
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [0, 'Age must be positive'],
    max: [150, 'Invalid age']
  },
  
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female', 'other', 'prefer-not-to-say']
  },
  
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'],
    default: 'unknown'
  },
  
  // Physical Measurements
  height: {
    value: {
      type: Number,
      min: [0, 'Height must be positive']
    },
    unit: {
      type: String,
      enum: ['cm', 'inches'],
      default: 'cm'
    }
  },
  
  weight: {
    value: {
      type: Number,
      min: [0, 'Weight must be positive']
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs'],
      default: 'kg'
    }
  },
  
  // Calculated Metrics (Auto-computed)
  bmi: {
    type: Number
  },
  
  // Medical History
  knownConditions: [{
    name: {
      type: String,
      required: true
    },
    diagnosedDate: Date,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      default: 'moderate'
    },
    notes: String
  }],
  
  allergies: [{
    allergen: {
      type: String,
      required: true
    },
    reaction: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'life-threatening'],
      default: 'moderate'
    }
  }],
  
  currentMedications: [{
    name: {
      type: String,
      required: true
    },
    dosage: String,
    frequency: String,
    startDate: Date,
    prescribedBy: String,
    notes: String
  }],
  
  surgicalHistory: [{
    procedure: String,
    date: Date,
    hospital: String,
    notes: String
  }],
  
  // Family Medical History
  familyHistory: [{
    relation: {
      type: String,
      enum: ['parent', 'sibling', 'grandparent', 'other']
    },
    condition: String,
    notes: String
  }],
  
  // Lifestyle Factors (As per Report Section 2.4 - Proposed System)
  lifestyle: {
    smokingStatus: {
      type: String,
      enum: ['never', 'former', 'current'],
      default: 'never'
    },
    alcoholConsumption: {
      type: String,
      enum: ['never', 'occasional', 'moderate', 'heavy'],
      default: 'never'
    },
    exerciseFrequency: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very-active'],
      default: 'sedentary'
    },
    dietType: {
      type: String,
      enum: ['vegetarian', 'non-vegetarian', 'vegan', 'other'],
      default: 'vegetarian'
    },
    sleepHours: {
      type: Number,
      min: 0,
      max: 24
    },
    stressLevel: {
      type: String,
      enum: ['low', 'moderate', 'high'],
      default: 'moderate'
    }
  },
  
  // Emergency Contact
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String
  },
  
  // Data Privacy Preferences
  dataSharing: {
    allowResearch: {
      type: Boolean,
      default: false
    },
    allowAnalytics: {
      type: Boolean,
      default: true
    }
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  lastReviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  lastReviewedAt: Date
  
}, {
  timestamps: true
});

// ======================
// INDEXES
// ======================

HealthProfileSchema.index({ user: 1 });
HealthProfileSchema.index({ updatedAt: -1 });

// ======================
// MIDDLEWARE
// ======================

// Calculate BMI before saving
HealthProfileSchema.pre('save', function(next) {
  if (this.height.value && this.weight.value) {
    // Convert to metric if needed
    let heightInMeters = this.height.value;
    let weightInKg = this.weight.value;
    
    if (this.height.unit === 'inches') {
      heightInMeters = this.height.value * 0.0254;
    } else {
      heightInMeters = this.height.value / 100;
    }
    
    if (this.weight.unit === 'lbs') {
      weightInKg = this.weight.value * 0.453592;
    }
    
    this.bmi = parseFloat((weightInKg / (heightInMeters * heightInMeters)).toFixed(2));
  }
  
  this.updatedAt = Date.now();
  next();
});

// ======================
// METHODS
// ======================

// Get health risk summary
HealthProfileSchema.methods.getHealthRiskSummary = function() {
  const risks = [];
  
  // BMI-based risk
  if (this.bmi) {
    if (this.bmi < 18.5) risks.push({ factor: 'Underweight', level: 'moderate' });
    else if (this.bmi >= 25 && this.bmi < 30) risks.push({ factor: 'Overweight', level: 'moderate' });
    else if (this.bmi >= 30) risks.push({ factor: 'Obesity', level: 'high' });
  }
  
  // Lifestyle risks
  if (this.lifestyle.smokingStatus === 'current') {
    risks.push({ factor: 'Smoking', level: 'high' });
  }
  
  if (this.lifestyle.alcoholConsumption === 'heavy') {
    risks.push({ factor: 'Heavy Alcohol Use', level: 'high' });
  }
  
  if (this.lifestyle.exerciseFrequency === 'sedentary') {
    risks.push({ factor: 'Sedentary Lifestyle', level: 'moderate' });
  }
  
  // Chronic conditions
  if (this.knownConditions.length > 0) {
    this.knownConditions.forEach(condition => {
      risks.push({ factor: condition.name, level: condition.severity });
    });
  }
  
  return risks;
};

// Check for critical allergies
HealthProfileSchema.methods.hasCriticalAllergies = function() {
  return this.allergies.some(allergy => 
    allergy.severity === 'life-threatening' || allergy.severity === 'severe'
  );
};

// Get medication compatibility (placeholder for future ML enhancement)
HealthProfileSchema.methods.checkMedicationCompatibility = function(medicationName) {
  // Rule-based check for now
  // Future Enhancement: Integrate with pharmacogenomics database
  
  const conflicts = [];
  
  // Check against current medications
  this.currentMedications.forEach(med => {
    // Placeholder logic - would be replaced with actual drug interaction database
    conflicts.push({
      medication: med.name,
      severity: 'check-required',
      recommendation: 'Consult healthcare provider'
    });
  });
  
  // Check against allergies
  this.allergies.forEach(allergy => {
    if (medicationName.toLowerCase().includes(allergy.allergen.toLowerCase())) {
      conflicts.push({
        allergen: allergy.allergen,
        severity: allergy.severity,
        recommendation: 'DO NOT USE - Known allergy'
      });
    }
  });
  
  return {
    safe: conflicts.length === 0,
    conflicts: conflicts
  };
};

module.exports = mongoose.model('HealthProfile', HealthProfileSchema);
