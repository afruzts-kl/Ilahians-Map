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
    // Set html lang attribute for accessibility and font selection
    document.documentElement.lang = lang;
  }, [lang]);

  // Set initial lang on mount
  useEffect(() => {
    document.documentElement.lang = lang;
  }, []);

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
