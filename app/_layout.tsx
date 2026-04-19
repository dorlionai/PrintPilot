import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from '../services/database';

export default function RootLayout() {
  useEffect(() => {
    try { initDatabase(); } catch(e) { console.error('DB init:', e); }
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