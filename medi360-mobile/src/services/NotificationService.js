import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications behave when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Service to handle medication push notifications using Expo Notifications.
 */
class NotificationService {
  /**
   * Request permissions from the user.
   */
  async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Schedule daily push notifications for a given list of medicines.
   * Clears old scheduled notifications entirely before re-scheduling to avoid duplicates.
   * 
   * @param {Array} medicines - List of medicine objects with 'name' and 'times' array.
   */
  async scheduleMedicineReminders(medicines = []) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Notification permissions not granted.');
        return;
      }

      // Clear any existing notifications so we don't get duplicates when schedule is updated
      await Notifications.cancelAllScheduledNotificationsAsync();

      let scheduledCount = 0;

      for (const med of medicines) {
        if (!med.times || !Array.isArray(med.times)) continue;

        for (const timeStr of med.times) {
          const [hourStr, minuteStr] = timeStr.split(':');
          const hour = parseInt(hourStr, 10);
          const minute = parseInt(minuteStr, 10);

          if (!isNaN(hour) && !isNaN(minute)) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: '💊 Time for your Medicine!',
                body: `Don't forget to take ${med.name}${med.dosage ? ` (${med.dosage})` : ''}.`,
                data: { medicineId: med._id, action: 'take_medicine' },
                sound: true,
              },
              trigger: {
                hour,
                minute,
                repeats: true, // Schedule it to repeat daily at this time
              },
            });
            scheduledCount++;
          }
        }
      }

      console.log(`[NotificationService] Successfully scheduled ${scheduledCount} daily reminders.`);
    } catch (error) {
      console.error('[NotificationService] Error scheduling notifications:', error);
    }
  }

  /**
   * Testing function to fire an immediate notification.
   */
  async testNotification() {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Notification System Active',
        body: 'You will now receive your scheduled medicine reminders here.',
      },
      trigger: null, // Send immediately
    });
  }
}

export default new NotificationService();
