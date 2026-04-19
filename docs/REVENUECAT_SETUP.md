# RevenueCat Kurulum Kılavuzu

## 1. RevenueCat Console

1. https://app.revenuecat.com adresine git
2. "Create new project" → **PrintPilot** yaz
3. Platform ekle: **Google Play**
4. Bundle ID: `com.dorlionai.printpilot`
5. API Key'i kopyala (Android Public Key) → `rc_XXXXXXXX`

## 2. Entitlement Oluştur
- Entitlements → New → `standard`
- Entitlements → New → `dealer`

## 3. Ürün Oluştur (Önce Play Console'da)
Google Play Console → Uygulamalar → In-app products:
- `printpilot_standard_monthly` → ₺99/ay
- `printpilot_dealer_monthly` → ₺199/ay

## 4. Offering Oluştur
RevenueCat → Offerings → New → **default**
- Package ekle: Standard → printpilot_standard_monthly
- Package ekle: Dealer → printpilot_dealer_monthly

## 5. API Key'i Koda Ekle
```typescript
// services/subscriptionService.ts satır 10:
Purchases.configure({ apiKey: 'rc_BURAYA_API_KEY_GEL' });
```

## 6. Test Et
- Android emülatörde veya fiziksel cihazda çalıştır
- RevenueCat Dashboard'dan satın alma izle
