import Purchases, { PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAILY_CALC_KEY = 'tr-TR_daily_calc_count'; // Sabit bırakılmalı - mevcut kullanıcı verisi
const DAILY_LIMIT = 5;

export const PLANS = {
  STANDARD: 'printpilot_standard_monthly',
  DEALER: 'printpilot_dealer_monthly',
};

export async function initPurchases() {
  Purchases.configure({ apiKey: 'TODO_REVENUECAT_API_KEY' });
}

export async function getSubscriptionStatus(): Promise<'free' | 'standard' | 'dealer'> {
  try {
    const info = await Purchases.getCustomerInfo();
    if (info.entitlements.active['dealer']) return 'dealer';
    if (info.entitlements.active['standard']) return 'standard';
    return 'free';
  } catch { return 'free'; }
}

export async function getDailyCalcCount(): Promise<number> {
  const stored = await AsyncStorage.getItem(DAILY_CALC_KEY);
  if (!stored) return 0;
  const { date, count } = JSON.parse(stored);
  if (date !== new Date().toLocaleDateString('tr-TR')) return 0;
  return count;
}

export async function incrementDailyCalc(): Promise<boolean> {
  const count = await getDailyCalcCount();
  const status = await getSubscriptionStatus();
  if (status !== 'free' || count < DAILY_LIMIT) {
    const newCount = count + 1;
    await AsyncStorage.setItem(DAILY_CALC_KEY, JSON.stringify({ date: new Date().toLocaleDateString('tr-TR'), count: newCount }));
    return true;
  }
  return false; // Limit doldu
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
  try {
    await Purchases.purchasePackage(pkg);
    return true;
  } catch (e: any) {
    if (!e.userCancelled) throw e;
    return false;
  }
}