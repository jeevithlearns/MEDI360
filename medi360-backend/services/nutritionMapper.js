/**
 * Nutrition Mapper Service
 * Maps detected food items to their nutritional values (per 100g)
 * Uses a comprehensive mock dataset with common Indian + Western foods
 * Formula: macros = (grams / 100) * nutrition_per_100g
 */

// ─── Comprehensive Nutrition Database (per 100g) ─────────────────────────
const NUTRITION_DB = {
  // ── Indian Foods ──────────────────────────────────────────────
  'idli': { calories: 130, protein: 4, carbs: 26, fat: 0.5 },
  'dosa': { calories: 168, protein: 3.9, carbs: 27, fat: 5.2 },
  'masala dosa': { calories: 195, protein: 4.5, carbs: 30, fat: 7 },
  'plain dosa': { calories: 168, protein: 3.9, carbs: 27, fat: 5.2 },
  'sambar': { calories: 65, protein: 3.5, carbs: 8, fat: 2 },
  'coconut chutney': { calories: 130, protein: 2, carbs: 8, fat: 10 },
  'chapati': { calories: 240, protein: 8, carbs: 42, fat: 5 },
  'roti': { calories: 240, protein: 8, carbs: 42, fat: 5 },
  'naan': { calories: 290, protein: 9, carbs: 50, fat: 6 },
  'paratha': { calories: 290, protein: 7, carbs: 38, fat: 12 },
  'poori': { calories: 310, protein: 6, carbs: 40, fat: 14 },
  'biryani': { calories: 200, protein: 8, carbs: 25, fat: 8 },
  'chicken biryani': { calories: 220, protein: 12, carbs: 22, fat: 10 },
  'vegetable biryani': { calories: 180, protein: 5, carbs: 28, fat: 5 },
  'paneer': { calories: 265, protein: 18, carbs: 2, fat: 20 },
  'paneer butter masala': { calories: 200, protein: 10, carbs: 8, fat: 14 },
  'dal': { calories: 100, protein: 7, carbs: 16, fat: 1.5 },
  'dal tadka': { calories: 110, protein: 7, carbs: 15, fat: 3 },
  'dal makhani': { calories: 130, protein: 6, carbs: 14, fat: 6 },
  'rajma': { calories: 120, protein: 8, carbs: 20, fat: 1 },
  'chole': { calories: 140, protein: 8, carbs: 20, fat: 4 },
  'chana masala': { calories: 140, protein: 8, carbs: 20, fat: 4 },
  'aloo gobi': { calories: 80, protein: 2, carbs: 12, fat: 3 },
  'palak paneer': { calories: 140, protein: 8, carbs: 6, fat: 10 },
  'butter chicken': { calories: 180, protein: 15, carbs: 6, fat: 11 },
  'chicken curry': { calories: 160, protein: 14, carbs: 5, fat: 10 },
  'mutton curry': { calories: 180, protein: 16, carbs: 4, fat: 12 },
  'fish curry': { calories: 140, protein: 15, carbs: 5, fat: 7 },
  'korma': { calories: 170, protein: 10, carbs: 8, fat: 12 },
  'upma': { calories: 150, protein: 4, carbs: 22, fat: 5 },
  'poha': { calories: 160, protein: 3, carbs: 28, fat: 4 },
  'pongal': { calories: 140, protein: 5, carbs: 20, fat: 5 },
  'vada': { calories: 280, protein: 10, carbs: 30, fat: 14 },
  'medu vada': { calories: 280, protein: 10, carbs: 30, fat: 14 },
  'pakora': { calories: 240, protein: 5, carbs: 25, fat: 14 },
  'samosa': { calories: 260, protein: 5, carbs: 28, fat: 14 },
  'jalebi': { calories: 380, protein: 2, carbs: 60, fat: 15 },
  'gulab jamun': { calories: 350, protein: 5, carbs: 50, fat: 15 },
  'rasgulla': { calories: 186, protein: 5, carbs: 32, fat: 5 },
  'kheer': { calories: 160, protein: 4, carbs: 24, fat: 6 },
  'lassi': { calories: 75, protein: 3, carbs: 10, fat: 2.5 },
  'mango lassi': { calories: 110, protein: 3, carbs: 20, fat: 2.5 },
  'chai': { calories: 40, protein: 1, carbs: 6, fat: 1.5 },
  'masala chai': { calories: 40, protein: 1, carbs: 6, fat: 1.5 },
  'pav bhaji': { calories: 200, protein: 5, carbs: 28, fat: 8 },
  'uttapam': { calories: 170, protein: 5, carbs: 25, fat: 6 },
  'appam': { calories: 120, protein: 2.5, carbs: 22, fat: 2 },
  'puttu': { calories: 170, protein: 3, carbs: 35, fat: 2 },

  // ── Rice & Grains ────────────────────────────────────────────
  'steamed white rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  'white rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  'brown rice': { calories: 112, protein: 2.3, carbs: 24, fat: 0.9 },
  'fried rice': { calories: 175, protein: 5, carbs: 25, fat: 6 },
  'oatmeal': { calories: 71, protein: 2.5, carbs: 12, fat: 1.5 },
  'quinoa': { calories: 120, protein: 4.4, carbs: 21, fat: 1.9 },
  'pasta': { calories: 150, protein: 5, carbs: 30, fat: 1.5 },
  'spaghetti': { calories: 157, protein: 5.8, carbs: 31, fat: 0.9 },
  'noodles': { calories: 140, protein: 4.5, carbs: 25, fat: 2 },

  // ── Proteins ─────────────────────────────────────────────────
  'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  'grilled chicken': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  'fried chicken': { calories: 250, protein: 25, carbs: 8, fat: 14 },
  'chicken': { calories: 200, protein: 25, carbs: 0, fat: 10 },
  'chicken tikka': { calories: 175, protein: 25, carbs: 3, fat: 7 },
  'tandoori chicken': { calories: 165, protein: 26, carbs: 3, fat: 5 },
  'egg': { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  'boiled egg': { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  'fried egg': { calories: 195, protein: 14, carbs: 1, fat: 15 },
  'omelette': { calories: 165, protein: 11, carbs: 1, fat: 13 },
  'scrambled eggs': { calories: 148, protein: 10, carbs: 2, fat: 11 },
  'fish': { calories: 120, protein: 20, carbs: 0, fat: 4 },
  'salmon': { calories: 208, protein: 20, carbs: 0, fat: 13 },
  'tuna': { calories: 130, protein: 28, carbs: 0, fat: 1 },
  'shrimp': { calories: 99, protein: 24, carbs: 0, fat: 0.3 },
  'lamb': { calories: 250, protein: 25, carbs: 0, fat: 16 },
  'beef': { calories: 250, protein: 26, carbs: 0, fat: 15 },
  'pork': { calories: 242, protein: 27, carbs: 0, fat: 14 },
  'tofu': { calories: 76, protein: 8, carbs: 1.9, fat: 4.8 },

  // ── Breads & Bakery ──────────────────────────────────────────
  'bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
  'white bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
  'whole wheat bread': { calories: 252, protein: 12, carbs: 43, fat: 3.5 },
  'toast': { calories: 290, protein: 9, carbs: 50, fat: 4 },
  'croissant': { calories: 406, protein: 8, carbs: 46, fat: 21 },
  'bagel': { calories: 270, protein: 10, carbs: 53, fat: 1.5 },
  'muffin': { calories: 340, protein: 6, carbs: 48, fat: 14 },
  'pancake': { calories: 225, protein: 6, carbs: 30, fat: 9 },
  'waffle': { calories: 290, protein: 7, carbs: 33, fat: 15 },

  // ── Fruits ───────────────────────────────────────────────────
  'apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  'mango': { calories: 60, protein: 0.8, carbs: 15, fat: 0.4 },
  'orange': { calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  'grapes': { calories: 69, protein: 0.7, carbs: 18, fat: 0.2 },
  'watermelon': { calories: 30, protein: 0.6, carbs: 8, fat: 0.2 },
  'papaya': { calories: 43, protein: 0.5, carbs: 11, fat: 0.3 },
  'pineapple': { calories: 50, protein: 0.5, carbs: 13, fat: 0.1 },
  'strawberry': { calories: 32, protein: 0.7, carbs: 8, fat: 0.3 },
  'blueberry': { calories: 57, protein: 0.7, carbs: 14, fat: 0.3 },
  'guava': { calories: 68, protein: 2.6, carbs: 14, fat: 1 },
  'pomegranate': { calories: 83, protein: 1.7, carbs: 19, fat: 1.2 },

  // ── Vegetables ───────────────────────────────────────────────
  'salad': { calories: 20, protein: 1.5, carbs: 3, fat: 0.3 },
  'mixed salad': { calories: 25, protein: 1.5, carbs: 4, fat: 0.3 },
  'potato': { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
  'french fries': { calories: 312, protein: 3.4, carbs: 41, fat: 15 },
  'sweet potato': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  'broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  'corn': { calories: 96, protein: 3.4, carbs: 21, fat: 1.5 },

  // ── Dairy ────────────────────────────────────────────────────
  'milk': { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
  'whole milk': { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
  'yogurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  'curd': { calories: 60, protein: 3.5, carbs: 4.7, fat: 3.3 },
  'cheese': { calories: 402, protein: 25, carbs: 1.3, fat: 33 },
  'butter': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81 },
  'ghee': { calories: 900, protein: 0, carbs: 0, fat: 100 },
  'cottage cheese': { calories: 98, protein: 11, carbs: 3.4, fat: 4.3 },
  'ice cream': { calories: 207, protein: 3.5, carbs: 24, fat: 11 },

  // ── Fast Food / International ────────────────────────────────
  'pizza': { calories: 270, protein: 11, carbs: 33, fat: 10 },
  'burger': { calories: 295, protein: 17, carbs: 24, fat: 14 },
  'hamburger': { calories: 295, protein: 17, carbs: 24, fat: 14 },
  'cheeseburger': { calories: 330, protein: 18, carbs: 25, fat: 17 },
  'sandwich': { calories: 250, protein: 12, carbs: 30, fat: 9 },
  'hot dog': { calories: 290, protein: 10, carbs: 24, fat: 18 },
  'taco': { calories: 210, protein: 10, carbs: 22, fat: 10 },
  'burrito': { calories: 200, protein: 9, carbs: 25, fat: 7 },
  'sushi': { calories: 150, protein: 6, carbs: 20, fat: 5 },
  'ramen': { calories: 100, protein: 4, carbs: 14, fat: 3 },
  'spring roll': { calories: 180, protein: 4, carbs: 20, fat: 9 },
  'momos': { calories: 200, protein: 8, carbs: 25, fat: 7 },
  'dumpling': { calories: 200, protein: 8, carbs: 25, fat: 7 },

  // ── Snacks & Others ──────────────────────────────────────────
  'chips': { calories: 536, protein: 7, carbs: 53, fat: 35 },
  'popcorn': { calories: 375, protein: 12, carbs: 74, fat: 4.3 },
  'nuts': { calories: 607, protein: 20, carbs: 21, fat: 54 },
  'almonds': { calories: 579, protein: 21, carbs: 22, fat: 50 },
  'peanuts': { calories: 567, protein: 26, carbs: 16, fat: 49 },
  'chocolate': { calories: 546, protein: 5, carbs: 60, fat: 31 },
  'cookie': { calories: 500, protein: 5, carbs: 65, fat: 25 },
  'cake': { calories: 350, protein: 5, carbs: 50, fat: 15 },
  'donut': { calories: 421, protein: 5, carbs: 49, fat: 23 },

  // ── Beverages ────────────────────────────────────────────────
  'coffee': { calories: 2, protein: 0.3, carbs: 0, fat: 0 },
  'black coffee': { calories: 2, protein: 0.3, carbs: 0, fat: 0 },
  'latte': { calories: 50, protein: 3, carbs: 5, fat: 2 },
  'cappuccino': { calories: 45, protein: 3, carbs: 4, fat: 2 },
  'tea': { calories: 1, protein: 0, carbs: 0.3, fat: 0 },
  'green tea': { calories: 1, protein: 0, carbs: 0.3, fat: 0 },
  'orange juice': { calories: 45, protein: 0.7, carbs: 10, fat: 0.2 },
  'smoothie': { calories: 65, protein: 1.5, carbs: 14, fat: 0.5 },
  'protein shake': { calories: 120, protein: 20, carbs: 10, fat: 2 },
  'coconut water': { calories: 19, protein: 0.7, carbs: 3.7, fat: 0.2 },
  'buttermilk': { calories: 40, protein: 3.3, carbs: 4.8, fat: 0.9 },

  // ── Soups ────────────────────────────────────────────────────
  'soup': { calories: 50, protein: 2, carbs: 8, fat: 1 },
  'tomato soup': { calories: 35, protein: 1, carbs: 7, fat: 0.5 },
  'chicken soup': { calories: 55, protein: 5, carbs: 5, fat: 2 },

  // ── Lentils & Legumes ────────────────────────────────────────
  'lentils': { calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  'chickpeas': { calories: 164, protein: 8.9, carbs: 27, fat: 2.6 },
  'kidney beans': { calories: 127, protein: 8.7, carbs: 23, fat: 0.5 },
  'black beans': { calories: 132, protein: 8.9, carbs: 24, fat: 0.5 },
};

/**
 * Map detected food items to nutritional values
 * @param {Array} detectedFoods - Array of { name, estimated_grams, confidence }
 * @returns {Object} { foods: [...], total: { calories, protein, carbs, fat } }
 */
exports.mapNutrition = (detectedFoods) => {
  if (!Array.isArray(detectedFoods) || detectedFoods.length === 0) {
    return { foods: [], total: { calories: 0, protein: 0, carbs: 0, fat: 0 } };
  }

  const mappedFoods = detectedFoods.map((food) => {
    const nutrition = lookupNutrition(food.name);
    const grams = Number(food.estimated_grams) || 100;
    const multiplier = grams / 100;

    return {
      name: food.name,
      grams: grams,
      calories: Math.round(nutrition.calories * multiplier),
      protein: Math.round(nutrition.protein * multiplier * 10) / 10,
      carbs: Math.round(nutrition.carbs * multiplier * 10) / 10,
      fat: Math.round(nutrition.fat * multiplier * 10) / 10,
      confidence: food.confidence || 0.5,
      needsConfirmation: food.needsConfirmation || false,
      nutritionSource: nutrition._source,
    };
  });

  // Calculate totals
  const total = mappedFoods.reduce(
    (acc, food) => ({
      calories: acc.calories + food.calories,
      protein: Math.round((acc.protein + food.protein) * 10) / 10,
      carbs: Math.round((acc.carbs + food.carbs) * 10) / 10,
      fat: Math.round((acc.fat + food.fat) * 10) / 10,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return { foods: mappedFoods, total };
};

/**
 * Recalculate nutrition for edited food items
 * @param {Array} editedFoods - Array of { name, grams }
 * @returns {Object} Same format as mapNutrition
 */
exports.recalculateNutrition = (editedFoods) => {
  const recalculated = editedFoods.map((food) => ({
    name: food.name,
    estimated_grams: food.grams,
    confidence: food.confidence || 1.0,
    needsConfirmation: false,
  }));

  return exports.mapNutrition(recalculated);
};

/**
 * Lookup nutrition data for a food item
 * Uses fuzzy matching to find the closest match
 * @param {string} foodName
 * @returns {Object} { calories, protein, carbs, fat, _source }
 */
function lookupNutrition(foodName) {
  const name = foodName.trim().toLowerCase();

  // 1. Direct match
  if (NUTRITION_DB[name]) {
    return { ...NUTRITION_DB[name], _source: 'database' };
  }

  // 2. Partial match — check if any DB key is contained in the food name
  for (const [key, value] of Object.entries(NUTRITION_DB)) {
    if (name.includes(key) || key.includes(name)) {
      return { ...value, _source: 'partial_match' };
    }
  }

  // 3. Word-level match — check if any word in the food name matches a DB key
  const words = name.split(/\s+/);
  for (const word of words) {
    if (NUTRITION_DB[word]) {
      return { ...NUTRITION_DB[word], _source: 'word_match' };
    }
  }

  // 4. Fallback — return a generic moderate estimate
  return {
    calories: 150,
    protein: 5,
    carbs: 20,
    fat: 5,
    _source: 'estimate',
  };
}

/**
 * Expose the nutrition database for external use
 */
exports.NUTRITION_DB = NUTRITION_DB;
