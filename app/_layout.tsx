import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from '../services/database';
import { initPurchases } from '../services/subscriptionService';
import { initAds } from '../services/adService';

export default function RootLayout() {
  useEffect(() => {
    try { initDatabase(); } catch(e) { console.error('DB init:', e); }
    try { initPurchases(); } catch(e) { console.error('Purchases init:', e); }
    try { initAds(); } catch(e) { console.error('Ads init:', e); }
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}