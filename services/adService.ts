import mobileAds, { BannerAd, BannerAdSize, InterstitialAd, AdEventType, RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';

// USE_TEST_IDS = true iken test ID kullanılır
const USE_TEST_IDS = true; // TODO: false yap - production
const USE_MOCK_ADS = true; // TODO: false yap - production

export const AD_UNIT_IDS = {
  banner: USE_TEST_IDS ? 'ca-app-pub-3940256099942544/6300978111' : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  interstitial: USE_TEST_IDS ? 'ca-app-pub-3940256099942544/1033173712' : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  rewarded: USE_TEST_IDS ? 'ca-app-pub-3940256099942544/5224354917' : 'TODO_REWARDED_AD_UNIT_ID',
};

export async function initAds() {
  if (USE_MOCK_ADS) return;
  await mobileAds().initialize();
}

let interstitialAd: InterstitialAd | null = null;

export function loadInterstitial() {
  if (USE_MOCK_ADS) return;
  interstitialAd = InterstitialAd.createForAdRequest(AD_UNIT_IDS.interstitial);
  interstitialAd.load();
}

export function showInterstitial(): Promise<void> {
  return new Promise((resolve) => {
    if (USE_MOCK_ADS || !interstitialAd) { resolve(); return; }
    interstitialAd.addAdEventListener(AdEventType.CLOSED, () => { loadInterstitial(); resolve(); });
    interstitialAd.show();
  });
}