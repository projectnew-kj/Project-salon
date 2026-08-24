import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../i18n/en.json';
import ta from '../i18n/ta.json';
import hi from '../i18n/hi.json';
import kn from '../i18n/kn.json';
import ml from '../i18n/ml.json';
import { Config } from '../constants/Config';

const translations: Record<string, typeof en> = {
  en,
  ta,
  hi,
  kn,
  ml
};

interface LanguageState {
  currentLanguage: string;
  t: (key: keyof typeof en) => string;
  setLanguage: (lang: string) => Promise<void>;
  loadSavedLanguage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  currentLanguage: 'en',
  t: (key) => {
    const lang = get().currentLanguage;
    const dict = translations[lang] || translations.en;
    return dict[key] || key;
  },
  setLanguage: async (lang: string) => {
    await AsyncStorage.setItem(Config.STORAGE_KEYS.LANGUAGE_PREF, lang);
    set({ currentLanguage: lang });
  },
  loadSavedLanguage: async () => {
    const saved = await AsyncStorage.getItem(Config.STORAGE_KEYS.LANGUAGE_PREF);
    if (saved) {
      set({ currentLanguage: saved });
    }
  }
}));