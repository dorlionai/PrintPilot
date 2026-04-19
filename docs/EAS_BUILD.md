# EAS Build Kılavuzu

## Hazırlık

### 1. Expo hesabı oluştur
```bash
npx expo login
# veya: https://expo.dev/signup
```

### 2. EAS CLI kur
```bash
npm install -g eas-cli
eas login
```

### 3. UUID doldur
```bash
eas build:configure
# Bu komut app.json'daki TODO_REPLACE_WITH_EXPO_UUID'yi otomatik doldurur
```

## Build Komutları

### Test APK (ücretsiz)
```bash
eas build --profile preview --platform android
# Sonuç: .apk dosyası - cihaza direkt yüklenebilir
```

### Production AAB (Play Store için)
```bash
eas build --profile production --platform android
# Sonuç: .aab dosyası - Play Store'a yüklenir
```

### Play Store'a Gönder
```bash
eas submit --platform android
# google-play-service-account.json gerekir
```

## İlk Build Kontrol Listesi
- [ ] `eas build:configure` çalıştırıldı
- [ ] RevenueCat API key eklendi
- [ ] AdMob Rewarded ID eklendi
- [ ] USE_MOCK_* = false yapıldı
- [ ] google-services.json mevcut (git'e değil)
- [ ] Expo hesabına giriş yapıldı
