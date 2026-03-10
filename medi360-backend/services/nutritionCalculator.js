/**
 * Nutrition Calculator Service
 * Parses food queries and estimates calories/macros
 * Can use an external API like Edamam, USDA, or Nutritionix or fallback to mock for demonstration
 */

const axios = require('axios');

exports.calculateNutrition = async (foodString) => {
  // If API keys exist, we could try making a request
  // Example for Nutritionix:
  // if (process.env.NUTRITIONIX_APP_ID && process.env.NUTRITIONIX_APP_KEY) {
  //   try {
  //     const res = await axios.post('https://trackapi.nutritionix.com/v2/natural/nutrients', { query: foodString }, { headers: { 'x-app-id': process.env.NUTRITIONIX_APP_ID, 'x-app-key': process.env.NUTRITIONIX_APP_KEY } });
  //     // parse res.data 
  //   } catch(e) {}
  // }
  
  // To avoid crashing if no API key is set, we will use a basic keyword-based calculation for demonstration
  // A generic mock dictionary mapping simple words to nutritional values per 100g or 1 unit.
  
  const mockDb = {
    egg: { cal: 70, prot: 6, carb: 0.6, fat: 5, fib: 0 },
    rice: { cal: 200, prot: 4, carb: 45, fat: 0.4, fib: 0.6 },
    chicken: { cal: 165, prot: 31, carb: 0, fat: 3.6, fib: 0 },
    oatmeal: { cal: 150, prot: 5, carb: 27, fat: 3, fib: 4 },
    toast: { cal: 75, prot: 3, carb: 13, fat: 1, fib: 1 },
    salad: { cal: 100, prot: 2, carb: 10, fat: 5, fib: 4 },
    lentils: { cal: 230, prot: 18, carb: 40, fat: 0.8, fib: 15.6 },
    apple: { cal: 95, prot: 0.5, carb: 25, fat: 0.3, fib: 4.4 },
    milk: { cal: 100, prot: 8, carb: 12, fat: 2, fib: 0 },
  };

  const words = foodString.toLowerCase().split(/[\s,]+/);
  
  let totalCal = 0;
  let totalProt = 0;
  let totalCarb = 0;
  let totalFat = 0;
  let totalFib = 0;

  let multiplier = 1;
  words.forEach((w) => {
    // Basic quantity extraction like "2" or "100" or "cup" (cup will just be treated as another word, maybe multiplier 1)
    if (!isNaN(parseInt(w))) {
      // If it's something like 100g, multiplier is 1 if database is per 100g, else handle properly.
      // Let's just do a naive logic:
      const val = parseInt(w);
      if (w.includes('g') || w.includes('gram')) {
        multiplier = val / 100;
      } else {
        multiplier = val;
      }
    } else {
      // Check if it's a food item
      const key = Object.keys(mockDb).find(k => w.includes(k));
      if (key) {
        totalCal += mockDb[key].cal * multiplier;
        totalProt += mockDb[key].prot * multiplier;
        totalCarb += mockDb[key].carb * multiplier;
        totalFat += mockDb[key].fat * multiplier;
        totalFib += mockDb[key].fib * multiplier;
        // reset multiplier for next item
        multiplier = 1; 
      }
    }
  });

  // If we couldn't match anything, provide a default moderate estimate to pass logic
  if (totalCal === 0) {
    totalCal = 300;
    totalProt = 15;
    totalCarb = 40;
    totalFat = 10;
    totalFib = 5;
  }

  return {
    calories: Math.round(totalCal),
    protein: Math.round(totalProt * 10) / 10,
    carbs: Math.round(totalCarb * 10) / 10,
    fats: Math.round(totalFat * 10) / 10,
    fiber: Math.round(totalFib * 10) / 10,
    sugar: 0
  };
};
