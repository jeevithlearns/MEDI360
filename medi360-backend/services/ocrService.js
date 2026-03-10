const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// We'll use Gemini since we already have the GEMINI_API_KEY and it's excellent for multimodal OCR.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.parsePrescriptionImage = async (base64Image, mimeType = 'image/jpeg') => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
      You are an expert medical assistant OCR system.
      Read the following prescription image and extract the information into a strict JSON format.
      Do not include any string delimiters like \`\`\`json. Just the raw JSON.
      JSON Schema:
      {
        "doctorName": "String",
        "diagnosis": "String",
        "medicines": [
          {
            "name": "String",
            "dosage": "String",
            "frequency": "String",
            "durationDays": Number,
            "instructions": "String"
          }
        ],
        "issuedDate": "YYYY-MM-DD"
      }
    `;

    const imageParts = [
      {
        inlineData: {
          data: base64Image,
          mimeType
        }
      }
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
    
    return JSON.parse(text);
  } catch (error) {
    console.error('OCR Extraction Failed:', error);
    throw new Error('Failed to parse prescription from image.');
  }
};
