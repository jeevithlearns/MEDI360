const mongoose = require('mongoose');
const User = require('./models/User.model');
const HealthProfile = require('./models/HealthProfile.model');
const Exercise = require('./models/Exercise.model');
const Food = require('./models/Food.model');
const ChatSession = require('./models/ChatSession.model');

const models = { User, HealthProfile, Exercise, Food, ChatSession };

for (const [name, model] of Object.entries(models)) {
    console.log(`\nModel: ${name}`);
    const indexes = model.schema.indexes();
    indexes.forEach(idx => {
        console.log(JSON.stringify(idx[0]));
    });
}
process.exit(0);
