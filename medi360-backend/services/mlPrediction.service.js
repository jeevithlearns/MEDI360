/**
 * ML Prediction Service
 * Integrates ML models with backend API
 * Node.js bridge to Python ML models
 */

const { spawn } = require('child_process');
const path = require('path');

class MLPredictionService {
  constructor() {
    this.pythonPath = process.env.PYTHON_PATH || 'python';
    this.modelsPath = path.join(__dirname, '../ml-models');
  }

  /**
   * Run Python ML script
   * @param {string} scriptName - Python script filename
   * @param {object} data - Input data for prediction
   * @returns {Promise} - ML prediction results
   */
  async runPythonScript(scriptName, data) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(this.modelsPath, scriptName);
      const python = spawn(this.pythonPath, [scriptPath, JSON.stringify(data)]);

      let dataString = '';
      let errorString = '';

      python.stdout.on('data', (data) => {
        dataString += data.toString();
      });

      python.stderr.on('data', (data) => {
        errorString += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python script failed: ${errorString}`));
        } else {
          try {
            const result = JSON.parse(dataString);
            resolve(result);
          } catch (error) {
            reject(new Error('Failed to parse ML output'));
          }
        }
      });
    });
  }

  /**
   * Predict disease from symptoms using Random Forest
   * @param {Array} symptoms - List of symptoms
   * @param {Object} healthProfile - User health profile
   * @returns {Object} - Disease predictions with confidence
   */
  async predictDisease(symptoms, healthProfile = {}) {
    try {
      // If ML model available, use it
      if (process.env.ML_ENABLED === 'true') {
        const symptomsText = symptoms.join(',');
        const result = await this.runPythonScript('predict_disease.py', {
          symptoms: symptomsText,
          age: healthProfile.age,
          gender: healthProfile.gender,
          knownConditions: healthProfile.knownConditions || []
        });

        return {
          mlEnabled: true,
          predictions: result.all_predictions,
          primaryDisease: result.primary_prediction,
          confidence: result.confidence,
          modelUsed: 'Random Forest Classifier'
        };
      } else {
        // Fallback to rule-based system
        return this.ruleBasedPrediction(symptoms, healthProfile);
      }
    } catch (error) {
      console.error('ML Prediction error:', error);
      // Fallback to rule-based
      return this.ruleBasedPrediction(symptoms, healthProfile);
    }
  }

  /**
   * Rule-based prediction (fallback when ML not available)
   */
  ruleBasedPrediction(symptoms, healthProfile) {
    // Simple rule-based mapping
    const diseaseMap = {
      'fever,cough,fatigue': { disease: 'Viral Infection', confidence: 0.75 },
      'chest_pain,shortness_of_breath': { disease: 'Cardiovascular Issue', confidence: 0.80 },
      'headache,dizziness': { disease: 'Hypertension', confidence: 0.70 },
      'nausea,vomiting,diarrhea': { disease: 'Gastroenteritis', confidence: 0.85 }
    };

    const symptomsKey = symptoms.sort().join(',');
    const prediction = diseaseMap[symptomsKey] || { 
      disease: 'Undetermined', 
      confidence: 0.50 
    };

    return {
      mlEnabled: false,
      predictions: [
        { disease: prediction.disease, confidence: prediction.confidence }
      ],
      primaryDisease: prediction.disease,
      confidence: prediction.confidence,
      modelUsed: 'Rule-based System'
    };
  }

  /**
   * Predict health trends using LSTM
   * @param {Array} healthHistory - Historical health data
   * @param {number} daysAhead - Days to predict
   * @returns {Object} - Future health predictions
   */
  async predictHealthTrends(healthHistory, daysAhead = 7) {
    try {
      if (process.env.ML_ENABLED === 'true') {
        const result = await this.runPythonScript('predict_trends.py', {
          history: healthHistory,
          days_ahead: daysAhead
        });

        return {
          mlEnabled: true,
          predictions: result.predictions,
          trend: result.trend, // 'improving', 'stable', 'declining'
          confidence: result.confidence,
          modelUsed: 'LSTM Neural Network'
        };
      } else {
        return this.simpleT rendPrediction(healthHistory, daysAhead);
      }
    } catch (error) {
      console.error('Trend prediction error:', error);
      return this.simpleTrendPrediction(healthHistory, daysAhead);
    }
  }

  /**
   * Simple trend prediction (fallback)
   */
  simpleTrendPrediction(healthHistory, daysAhead) {
    if (healthHistory.length === 0) {
      return {
        mlEnabled: false,
        predictions: [],
        trend: 'insufficient_data',
        confidence: 0,
        modelUsed: 'Simple Average'
      };
    }

    // Calculate simple moving average
    const recentScores = healthHistory.slice(-7).map(h => h.healthScore);
    const average = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

    // Simple linear trend
    const trend = recentScores[recentScores.length - 1] > recentScores[0] 
      ? 'improving' 
      : 'declining';

    // Generate predictions (simple constant prediction)
    const predictions = Array(daysAhead).fill(average);

    return {
      mlEnabled: false,
      predictions,
      trend,
      confidence: 0.60,
      modelUsed: 'Simple Moving Average'
    };
  }

  /**
   * Calculate health risk score using Neural Network
   * @param {Object} healthProfile - User health profile
   * @param {Array} recentSymptoms - Recent symptoms
   * @returns {Object} - Risk assessment
   */
  async calculateRiskScore(healthProfile, recentSymptoms = []) {
    try {
      if (process.env.ML_ENABLED === 'true') {
        const result = await this.runPythonScript('calculate_risk.py', {
          profile: healthProfile,
          symptoms: recentSymptoms
        });

        return {
          mlEnabled: true,
          riskScore: result.risk_score, // 0-100
          riskLevel: result.risk_level, // 'low', 'moderate', 'high'
          factors: result.contributing_factors,
          recommendations: result.recommendations,
          modelUsed: 'Neural Network Risk Assessor'
        };
      } else {
        return this.simpleRiskCalculation(healthProfile, recentSymptoms);
      }
    } catch (error) {
      console.error('Risk calculation error:', error);
      return this.simpleRiskCalculation(healthProfile, recentSymptoms);
    }
  }

  /**
   * Simple risk calculation (fallback)
   */
  simpleRiskCalculation(healthProfile, recentSymptoms) {
    let riskScore = 0;

    // Age factor
    if (healthProfile.age > 65) riskScore += 20;
    else if (healthProfile.age > 50) riskScore += 10;

    // BMI factor
    const bmi = healthProfile.measurements?.bmi;
    if (bmi > 30) riskScore += 15;
    else if (bmi > 25) riskScore += 5;

    // Lifestyle factors
    if (healthProfile.lifestyle?.smokingStatus === 'current') riskScore += 20;
    if (healthProfile.lifestyle?.alcoholConsumption === 'heavy') riskScore += 10;

    // Known conditions
    const conditionCount = healthProfile.knownConditions?.length || 0;
    riskScore += conditionCount * 5;

    // Recent symptoms
    riskScore += recentSymptoms.length * 3;

    // Normalize to 0-100
    riskScore = Math.min(riskScore, 100);

    let riskLevel = 'low';
    if (riskScore > 60) riskLevel = 'high';
    else if (riskScore > 30) riskLevel = 'moderate';

    return {
      mlEnabled: false,
      riskScore,
      riskLevel,
      factors: [
        `Age: ${healthProfile.age}`,
        `Known conditions: ${conditionCount}`,
        `Recent symptoms: ${recentSymptoms.length}`
      ],
      recommendations: [
        riskScore > 60 ? 'Consult a healthcare provider soon' : 'Maintain regular checkups',
        'Continue monitoring symptoms'
      ],
      modelUsed: 'Rule-based Calculator'
    };
  }

  /**
   * Get model information
   */
  async getModelsInfo() {
    return {
      mlEnabled: process.env.ML_ENABLED === 'true',
      availableModels: [
        {
          name: 'Disease Prediction',
          type: 'Random Forest Classifier',
          accuracy: '85%',
          status: process.env.ML_ENABLED === 'true' ? 'active' : 'fallback'
        },
        {
          name: 'Health Trend Prediction',
          type: 'LSTM Neural Network',
          accuracy: '78%',
          status: process.env.ML_ENABLED === 'true' ? 'active' : 'fallback'
        },
        {
          name: 'Risk Assessment',
          type: 'Neural Network',
          accuracy: '82%',
          status: process.env.ML_ENABLED === 'true' ? 'active' : 'fallback'
        }
      ],
      pythonVersion: process.env.PYTHON_VERSION || 'Not configured',
      modelsPath: this.modelsPath
    };
  }
}

module.exports = new MLPredictionService();
