import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../constants/Config';
import userApiClient from '../api/userApiClient';

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  isDefault: boolean;
}

type Dict = Record<string, string>;

interface LanguageState {
  currentLanguage: string;
  translations: Dict;
  languages: SupportedLanguage[];
  initialized: boolean;
  t: (key: string, fallback?: string) => string;
  setLanguage: (lang: string) => Promise<void>;
  loadSavedLanguage: () => Promise<void>;
  refreshLanguages: () => Promise<void>;
}

const CACHE_PREFIX = 'salon_translations_';
const cacheKey = (lang: string) => `${CACHE_PREFIX}${lang}`;

export const useLanguageStore = create<LanguageState>((set, get) => ({
  currentLanguage: 'en',
  translations: {},
  languages: [],
  initialized: false,
  t: (key, fallback) => get().translations[key] || fallback || key,
  setLanguage: async (lang) => {
    const code = lang.toLowerCase();
    await AsyncStorage.setItem(Config.STORAGE_KEYS.LANGUAGE_PREF, code);
    try {
      const cached = await AsyncStorage.getItem(cacheKey(code));
      if (cached) set({ currentLanguage: code, translations: JSON.parse(cached) });
      const response = await userApiClient.get(`/languages/${code}/translations`);
      const data = response.data?.data;
      const translations = data?.translations || {};
      await AsyncStorage.setItem(cacheKey(code), JSON.stringify(translations));
      set({ currentLanguage: data?.code || code, translations });
    } catch {
      if (!get().translations || Object.keys(get().translations).length === 0) {
        const fallback = await AsyncStorage.getItem(cacheKey('en'));
        set({ currentLanguage: code, translations: fallback ? JSON.parse(fallback) : {} });
      } else {
        set({ currentLanguage: code });
      }
    }
  },
  loadSavedLanguage: async () => {
    const saved = (await AsyncStorage.getItem(Config.STORAGE_KEYS.LANGUAGE_PREF)) || 'en';
    try {
      const cached = await AsyncStorage.getItem(cacheKey(saved));
      if (cached) set({ currentLanguage: saved, translations: JSON.parse(cached) });
      const response = await userApiClient.get(`/languages/${saved}/translations`);
      const data = response.data?.data;
      const translations = data?.translations || {};
      await AsyncStorage.setItem(cacheKey(saved), JSON.stringify(translations));
      set({ currentLanguage: data?.code || saved, translations, initialized: true });
    } catch {
      set({ currentLanguage: saved, initialized: true });
    }
  },
  refreshLanguages: async () => {
    const response = await userApiClient.get('/languages');
    set({ languages: response.data?.data || [] });
  },
}));
