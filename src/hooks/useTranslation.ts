import {frTranslations} from 'src/translations/fr';
import {enTranslations} from 'src/translations/en';
import {useUiStateStore} from 'src/stores/uiStateStore';
import {useEffect} from 'react';

// Define a union type for all supported languages
export type SupportedLanguage = 'fr' | 'en';

// Create a translations object that maps language codes to translation objects
const translations = {
  fr: frTranslations,
  en: enTranslations
};

// Define a type for translation keys that works across all languages
export type TranslationKey = keyof typeof frTranslations | keyof typeof enTranslations;

// Function to detect browser locale and return supported language or fallback to English
const getBrowserLocale = (): SupportedLanguage => {
    const browserLanguage = navigator.language.toLowerCase();

    // Check if browser language starts with 'fr' (French)
    if (browserLanguage.startsWith('fr')) {
        return 'fr';
    }

    // Check if browser language starts with 'en' (English)
    if (browserLanguage.startsWith('en')) {
        return 'en';
    }

    // For any other language, fallback to English
    return 'en';
};

export const useTranslation = () => {
  const language = useUiStateStore((state) => {
      return state.language || getBrowserLocale();
  });
  const setLanguage = useUiStateStore((state) => {
    return state.actions.setLanguage;
  });

    // Load language from localStorage on initial render, or use browser locale as default
  useEffect(() => {
    const savedLanguage = localStorage.getItem(
      'language'
    ) as SupportedLanguage | null;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    } else {
        // No saved language, use browser locale
        setLanguage(getBrowserLocale());
    }
  }, []);

  // Save language to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: TranslationKey): string => {
      const translationObj = translations[language] || translations.en;
    return translationObj[key] || key;
  };

  const changeLanguage = (newLanguage: SupportedLanguage) => {
    setLanguage(newLanguage);
  };

  return { t, language, changeLanguage };
};
