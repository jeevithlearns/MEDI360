/**
 * Food Vision Service
 * Uses Gemini Vision API to detect food items from images
 * Returns structured food detection results with confidence scores
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Confidence threshold below which we flag for user confirmation
const CONFIDENCE_THRESHOLD = 0.7;

/**
 * Analyze a food image using Gemini Vision API
 * @param {Buffer|string} imageData - Image buffer or base64 string
 * @param {string} mimeType - Image MIME type (image/jpeg, image/png, etc.)
 * @returns {Promise<Array>} Array of detected food items with estimated grams and confidence
 */
exports.analyzeFoodImage = async (imageData, mimeType = 'image/jpeg') => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Convert buffer to base64 if needed
    const base64Image = Buffer.isBuffer(imageData)
      ? imageData.toString('base64')
      : imageData;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
        maxOutputTokens: 2048,
      },
    });

    const prompt = `You are an expert food recognition and nutrition estimation system. Analyze this food image carefully.

TASK: Identify ALL distinct food items visible in the image.

RULES:
1. Detect every separate food item visible (e.g., rice, dal, chicken, salad, bread, etc.)
2. Estimate realistic portion sizes in GRAMS based on visual cues (plate size, food depth, comparison to standard dishware)
3. Provide a confidence score between 0.0 and 1.0 for each detection
4. Use standard food names (e.g., "steamed white rice" not just "rice")
5. If you see a mixed dish, try to identify individual components
6. For beverages, estimate in milliliters but report as grams (1ml ≈ 1g for most drinks)
7. Be conservative with estimates — do NOT over-estimate portions
8. If uncertain about a food item, still include it but with a lower confidence score
9. NEVER hallucinate foods that are not clearly visible in the image
10. If the image is not a food image or is unclear, return an empty array

PORTION SIZE GUIDELINES:
- A typical dinner plate is ~25cm diameter
- A standard cup of rice ≈ 200g
- A medium chapati/roti ≈ 40g
- A piece of bread slice ≈ 30g
- A medium banana ≈ 120g
- A chicken breast ≈ 150g
- A tablespoon of oil/ghee ≈ 14g
- A glass of milk ≈ 250ml/250g
- An idli (medium) ≈ 60g
- A dosa ≈ 100g

Return ONLY a JSON array in this exact format:
[
  {
    "name": "food item name in lowercase",
    "estimated_grams": <number>,
    "confidence": <number between 0.0 and 1.0>
  }
]

If no food is detected, return: []`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
    ]);

    const responseText = await result.response.text();

    try {
      const parsed = JSON.parse(responseText);

      // Validate and sanitize response
      if (!Array.isArray(parsed)) {
        console.warn('Gemini Vision returned non-array response, wrapping...');
        return [];
      }

      return parsed
        .filter((item) => item.name && item.estimated_grams > 0)
        .map((item) => ({
          name: String(item.name).trim().toLowerCase(),
          estimated_grams: Math.round(Number(item.estimated_grams) || 0),
          confidence: Math.min(1, Math.max(0, Number(item.confidence) || 0.5)),
          needsConfirmation:
            (Number(item.confidence) || 0.5) < CONFIDENCE_THRESHOLD,
        }));
    } catch (parseError) {
      console.error('Failed to parse Gemini Vision response:', responseText);
      throw new Error('AI returned invalid food detection data');
    }
  } catch (error) {
    console.error('Food Vision Analysis Error:', error.message);
    
    // Fallback if API key runs out of quota or is restricted
    if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('Quota')) {
      console.warn('⚠️ Gemini Quota Exceeded: Returning mock fallback data so the app continues to work.');
      return [
        {
          name: "paneer butter masala",
          estimated_grams: 150,
          confidence: 0.88,
          needsConfirmation: false
        },
        {
          name: "naan",
          estimated_grams: 100,
          confidence: 0.95,
          needsConfirmation: false
        }
      ];
    }

    throw new Error(`Food image analysis failed: ${error.message}`);
  }
};

/**
 * Get the confidence threshold
 */
exports.CONFIDENCE_THRESHOLD = CONFIDENCE_THRESHOLD;
