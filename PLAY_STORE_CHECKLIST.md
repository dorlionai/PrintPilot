# Play Store Checklist

## Yapılacaklar

### 1. Expo / EAS
- [ ] `eas build:configure` → `app.json`'daki `TODO_REPLACE_WITH_EXPO_UUID` doldur
- [ ] EAS hesabına giriş: `eas login`

### 2. AdMob
- [x] Banner ID eklendi
- [x] Interstitial ID eklendi  
- [ ] Rewarded ID al → `services/adService.ts` güncelle
- [ ] `USE_TEST_IDS = false` yap
- [ ] `USE_MOCK_ADS = false` yap

### 3. RevenueCat
- [ ] RevenueCat Console'da proje oluştur
- [ ] 2 ürün ekle: `printpilot_standard_monthly` (99₺) ve `printpilot_dealer_monthly` (199₺)
- [ ] Android API key al
- [ ] `services/subscriptionService.ts` → `TODO_REVENUECAT_API_KEY` güncelle
- [ ] `USE_MOCK_STORE = false` yap

### 4. Firebase
- [x] `google-services.json` eklendi
- [ ] Prod ortamda test et

### 5. Sentry
- [x] Kuruldu
- [ ] `app/_layout.tsx` → `TODO_SENTRY_DSN` güncelle

### 6. Play Console
- [ ] `google-play-service-account.json` ekle (EAS submit için)
- [ ] Uygulama oluştur
- [ ] Data Safety formu doldur
- [ ] Gizlilik politikası URL'si ekle

## Build Komutları
```bash
# Development
eas build --profile development --platform android

# Preview APK
eas build --profile preview --platform android

# Production
eas build --profile production --platform android

# Submit
eas submit --platform android
```
