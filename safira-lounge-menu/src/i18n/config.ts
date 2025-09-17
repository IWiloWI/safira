import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translations from '../data/translations.json';

const resources = {
  de: { translation: translations.de },
  da: { translation: translations.da },
  en: { translation: translations.en },
  tr: { translation: translations.tr },
  it: { translation: translations.it }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'de',
    fallbackLng: 'de',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;