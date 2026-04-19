// AdMob — Production build için etkinleştir
// Şu an mock modda (test için)

export const AD_UNIT_IDS = {
  banner: 'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
};

export async function initAds() {
  // Production'da: import mobileAds from 'react-native-google-mobile-ads'
  console.log('Ads: mock mod aktif');
}

export function loadInterstitial() {
  // Mock
}

export function showInterstitial(): Promise<void> {
  return Promise.resolve();
}