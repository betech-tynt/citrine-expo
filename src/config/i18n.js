import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './locales/en';
import jp from './locales/jp';
import vi from './locales/vi';

const resources = {
    en: { translation: en },
    jp: { translation: jp },
    vi: { translation: vi },
};

i18n.use(initReactI18next).init({
    resources,
    lng: Localization.getLocales()[0]?.languageCode || 'en', // Set default language
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
