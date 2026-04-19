# AdMob Kurulum Kılavuzu

## 1. AdMob Hesabı
1. https://admob.google.com git
2. Uygulama ekle → Android → `com.dorlionai.printpilot`
3. App ID al: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`

## 2. Ad Unit'leri Oluştur
- **Banner**: Uygulama içi banner → ID al
- **Interstitial**: Tam ekran arası → ID al  
- **Rewarded**: Ödüllü video → ID al (EKSİK OLAN BU)

## 3. app.json Güncelle
```json
"plugins": [
  ["react-native-google-mobile-ads", {
    "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
  }]
]
```

## 4. services/adService.ts Güncelle
```typescript
const USE_TEST_IDS = false;  // DEĞİŞTİR
const USE_MOCK_ADS = false;  // DEĞİŞTİR

export const AD_UNIT_IDS = {
  banner: 'ca-app-pub-XXXX/banner_id',
  interstitial: 'ca-app-pub-XXXX/interstitial_id',
  rewarded: 'ca-app-pub-XXXX/rewarded_id',  // BURAYA EKLE
};
```

## 5. Test
- Geliştirme sırasında USE_TEST_IDS=true kalmalı
- Production build öncesi false yap
