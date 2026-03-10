const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// You can set API_NINJAS_KEY in .env for external source exact matching
const NINJAS_KEY = process.env.API_NINJAS_KEY;

exports.analyzeFood = async (queryText) => {
  try {
    // 1. External Source (API Ninjas Nutrition)
    if (NINJAS_KEY) {
      const resp = await fetch(`https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(queryText)}`, {
        headers: { 'X-Api-Key': NINJAS_KEY }
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.length > 0) {
          // Aggregate all items in the query
          const totalCalories = data.reduce((acc, item) => acc + item.calories, 0);
          const totalProtein = data.reduce((acc, item) => acc + item.protein_g, 0);
          const totalCarbs = data.reduce((acc, item) => acc + item.carbohydrates_total_g, 0);
          const totalFats = data.reduce((acc, item) => acc + item.fat_total_g, 0);
          
          return {
            foodQuery: queryText,
            calories: totalCalories,
            protein: totalProtein,
            carbs: totalCarbs,
            fats: totalFats,
            mealType: "snack"
          };
        }
      }
    }

    // 2. Fallback to Gemini AI (Strict JSON Mode)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" } // ENFORCE STRICT JSON
    });
    
    // Using a clear prompt to act as an external database
    const prompt = `
      You are an expert USDA nutrition database API. 
      Act as an external data source. Calculate the exact standard nutritional values for the user's food query.
      User Input: "${queryText}"
      
      Return ONLY a JSON object exactly matching this schema:
      {
        "foodQuery": "${queryText}",
        "calories": 0,
        "protein": 0,
        "carbs": 0,
        "fats": 0,
        "mealType": "snack"
      }
      Do NOT wrap in markdown. Just return the JSON.
    `;

    const result = await model.generateContent(prompt);
    let responseText = await result.response.text();
    
    try {
        const parsed = JSON.parse(responseText);
        return {
            foodQuery: parsed.foodQuery || queryText,
            calories: Number(parsed.calories) || 0,
            protein: Number(parsed.protein) || 0,
            carbs: Number(parsed.carbs) || 0,
            fats: Number(parsed.fats) || 0,
            mealType: parsed.mealType || "snack"
        };
    } catch(e) {
        throw new Error("Failed to parse AI response into strict JSON.");
    }
  } catch (error) {
    console.error('Food Analysis Failed:', error);
    throw new Error('Failed to analyze food automatically.');
  }
};

exports.analyzeExercise = async (queryText) => {
  try {
    // 1. External Source (API Ninjas Calories Burned)
    if (NINJAS_KEY) {
      const resp = await fetch(`https://api.api-ninjas.com/v1/caloriesburned?activity=${encodeURIComponent(queryText)}`, {
        headers: { 'X-Api-Key': NINJAS_KEY }
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.length > 0) {
          const item = data[0];
          return {
            exerciseQuery: queryText,
            activityType: item.name,
            duration: item.duration_minutes || 30,
            intensity: "medium", // api ninjas doesn't return intensity natively
            caloriesBurned: item.calories_per_hour ? Math.round(item.calories_per_hour / 2) : 200 // estimating based on 30 min if missing
          };
        }
      }
    }

    // 2. Fallback to Gemini AI (Strict JSON Mode)
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });
    
    const prompt = `
      You are an expert fitness tracker database API.
      Calculate the activity classification, estimated duration, and calories burned for an average 70kg adult based on the query.
      User Input: "${queryText}"
      
      Return ONLY a JSON object exactly matching this schema:
      {
        "exerciseQuery": "${queryText}",
        "activityType": "Running",
        "duration": 30,
        "intensity": "medium",
        "caloriesBurned": 300
      }
      Do NOT wrap in markdown. Just return the JSON.
    `;

    const result = await model.generateContent(prompt);
    let responseText = await result.response.text();
    
    try {
        const parsed = JSON.parse(responseText);
        return {
            exerciseQuery: parsed.exerciseQuery || queryText,
            activityType: parsed.activityType || "Workout",
            duration: Number(parsed.duration) || 30,
            intensity: parsed.intensity || "medium",
            caloriesBurned: Number(parsed.caloriesBurned) || 0
        };
    } catch(e) {
        throw new Error("Failed to parse AI response into strict JSON.");
    }
  } catch (error) {
    console.error('Exercise Analysis Failed:', error);
    throw new Error('Failed to analyze exercise automatically.');
  }
};

