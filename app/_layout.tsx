import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';
import { initDatabase } from '../services/database';
import { initPurchases } from '../services/subscriptionService';
import { initAds } from '../services/adService';

Sentry.init({
  dsn: 'TODO_SENTRY_DSN',
  tracesSampleRate: 1.0,
});

export default function RootLayout() {
  useEffect(() => {
    initDatabase();
    initPurchases();
    initAds();
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