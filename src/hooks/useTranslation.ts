import {frTranslations} from 'src/translations/fr';
import {enTranslations} from 'src/translations/en';
import {useUiStateStore} from 'src/stores/uiStateStore';
import {useCallback} from 'react';

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
    return state.language;
  });
  const setLanguage = useUiStateStore((state) => {
    return state.actions.setLanguage;
  });

  const t = useCallback(
    (key: TranslationKey): string => {
      const translationObj = translations[language] || translations.en;
      return translationObj[key] || key;
    },
    [language]
  );

  return { t, language, changeLanguage: setLanguage };
};
