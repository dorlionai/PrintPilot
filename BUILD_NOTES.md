# Build Notes

## Tamamlananlar
- RevenueCat kuruldu (2 plan: Standard 99₺ / Dealer 199₺)
- AdMob kuruldu (Banner, Interstitial - Rewarded ID eksik)
- Firebase Analytics yapılandırıldı
- Sentry crash reporting kuruldu
- EAS Build hazır (3 profil)
- i18n TR/EN/DE/ZH
- SQLite veritabanı (orders, customers, printers, stock, settings)
- Fiyat hesaplayıcı (filament, elektrik, işçilik, fire, komisyon, KDV)

## Kritik Uyarılar
1. `tr-TR` format sabit bırakıldı - AsyncStorage uyumluluğu için
2. USE_MOCK_* flagler PRODUCTION'da false yapılmalı
3. google-services.json git'e eklenmemeli (.gitignore'da)
4. Rewarded Ad ID eksik - AdMob'dan alınacak

## Versiyon
- Expo SDK: 51
- React Native: 0.74
- Target SDK: 34 (Android 14)
