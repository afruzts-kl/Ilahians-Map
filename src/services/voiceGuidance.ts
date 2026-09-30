import { SupportedLanguage } from './i18n';

class VoiceGuidanceService {
  private isEnabled: boolean = true;
  private currentLanguage: SupportedLanguage = 'en';

  constructor() {
    const saved = localStorage.getItem('ilahianav_voice_guidance');
    if (saved !== null) {
      this.isEnabled = saved === 'true';
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    localStorage.setItem('ilahianav_voice_guidance', String(enabled));
    if (!enabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  public setLanguage(lang: SupportedLanguage) {
    this.currentLanguage = lang;
  }

  public speak(text: string) {
    if (!this.isEnabled) return;
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Stop any pending voice

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Slightly slower, clear voice
      utterance.pitch = 1.0;

      // Select voice based on language
      const voices = window.speechSynthesis.getVoices();
      if (this.currentLanguage === 'ml') {
        const mlVoice = voices.find(v => v.lang.startsWith('ml') || v.lang.includes('IN'));
        if (mlVoice) utterance.voice = mlVoice;
        utterance.lang = 'ml-IN';
      } else {
        const enVoice = voices.find(v => v.lang.startsWith('en-IN') || v.lang.startsWith('en'));
        if (enVoice) utterance.voice = enVoice;
        utterance.lang = 'en-US';
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis not available or blocked', e);
    }
  }

  public stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const voiceGuidance = new VoiceGuidanceService();
