#!/bin/bash
# PrintPilot — APK Build Scripti

set -e

echo "=================================="
echo "  PrintPilot APK Build"
echo "=================================="

# Expo token ayarla (login gerekmez)
export EXPO_TOKEN=cZbsb1_79VSxh84itGgxgxJmMuDi6iMyugA3Qulj

# EAS CLI kontrol
if ! command -v eas &> /dev/null; then
  echo "EAS CLI kuruluyor..."
  npm install -g eas-cli
fi

echo "Proje: @dorlionai/print-pilot"
echo "UUID: d5e37579-d386-4d4b-af5c-7fd472414057"
echo ""

# Bağımlılıkları kur
echo "npm install çalışıyor..."
npm install

echo ""
echo "Preview APK build başlıyor..."
echo "(Bu işlem 5-15 dakika sürebilir)"
echo ""

eas build --profile preview --platform android --non-interactive

echo ""
echo "Build tamamlandı!"
echo "APK'yı indirmek için Expo dashboard'ı kontrol et:"
echo "https://expo.dev/accounts/dorlionai/projects/print-pilot/builds"
