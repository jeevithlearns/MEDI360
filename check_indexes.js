const mongoose = require('mongoose');
const User = require('./medi360-backend/models/User.model');
const HealthProfile = require('./medi360-backend/models/HealthProfile.model');
const Exercise = require('./medi360-backend/models/Exercise.model');
const Food = require('./medi360-backend/models/Food.model');
const ChatSession = require('./medi360-backend/models/ChatSession.model');

const models = { User, HealthProfile, Exercise, Food, ChatSession };

for (const [name, model] of Object.entries(models)) {
    console.log(`\nModel: ${name}`);
    console.log('Indexes defined in Schema:');
    console.log(JSON.stringify(model.schema.indexes(), null, 2));
}
