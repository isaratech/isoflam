import { frTranslations } from 'src/translations/fr';
import { enTranslations } from 'src/translations/en';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useEffect } from 'react';

// Define a union type for all supported languages
export type SupportedLanguage = 'fr' | 'en';

// Create a translations object that maps language codes to translation objects
const translations = {
  fr: frTranslations,
  en: enTranslations
};

// Define a type for translation keys that works across all languages
export type TranslationKey = keyof typeof frTranslations | keyof typeof enTranslations;

export const useTranslation = () => {
  const language = useUiStateStore((state) => {
    return state.language || 'fr';
  });
  const setLanguage = useUiStateStore((state) => {
    return state.actions.setLanguage;
  });

  // Load language from localStorage on initial render
  useEffect(() => {
    const savedLanguage = localStorage.getItem(
      'language'
    ) as SupportedLanguage | null;
    if (savedLanguage && savedLanguage !== language) {
      setLanguage(savedLanguage);
    }
  }, [setLanguage, language]);

  // Save language to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: TranslationKey): string => {
    const translationObj = translations[language] || translations.fr;
    return translationObj[key] || key;
  };

  const changeLanguage = (newLanguage: SupportedLanguage) => {
    setLanguage(newLanguage);
  };

  return { t, language, changeLanguage };
};
