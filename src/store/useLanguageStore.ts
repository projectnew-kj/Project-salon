import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userApiClient from '../api/userApiClient';
import enTranslations from '../i18n/en.json';

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

const ENGLISH: Dict = enTranslations as Dict;

const readCachedTranslations = async (code: string): Promise<Dict | null> => {
  try {
    const cached = await AsyncStorage.getItem(cacheKey(code));
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

const saveCachedTranslations = async (code: string, translations: Dict) => {
  try {
    await AsyncStorage.setItem(cacheKey(code), JSON.stringify(translations));
  } catch {
    // Cache is optional. Never block app startup because storage is unavailable.
  }
};

export const useLanguageStore = create<LanguageState>((set, get) => ({
  // English is always the first safe language.
  currentLanguage: 'en',
  translations: ENGLISH,
  languages: [],
  initialized: false,

  t: (key, fallback) => {
    const value = get().translations[key];
    return value || fallback || key;
  },

  setLanguage: async (lang) => {
    const code = (lang || 'en').toLowerCase();

    // Switch UI immediately. This prevents a language request from blocking navigation.
    if (code === 'en') {
      set({ currentLanguage: 'en', translations: ENGLISH, initialized: true });
    } else {
      const cached = await readCachedTranslations(code);
      if (cached) {
        set({ currentLanguage: code, translations: cached, initialized: true });
      } else {
        set({ currentLanguage: code, translations: ENGLISH, initialized: true });
      }
    }

    try {
      await AsyncStorage.setItem('user_language', code);
    } catch {
      // Preference storage is optional.
    }

    try {
      const response = await userApiClient.get(`/languages/${code}/translations`);
      const data = response.data?.data;
      const translations = data?.translations;

      if (translations && typeof translations === 'object') {
        await saveCachedTranslations(code, translations);
        set({
          currentLanguage: data?.code || code,
          translations,
          initialized: true,
        });
      }
    } catch {
      // Keep the already-rendered local/cache language.
      // For a first launch this is English.
    }
  },

  loadSavedLanguage: async () => {
    // Render-safe state is established immediately.
    set({
      currentLanguage: 'en',
      translations: ENGLISH,
      initialized: true,
    });

    let saved = 'en';
    try {
      saved = ((await AsyncStorage.getItem('user_language')) || 'en').toLowerCase();
    } catch {
      saved = 'en';
    }

    // Restore cached language immediately when available.
    if (saved !== 'en') {
      const cached = await readCachedTranslations(saved);
      if (cached) {
        set({
          currentLanguage: saved,
          translations: cached,
          initialized: true,
        });
      }
    }

    // Backend refresh is intentionally non-blocking.
    try {
      const response = await userApiClient.get(`/languages/${saved}/translations`);
      const data = response.data?.data;
      const translations = data?.translations;

      if (translations && typeof translations === 'object') {
        await saveCachedTranslations(saved, translations);
        set({
          currentLanguage: data?.code || saved,
          translations,
          initialized: true,
        });
      }
    } catch {
      // Offline/backend-down: stay on cached language or English.
    }
  },

  refreshLanguages: async () => {
    try {
      const response = await userApiClient.get('/languages');
      set({ languages: response.data?.data || [] });
    } catch {
      // Language list is optional. Do not break the app.
      set({ languages: [] });
    }
  },
}));
