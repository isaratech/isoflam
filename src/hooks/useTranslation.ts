import { frTranslations, TranslationKey } from 'src/translations/fr';

export const useTranslation = () => {
  const t = (key: TranslationKey): string => {
    return frTranslations[key] || key;
  };

  return { t };
};
