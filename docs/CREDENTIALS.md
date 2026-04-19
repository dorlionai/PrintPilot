# PrintPilot — Hesap Referansı

> Bu dosya git'e push edilmemelidir.
> Tokenları buraya kaydetme — sadece yapı referansı için.

## Hesaplar

| Platform | Kullanıcı | URL |
|----------|-----------|-----|
| GitHub | @dorlionai | github.com/dorlionai/PrintPilot |
| Expo | dorlionai | expo.dev/accounts/dorlionai |
| Firebase | Dorlion-AI | console.firebase.google.com |
| HuggingFace | @dorlionai | huggingface.co/dorlionai |

## Expo Proje Bilgileri
- Project: @dorlionai/print-pilot
- UUID: d5e37579-d386-4d4b-af5c-7fd472414057
- Dashboard: https://expo.dev/accounts/dorlionai/projects/print-pilot

## Eksik API Keyler (Manuel Eklenecek)
- RevenueCat API Key → services/subscriptionService.ts
- AdMob App ID → app.json plugins
- AdMob Rewarded ID → services/adService.ts  
- Sentry DSN → app/_layout.tsx
- google-play-service-account.json → EAS submit için

## Build Komutu
```bash
export EXPO_TOKEN=<expo-access-token>
eas build --profile preview --platform android
```
