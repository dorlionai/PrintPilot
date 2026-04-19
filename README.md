# PrintPilot 🖨️

3D baskı işletmecileri için kapsamlı mobil yönetim uygulaması.

**Expo/React Native | Android/Google Play | TypeScript**

## Özellikler

- 💰 **Fiyat Hesaplayıcı** — filament, elektrik, işçilik, fire, komisyon, KDV
- 📋 **Sipariş Geçmişi** — PDF teklif oluşturma ve paylaşma
- 👥 **Müşteri Yönetimi** — müşteri listesi ve geçmiş
- 🖨️ **Yazıcı Takibi** — yazıcı bazlı maliyet ve kullanım
- 📦 **Filament Stok** — stok girişi ve takibi
- 📊 **İstatistikler** — aylık/günlük gelir analizi
- ⚙️ **Admin Paneli** — ayarlar ve abonelik yönetimi

## Altyapı

| Servis | Durum |
|--------|-------|
| RevenueCat | Kuruldu — API key gerekli |
| AdMob | Kuruldu — Rewarded ID gerekli |
| Firebase Analytics | Yapılandırıldı |
| Sentry | Kuruldu — DSN gerekli |
| EAS Build | Hazır |
| i18n TR/EN/DE/ZH | Tamamlandı |

## Kurulum

```bash
git clone https://github.com/dorlionai/PrintPilot.git
cd PrintPilot
npm install
npx expo start
```

## Build

```bash
# Test APK
eas build --profile preview --platform android

# Production
eas build --profile production --platform android
```

## Dokümantasyon

- [RevenueCat Kurulumu](docs/REVENUECAT_SETUP.md)
- [AdMob Kurulumu](docs/ADMOB_SETUP.md)
- [EAS Build](docs/EAS_BUILD.md)
- [Play Console](docs/PLAY_CONSOLE.md)
- [Play Store Checklist](PLAY_STORE_CHECKLIST.md)

## Sprint Durumu

- ✅ Sprint 1 — Temel altyapı, hesaplayıcı, CRUD ekranlar
- ✅ Sprint 2 — Yazıcılar, stok, PDF, bildirimler, abonelik ekranı
- ✅ Sprint 3 — Bileşenler, hooks, dokümantasyon, build hazırlığı
- ⏳ Sprint 4 — RevenueCat/AdMob gerçek key'ler, APK build, Play Store

## Geliştirici

Dorlion AI — dorlion.ai26@gmail.com
