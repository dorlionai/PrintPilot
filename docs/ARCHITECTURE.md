# PrintPilot Mimari Dökümanı

## Teknoloji Yığını

```
PrintPilot
├── Frontend: React Native (Expo SDK 51)
├── Router: Expo Router v3
├── Veritabanı: SQLite (expo-sqlite)
├── UI: React Native Paper + Özel bileşenler
├── Stil: StyleSheet (custom dark theme)
├── Dil: TypeScript %99.8
└── Build: EAS Build
```

## Klasör Yapısı

```
PrintPilot/
├── app/
│   ├── _layout.tsx          # Root layout (Sentry, DB, Ads init)
│   ├── subscription.tsx     # Abonelik ekranı
│   └── (tabs)/
│       ├── _layout.tsx      # Tab navigasyon
│       ├── index.tsx        # Hesaplayıcı (Ana ekran)
│       ├── orders.tsx       # Sipariş geçmişi
│       ├── customers.tsx    # Müşteri yönetimi
│       ├── printers.tsx     # Yazıcı takibi
│       ├── stock.tsx        # Filament stok
│       ├── stats.tsx        # İstatistikler
│       └── admin.tsx        # Admin paneli
├── components/
│   ├── DashboardWidget.tsx  # İstatistik kartı
│   └── EmptyState.tsx       # Boş durum gösterimi
├── constants/
│   ├── theme.ts             # Renkler, fontlar, boyutlar
│   ├── i18n.ts              # Lokalizasyon ayarları
│   └── translations/
│       ├── tr.ts            # Türkçe
│       ├── en.ts            # İngilizce
│       ├── de.ts            # Almanca
│       └── zh.ts            # Çince
├── hooks/
│   ├── useDatabase.ts       # DB sorgu hook
│   └── useSubscription.ts   # Abonelik durumu hook
├── services/
│   ├── database.ts          # SQLite CRUD işlemleri
│   ├── calculator.ts        # Fiyat hesaplama motoru
│   ├── subscriptionService.ts # RevenueCat entegrasyonu
│   ├── adService.ts         # AdMob entegrasyonu
│   ├── pdfService.ts        # PDF teklif oluşturma
│   └── notificationService.ts # Bildirim yönetimi
├── docs/                    # Kurulum kılavuzları
└── scripts/                 # Build scriptleri
```

## Veri Akışı

```
Kullanıcı → Ekran → Service → SQLite → Service → Ekran
                              ↓
                        Firebase Analytics
                              ↓
                          Sentry (Hata)
```

## Abonelik Sistemi

```
Ücretsiz → 5 hesaplama/gün → RevenueCat → Standard (99₺/ay)
                                        → Dealer (199₺/ay)
```

## Build Pipeline

```
GitHub Push → EAS Build → APK/AAB → Google Play
```
