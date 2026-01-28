/**
 * Medical AI Service
 * AI-Assisted Medical Guidance System
 * 
 * Architecture: Rule-Based + AI-Ready
 * Current: Rule-based symptom analysis
 * Future: Integration with OpenAI/Custom ML models
 * 
 * As per MEDI-360 Report:
 * - Disease prediction based on symptoms
 * - Severity classification
 * - Personalized recommendations
 * - Emergency detection
 */

class MedicalAIService {
  
  /**
   * Symptom Knowledge Base
   * Source: Medical databases, WHO guidelines
   */
  static symptomDatabase = {
    // Cardiovascular
    'chest pain': { 
      categories: ['cardiovascular'], 
      severity: 'high',
      emergency: true,
      relatedConditions: ['heart attack', 'angina', 'pulmonary embolism']
    },
    'shortness of breath': { 
      categories: ['respiratory', 'cardiovascular'], 
      severity: 'moderate',
      emergency: false,
      relatedConditions: ['asthma', 'COPD', 'anxiety']
    },
    'irregular heartbeat': { 
      categories: ['cardiovascular'], 
      severity: 'moderate',
      emergency: false,
      relatedConditions: ['arrhythmia', 'atrial fibrillation']
    },
    
    // Neurological
    'severe headache': { 
      categories: ['neurological'], 
      severity: 'moderate',
      emergency: false,
      relatedConditions: ['migraine', 'tension headache', 'cluster headache']
    },
    'sudden confusion': { 
      categories: ['neurological'], 
      severity: 'high',
      emergency: true,
      relatedConditions: ['stroke', 'seizure', 'hypoglycemia']
    },
    'dizziness': { 
      categories: ['neurological', 'cardiovascular'], 
      severity: 'low',
      emergency: false,
      relatedConditions: ['vertigo', 'low blood pressure', 'dehydration']
    },
    
    // Respiratory
    'cough': { 
      categories: ['respiratory'], 
      severity: 'low',
      emergency: false,
      relatedConditions: ['common cold', 'bronchitis', 'pneumonia']
    },
    'fever': { 
      categories: ['general', 'infection'], 
      severity: 'moderate',
      emergency: false,
      relatedConditions: ['infection', 'flu', 'viral illness']
    },
    'difficulty breathing': { 
      categories: ['respiratory'], 
      severity: 'high',
      emergency: true,
      relatedConditions: ['asthma attack', 'pneumonia', 'allergic reaction']
    },
    
    // Gastrointestinal
    'nausea': { 
      categories: ['gastrointestinal'], 
      severity: 'low',
      emergency: false,
      relatedConditions: ['gastritis', 'food poisoning', 'pregnancy']
    },
    'abdominal pain': { 
      categories: ['gastrointestinal'], 
      severity: 'moderate',
      emergency: false,
      relatedConditions: ['gastritis', 'appendicitis', 'kidney stones']
    },
    'vomiting': { 
      categories: ['gastrointestinal'], 
      severity: 'moderate',
      emergency: false,
      relatedConditions: ['gastroenteritis', 'food poisoning', 'migraine']
    },
    
    // General
    'fatigue': { 
      categories: ['general'], 
      severity: 'low',
      emergency: false,
      relatedConditions: ['anemia', 'depression', 'sleep disorder']
    },
    'body aches': { 
      categories: ['general'], 
      severity: 'low',
      emergency: false,
      relatedConditions: ['flu', 'viral infection', 'fibromyalgia']
    },
    'loss of consciousness': { 
      categories: ['neurological'], 
      severity: 'emergency',
      emergency: true,
      relatedConditions: ['seizure', 'stroke', 'cardiac arrest']
    }
  };
  
  /**
   * Emergency Symptoms
   * Require immediate medical attention
   */
  static emergencySymptoms = [
    'chest pain',
    'difficulty breathing',
    'sudden confusion',
    'loss of consciousness',
    'severe bleeding',
    'stroke symptoms',
    'severe allergic reaction',
    'suicidal thoughts'
  ];
  
  /**
   * Analyze user symptoms and provide guidance
   * @param {string[]} symptoms - Array of symptom strings
   * @param {object} healthProfile - User's health profile
   * @param {object[]} conversationHistory - Previous messages
   * @returns {object} Analysis result
   */
  static analyzeSymptoms(symptoms, healthProfile = null, conversationHistory = []) {
    
    // Normalize symptoms
    const normalizedSymptoms = symptoms.map(s => s.toLowerCase().trim());
    
    // Check for emergency
    const emergencyDetected = this.checkEmergency(normalizedSymptoms);
    
    if (emergencyDetected) {
      return this.generateEmergencyResponse(normalizedSymptoms);
    }
    
    // Analyze severity
    const severity = this.calculateSeverity(normalizedSymptoms, healthProfile);
    
    // Get possible conditions
    const possibleConditions = this.identifyPossibleConditions(normalizedSymptoms);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      normalizedSymptoms, 
      severity, 
      healthProfile,
      possibleConditions
    );
    
    return {
      severity,
      emergencyDetected: false,
      identifiedSymptoms: normalizedSymptoms,
      possibleConditions,
      recommendations,
      disclaimer: this.getDisclaimer()
    };
  }
  
  /**
   * Check if symptoms indicate an emergency
   */
  static checkEmergency(symptoms) {
    return symptoms.some(symptom => 
      this.emergencySymptoms.some(emergency => 
        symptom.includes(emergency)
      )
    );
  }
  
  /**
   * Generate emergency response
   */
  static generateEmergencyResponse(symptoms) {
    return {
      severity: 'emergency',
      emergencyDetected: true,
      identifiedSymptoms: symptoms,
      urgentAction: 'CALL EMERGENCY SERVICES IMMEDIATELY',
      emergencyNumber: '108 (India) or local emergency number',
      recommendations: [
        '🚨 Call emergency services (108) immediately',
        'Do not attempt to drive yourself',
        'Stay calm and follow dispatcher instructions',
        'Have someone stay with you until help arrives',
        'If alone, unlock your front door for emergency responders'
      ],
      disclaimer: 'This is a medical emergency. Please seek immediate professional medical help.'
    };
  }
  
  /**
   * Calculate overall severity
   */
  static calculateSeverity(symptoms, healthProfile) {
    let maxSeverity = 'low';
    let severityScore = 0;
    
    symptoms.forEach(symptom => {
      const symptomData = this.findSymptomData(symptom);
      
      if (symptomData) {
        if (symptomData.severity === 'emergency') {
          return 'emergency';
        }
        
        if (symptomData.severity === 'high') {
          severityScore += 3;
          maxSeverity = 'high';
        } else if (symptomData.severity === 'moderate') {
          severityScore += 2;
          if (maxSeverity === 'low') maxSeverity = 'moderate';
        } else {
          severityScore += 1;
        }
      }
    });
    
    // Adjust for health profile risk factors
    if (healthProfile) {
      if (healthProfile.knownConditions && healthProfile.knownConditions.length > 0) {
        severityScore += 1;
      }
      
      if (healthProfile.age > 65) {
        severityScore += 1;
      }
    }
    
    // Final severity determination
    if (severityScore >= 5) return 'high';
    if (severityScore >= 3) return 'moderate';
    return maxSeverity;
  }
  
  /**
   * Find symptom in database
   */
  static findSymptomData(symptom) {
    for (const [key, value] of Object.entries(this.symptomDatabase)) {
      if (symptom.includes(key) || key.includes(symptom)) {
        return value;
      }
    }
    return null;
  }
  
  /**
   * Identify possible medical conditions
   */
  static identifyPossibleConditions(symptoms) {
    const conditionsMap = new Map();
    
    symptoms.forEach(symptom => {
      const symptomData = this.findSymptomData(symptom);
      
      if (symptomData && symptomData.relatedConditions) {
        symptomData.relatedConditions.forEach(condition => {
          const count = conditionsMap.get(condition) || 0;
          conditionsMap.set(condition, count + 1);
        });
      }
    });
    
    // Sort by frequency
    return Array.from(conditionsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([condition, frequency]) => ({
        condition,
        likelihood: frequency > 1 ? 'high' : 'moderate'
      }))
      .slice(0, 5);
  }
  
  /**
   * Generate personalized recommendations
   */
  static generateRecommendations(symptoms, severity, healthProfile, possibleConditions) {
    const recommendations = [];
    
    // Severity-based recommendations
    if (severity === 'high') {
      recommendations.push('Consult a healthcare provider within 24 hours');
      recommendations.push('Monitor your symptoms closely');
      recommendations.push('Avoid strenuous activities');
    } else if (severity === 'moderate') {
      recommendations.push('Consider scheduling a doctor appointment');
      recommendations.push('Track your symptoms over the next few days');
    } else {
      recommendations.push('Monitor symptoms; they may resolve on their own');
      recommendations.push('Maintain proper rest and hydration');
    }
    
    // Symptom-specific recommendations
    if (symptoms.some(s => s.includes('fever'))) {
      recommendations.push('Stay hydrated and rest');
      recommendations.push('Take temperature regularly');
      recommendations.push('Use over-the-counter fever reducers if needed');
    }
    
    if (symptoms.some(s => s.includes('cough'))) {
      recommendations.push('Stay hydrated with warm fluids');
      recommendations.push('Use a humidifier if available');
      recommendations.push('Avoid irritants like smoke');
    }
    
    // Health profile considerations
    if (healthProfile) {
      if (healthProfile.knownConditions && healthProfile.knownConditions.length > 0) {
        recommendations.push('Consider how symptoms may relate to your known conditions');
        recommendations.push('Contact your regular healthcare provider');
      }
      
      if (healthProfile.currentMedications && healthProfile.currentMedications.length > 0) {
        recommendations.push('Check for potential drug interactions');
        recommendations.push('Consult pharmacist if taking new medications');
      }
    }
    
    return recommendations;
  }
  
  /**
   * Get medical disclaimer
   */
  static getDisclaimer() {
    return 'This system provides general medical guidance and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.';
  }
  
  /**
   * Generate conversational response
   * @param {object} analysis - Symptom analysis result
   * @param {object} healthProfile - User health profile
   * @returns {string} Formatted response
   */
  static generateResponse(analysis, healthProfile = null) {
    let response = '';
    
    if (analysis.emergencyDetected) {
      response = `🚨 **MEDICAL EMERGENCY DETECTED**\n\n`;
      response += `${analysis.urgentAction}\n\n`;
      response += `**Emergency Number:** ${analysis.emergencyNumber}\n\n`;
      response += `**Immediate Actions:**\n`;
      analysis.recommendations.forEach(rec => {
        response += `• ${rec}\n`;
      });
      return response;
    }
    
    // Regular response
    response += `I've analyzed your symptoms. Here's what I found:\n\n`;
    
    response += `**Severity Level:** ${analysis.severity.toUpperCase()}\n\n`;
    
    if (analysis.possibleConditions && analysis.possibleConditions.length > 0) {
      response += `**Possible Conditions:**\n`;
      analysis.possibleConditions.forEach(pc => {
        response += `• ${pc.condition} (${pc.likelihood} likelihood)\n`;
      });
      response += `\n`;
    }
    
    response += `**Recommendations:**\n`;
    analysis.recommendations.forEach(rec => {
      response += `• ${rec}\n`;
    });
    
    response += `\n**Important:** ${analysis.disclaimer}`;
    
    return response;
  }
  
  /**
   * FUTURE ENHANCEMENT: Machine Learning Integration
   * 
   * This method is a placeholder for future ML model integration
   * When implemented, it will use trained models for:
   * - Disease prediction (Random Forest, Neural Networks)
   * - Risk assessment (LSTM for temporal data)
   * - Personalized treatment recommendations
   */
  static async predictWithML(symptoms, healthProfile, vitalSigns) {
    // TODO: Phase 2 Implementation
    // 1. Preprocess input data
    // 2. Load trained ML model
    // 3. Make prediction
    // 4. Return structured result
    
    console.log('[FUTURE] ML prediction would be called here');
    
    return {
      implemented: false,
      message: 'ML prediction module - Phase 2 implementation',
      fallback: 'Using rule-based analysis'
    };
  }
}

module.exports = MedicalAIService;
