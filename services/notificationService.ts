import * as Notifications from 'expo-notifications';
import { getOrders } from './database';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// LevelAI önerisi: Akıllı günlük özet bildirimi
export async function scheduleDailyDigest(hour: number = 20, minute: number = 0): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  try {
    const orders = getOrders() as any[];
    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today);
    const todayRevenue = todayOrders.reduce((s: number, o: any) => s + (o.sale_price || 0), 0);
    
    const body = todayOrders.length > 0
      ? `Bugün ${todayOrders.length} sipariş — ₺${todayRevenue.toFixed(0)} gelir! 🎉`
      : 'Bugün henüz sipariş yok. Hesaplayıcıyı kullanmayı deneyin! 📊';
    
    await Notifications.scheduleNotificationAsync({
      content: { title: 'PrintPilot Günlük Özet', body, sound: true, badge: todayOrders.length },
      trigger: { hour, minute, repeats: true } as any,
    });
  } catch {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'PrintPilot', body: 'Bugünün siparişlerini kontrol et!', sound: true },
      trigger: { hour, minute, repeats: true } as any,
    });
  }
}

// LevelAI önerisi: Başarı bildirimi
export async function sendAchievementNotification(achievement: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title: '🏆 Başarı Kazandın!', body: achievement, sound: true },
    trigger: null,
  });
}

export async function sendLocalNotification(title: string, body: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
}