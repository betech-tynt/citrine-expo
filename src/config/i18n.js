import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import jp from './locales/jp';
import vi from './locales/vi';

const resources = {
    en: { translation: en },
    jp: { translation: jp },
    vi: { translation: vi },
};

// Simple default language without any native dependencies.
// You can change this to 'en' or 'jp' if needed.
const DEFAULT_LANGUAGE = 'vi';

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: DEFAULT_LANGUAGE,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
