import { createContext, useContext } from 'react';
import { Language, TranslationKey, getTranslator } from './i18n';

export interface LanguageContextType {
  language: Language;
  t: (key: TranslationKey) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'it',
  t: getTranslator('it'),
});

export const useLanguage = () => useContext(LanguageContext);
