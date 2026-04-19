import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import { tr } from './translations/tr';
import { en } from './translations/en';

const i18n = new I18n({ tr, en });
i18n.locale = Localization.getLocales()[0]?.languageCode ?? 'tr';
i18n.enableFallback = true;
i18n.defaultLocale = 'tr';
export default i18n;
export const t = (key: string, options?: object) => i18n.t(key, options);