/**
 * AI Service for MEDI-360
 * Handles communication with Gemini API for symptom analysis, nutrition, and exercise
 */

const axios = require('axios');

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    this.defaultModel = 'gemini-1.5-flash';
  }

  /**
   * General method to call Gemini
   */
  async callGemini(prompt, model = this.defaultModel) {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is missing in environment variables');
    }

    const url = `${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`;
    
    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    try {
      const response = await axios.post(url, requestBody, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data && response.data.candidates && response.data.candidates[0].content.parts[0].text) {
        return response.data.candidates[0].content.parts[0].text;
      }
      
      throw new Error('Invalid response from AI Service');
    } catch (error) {
      console.error('AI Service Error:', error.response?.data || error.message);
      throw new Error(`AI calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate calories and macros for food items
   */
  async calculateFoodNutrition(foodItems) {
    const itemsList = foodItems.map(item => `${item.quantity} ${item.unit} ${item.name}`).join(', ');
    
    const prompt = `You are a nutrition expert. Calculate the total calories, protein, carbs, and fats for the following food items:
    ${itemsList}
    
    Respond STRICTLY with a JSON object in this format:
    {
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fats": 0,
      "fiber": 0,
      "sugar": 0
    }
    If you cannot find exact values, provide a reasonable estimate. Return ONLY the JSON object.`;

    const responseText = await this.callGemini(prompt);
    
    try {
      // Extract JSON if there's any surrounding text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(responseText);
    } catch (error) {
      console.error('Failed to parse nutrition JSON:', responseText);
      throw new Error('Could not parse nutrition data');
    }
  }

  /**
   * Estimate calories burned for an exercise
   */
  async estimateExerciseCalories(exerciseText, duration, weightKg = 70) {
    const prompt = `Estimate the calories burned for this activity:
    Activity: ${exerciseText}
    Duration: ${duration} minutes
    User Weight: ${weightKg} kg
    
    Respond STRICTLY with a JSON object in this format:
    {
      "caloriesBurned": 0,
      "intensity": "low/moderate/high/very high"
    }
    Return ONLY the JSON object.`;

    const responseText = await this.callGemini(prompt);
    
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(responseText);
    } catch (error) {
      console.error('Failed to parse exercise JSON:', responseText);
      throw new Error('Could not parse exercise data');
    }
  }
}

module.exports = new AIService();
