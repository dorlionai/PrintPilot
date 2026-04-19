# Sprint 4 Durum Raporu

## Expo
- ✅ Hesap açıldı: dorlionai (dorlion.ai26@gmail.com)
- ✅ Proje oluşturuldu: PrintPilot
- ✅ Project UUID: 35ed9be8-5a48-4037-8a29-34e8e6e752be
- ✅ app.json güncellendi (owner: dorlion-ai)

## GitHub
- ✅ Repo: github.com/dorlionai/PrintPilot
- ✅ 43+ commit, tam proje
- ✅ Sprint 1-2-3-4 tamamlandı

## Kalan (Manuel Yapılacak)

### RevenueCat — app.revenuecat.com
1. Google ile giriş yap
2. "New project" → PrintPilot
3. Google Play bağla → bundle: com.dorlionai.printpilot
4. Entitlements: `standard`, `dealer`
5. Products: printpilot_standard_monthly (₺99), printpilot_dealer_monthly (₺199)
6. API Key kopyala → services/subscriptionService.ts → TODO_REVENUECAT_API_KEY

### AdMob — admob.google.com
1. Uygulama ekle → Android → com.dorlionai.printpilot
2. Rewarded Ad Unit oluştur
3. ID kopyala → services/adService.ts → TODO_REWARDED_AD_UNIT_ID
4. USE_TEST_IDS = false
5. USE_MOCK_ADS = false

### Sentry — sentry.io
1. Hesap aç / giriş yap
2. Proje oluştur → React Native
3. DSN kopyala → app/_layout.tsx → TODO_SENTRY_DSN

### EAS Build (Bilgisayarda Terminal)
```bash
git clone https://github.com/dorlionai/PrintPilot.git
cd PrintPilot
npm install
npx eas-cli login  # dorlionai / Dorlion2026!
eas build --profile preview --platform android
```

## Build Sonrası
- APK indir → telefona yükle → test et
- Sorun yoksa: eas build --profile production --platform android
- Play Console'a yükle → yayınla
