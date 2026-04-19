import AsyncStorage from '@react-native-async-storage/async-storage';

const DAILY_CALC_KEY = 'tr-TR_daily_calc_count';
const DAILY_LIMIT = 5;

// Mock mod - Production'da RevenueCat ekle
export async function initPurchases() {
  console.log('Purchases: mock mod aktif');
}

export async function getSubscriptionStatus(): Promise<'free' | 'standard' | 'dealer'> {
  return 'free'; // Mock: herkes ücretsiz
}

export async function getDailyCalcCount(): Promise<number> {
  try {
    const stored = await AsyncStorage.getItem(DAILY_CALC_KEY);
    if (!stored) return 0;
    const { date, count } = JSON.parse(stored);
    if (date !== new Date().toLocaleDateString('tr-TR')) return 0;
    return count;
  } catch { return 0; }
}

export async function incrementDailyCalc(): Promise<boolean> {
  try {
    const count = await getDailyCalcCount();
    const status = await getSubscriptionStatus();
    if (status !== 'free' || count < DAILY_LIMIT) {
      const newCount = count + 1;
      await AsyncStorage.setItem(DAILY_CALC_KEY, JSON.stringify({
        date: new Date().toLocaleDateString('tr-TR'), count: newCount
      }));
      return true;
    }
    return false;
  } catch { return true; }
}