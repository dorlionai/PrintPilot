import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import { tr } from './translations/tr';
import { en } from './translations/en';
import { de } from './translations/de';
import { zh } from './translations/zh';

const i18n = new I18n({ tr, en, de, zh });

// Gemini önerisi: Dil algılama iyileştirildi
const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'tr';
i18n.locale = ['tr', 'en', 'de', 'zh'].includes(deviceLang) ? deviceLang : 'tr';
i18n.enableFallback = true;
i18n.defaultLocale = 'tr';

export default i18n;
export const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);
export const setLocale = (lang: string) => { i18n.locale = lang; };
export const getCurrentLocale = () => i18n.locale;