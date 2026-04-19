import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyReminder(hour: number = 9, minute: number = 0): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'PrintPilot',
      body: 'Bugünün siparişlerini kontrol etmeyi unutma!',
      sound: true,
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    } as any,
  });
}

export async function sendLocalNotification(title: string, body: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
}