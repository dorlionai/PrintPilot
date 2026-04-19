#!/bin/bash
# PrintPilot Hızlı Başlangıç

echo "================================================"
echo "  PrintPilot - Hızlı Başlangıç"
echo "================================================"
echo ""

# Repo klon
if [ ! -d "PrintPilot" ]; then
  echo "Repo klonlanıyor..."
  git clone https://github.com/dorlionai/PrintPilot.git
  cd PrintPilot
else
  cd PrintPilot
  echo "Repo güncelleniyor..."
  git pull
fi

# Bağımlılıkları kur
echo "Bağımlılıklar kuruluyor..."
npm install

# EAS CLI kur
echo "EAS CLI kuruluyor..."
npm install -g eas-cli

# Giriş yap
echo ""
echo "Expo hesabına giriş yapılıyor..."
echo "Kullanıcı adı: dorlionai"
eas login

echo ""
echo "================================================"
echo "  Hazır! Şimdi yapabilecekleriniz:"
echo "================================================"
echo ""
echo "Geliştirme (emülatör/cihaz):"
echo "  npx expo start"
echo ""
echo "Test APK:"
echo "  eas build --profile preview --platform android"
echo ""
echo "Production:"
echo "  eas build --profile production --platform android"
echo ""
