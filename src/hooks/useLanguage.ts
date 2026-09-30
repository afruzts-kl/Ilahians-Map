import { useState, useEffect, useCallback } from 'react';
import { SupportedLanguage, TRANSLATIONS, Translations } from '../services/i18n';
import { voiceGuidance } from '../services/voiceGuidance';

export function useLanguage() {
  const [lang, setLang] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('ilahianav_lang');
    return (saved as SupportedLanguage) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('ilahianav_lang', lang);
    voiceGuidance.setLanguage(lang);
  }, [lang]);

  const toggleLanguage = useCallback(() => {
    setLang(prev => (prev === 'en' ? 'ml' : 'en'));
  }, []);

  const t: Translations = TRANSLATIONS[lang];

  return {
    lang,
    setLang,
    toggleLanguage,
    t
  };
}
