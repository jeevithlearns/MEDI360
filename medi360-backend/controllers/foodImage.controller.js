/**
 * Food Image Analysis Controller
 * Handles image upload → AI food detection → nutrition mapping
 */

const foodVisionService = require('../services/foodVision.service');
const nutritionMapper = require('../services/nutritionMapper');
const Food = require('../models/Food.model');

/**
 * @desc    Analyze a food image using AI and return nutrition data
 * @route   POST /api/food/image-analyze
 * @access  Private
 * 
 * Accepts:
 *   - multipart/form-data with 'image' field (file upload)
 *   - application/json with 'image' field (base64 string)
 */
exports.analyzeFoodImage = async (req, res, next) => {
  try {
    let imageBuffer;
    let mimeType = 'image/jpeg';

    // Handle file upload via multer
    if (req.file) {
      imageBuffer = req.file.buffer;
      mimeType = req.file.mimetype || 'image/jpeg';
    }
    // Handle base64 image in JSON body
    else if (req.body && req.body.image) {
      const base64Data = req.body.image.replace(
        /^data:image\/\w+;base64,/,
        ''
      );
      imageBuffer = Buffer.from(base64Data, 'base64');

      // Extract MIME type from data URI if present
      const mimeMatch = req.body.image.match(/^data:(image\/\w+);base64,/);
      if (mimeMatch) {
        mimeType = mimeMatch[1];
      }
    } else {
      return res.status(400).json({
        success: false,
        message:
          'No image provided. Upload an image file or send a base64-encoded image.',
      });
    }

    // Validate image size (max 10MB)
    if (imageBuffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Image size exceeds 10MB limit. Please compress and retry.',
      });
    }

    // Step 1: Detect foods using Gemini Vision
    const detectedFoods = await foodVisionService.analyzeFoodImage(
      imageBuffer,
      mimeType
    );

    if (!detectedFoods || detectedFoods.length === 0) {
      return res.status(200).json({
        success: true,
        message:
          'No food items detected in the image. Please try a clearer photo.',
        data: {
          foods: [],
          total: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        },
      });
    }

    // Step 2: Map detected foods to nutrition data
    const nutritionResult = nutritionMapper.mapNutrition(detectedFoods);

    // Step 3: Check for low-confidence items
    const lowConfidenceItems = nutritionResult.foods.filter(
      (f) => f.needsConfirmation
    );

    res.status(200).json({
      success: true,
      message: `Detected ${nutritionResult.foods.length} food item(s)`,
      data: {
        foods: nutritionResult.foods,
        total: nutritionResult.total,
        hasLowConfidence: lowConfidenceItems.length > 0,
        lowConfidenceCount: lowConfidenceItems.length,
        confidenceThreshold: foodVisionService.CONFIDENCE_THRESHOLD,
      },
    });
  } catch (error) {
    console.error('Food Image Analysis Error:', error);
    next(error);
  }
};

/**
 * @desc    Save analyzed food items as a meal
 * @route   POST /api/food/image-save
 * @access  Private
 */
exports.saveFoodImageMeal = async (req, res, next) => {
  try {
    const { foods, mealType } = req.body;

    if (!foods || !Array.isArray(foods) || foods.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No food items to save',
      });
    }

    // Recalculate nutrition from (potentially edited) food items
    const nutritionResult = nutritionMapper.recalculateNutrition(foods);

    // Build food items array for the DB model
    const foodItems = nutritionResult.foods.map((f) => ({
      name: f.name,
      quantity: String(f.grams),
      unit: 'grams',
    }));

    // Create the meal record
    const meal = await Food.create({
      user: req.user.id,
      mealType: mealType || 'snack',
      foodQuery: nutritionResult.foods.map((f) => f.name).join(', '),
      foodItems,
      nutrition: {
        calories: nutritionResult.total.calories,
        protein: nutritionResult.total.protein,
        carbs: nutritionResult.total.carbs,
        fats: nutritionResult.total.fat,
        fiber: 0,
        sugar: 0,
      },
      notes: 'Logged via AI Food Scanner',
      date: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Meal saved successfully from food scan',
      data: {
        meal,
        nutritionSummary: nutritionResult.total,
      },
    });
  } catch (error) {
    console.error('Save Food Image Meal Error:', error);
    next(error);
  }
};
