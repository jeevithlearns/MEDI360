const cron = require('node-cron');
const Medicine = require('../models/Medicine.model');
const User = require('../models/User.model');

// Run every minute to check for reminders
// Using node-cron '*' represents every minute
exports.initReminderEngine = () => {
  console.log('💊 Initializing Medicine Reminder Engine...');
  
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentHours}:${currentMinutes}`;
      
      const medicinesToRemind = await Medicine.find({
        reminderEnabled: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
        times: currentTime
      }).populate('user', 'email fullName');

      if (medicinesToRemind.length > 0) {
        medicinesToRemind.forEach(med => {
          // Log or send actual reminder (Push notification, email, web push, etc.)
          console.log(`🔔 REMINDER: ${med.user.fullName}, it is time to take your medication: ${med.name} (${med.dosage})`);
          
          // Here, you would plug in Email/SMS or Push Notification logic
          // Example: sendEmail(med.user.email, 'Medication Reminder', \`Take \${med.name}\`);
        });
      }
    } catch (error) {
      console.error('Error in Reminder Engine:', error);
    }
  });
};
