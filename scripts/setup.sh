#!/bin/bash
# PrintPilot Kurulum Scripti

echo "PrintPilot kurulum basliyor..."

# Node modules kur
npm install

# Expo CLI kur
npm install -g expo-cli eas-cli

# EAS configure (UUID doldurmak için)
echo "EAS Configure baslatiliyor..."
echo "Bu adımda expo.dev hesabına giriş yapmanız gerekebilir."
# eas build:configure  # Manuel çalıştır

echo ""
echo "Kurulum tamamlandi!"
echo ""
echo "Sonraki adimlar:"
echo "1. RevenueCat API key'i ekle: docs/REVENUECAT_SETUP.md"
echo "2. AdMob Rewarded ID ekle: docs/ADMOB_SETUP.md"
echo "3. eas build:configure calistir"
echo "4. npx expo start ile test et"
echo ""
echo "Gelistirme:"
echo "  npx expo start"
echo ""
echo "APK build:"
echo "  eas build --profile preview --platform android"
