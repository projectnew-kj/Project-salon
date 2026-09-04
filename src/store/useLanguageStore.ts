import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/apiClient';
import { Config } from '../constants/Config';

export interface AdminLanguage {
  _id: string;
  code: string;
  name: string;
  nativeName: string;
  isDefault: boolean;
  isActive: boolean;
  translations: Record<string, string>;
}

interface State {
  currentLanguage: string;
  translations: Record<string, string>;
  languages: AdminLanguage[];
  t: (key: string, fallback?: string) => string;
  setLanguage: (code: string) => Promise<void>;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
}

const DEFAULT_LANGUAGE = 'en';
const cacheKey = (code: string) => `admin_translations_${code}`;

export const useLanguageStore = create<State>((set, get) => ({
  // English is always the safe startup language.
  currentLanguage: DEFAULT_LANGUAGE,
  translations: {},

  languages: [],

  t: (key, fallback) => get().translations[key] || fallback || key,

  setLanguage: async (code) => {
    const nextLanguage = code?.trim() || DEFAULT_LANGUAGE;

    try {
      await AsyncStorage.setItem(
        Config.STORAGE_KEYS.LANGUAGE_PREF,
        nextLanguage,
      );
    } catch {
      // Local storage is optional for startup.
    }

    // Render cached translations immediately when available.
    try {
      const cached = await AsyncStorage.getItem(cacheKey(nextLanguage));
      if (cached) {
        const translations = JSON.parse(cached);
        set({
          currentLanguage: nextLanguage,
          translations:
            translations && typeof translations === 'object'
              ? translations
              : {},
        });
      }
    } catch {
      // Keep the existing language/translation state.
    }

    // Remote translations are optional. Never block/crash the app when the API
    // (or Socket.IO/backend) is unavailable.
    try {
      const response = await apiClient.get(
        `/languages/${nextLanguage}/translations`,
      );
      const translations = response.data?.data?.translations || {};

      try {
        await AsyncStorage.setItem(
          cacheKey(nextLanguage),
          JSON.stringify(translations),
        );
      } catch {
        // Ignore cache failures.
      }

      set({
        currentLanguage: nextLanguage,
        translations,
      });
    } catch {
      // Keep cached translations. If none exist, fall back to English.
      if (!get().translations || Object.keys(get().translations).length === 0) {
        set({
          currentLanguage:
            nextLanguage === DEFAULT_LANGUAGE ? DEFAULT_LANGUAGE : DEFAULT_LANGUAGE,
          translations: {},
        });
      }
    }
  },

  initialize: async () => {
    // Always establish English first. This guarantees a usable UI even
    // when networking, language APIs, or Socket.IO are unavailable.
    set({
      currentLanguage: DEFAULT_LANGUAGE,
      translations: {},
    });

    let savedLanguage = DEFAULT_LANGUAGE;

    try {
      savedLanguage =
        (await AsyncStorage.getItem(Config.STORAGE_KEYS.LANGUAGE_PREF)) ||
        DEFAULT_LANGUAGE;
    } catch {
      savedLanguage = DEFAULT_LANGUAGE;
    }

    // Prefer cached saved-language translations, but never let them prevent
    // the app from starting.
    try {
      const cached = await AsyncStorage.getItem(cacheKey(savedLanguage));
      if (cached) {
        const translations = JSON.parse(cached);
        set({
          currentLanguage: savedLanguage,
          translations:
            translations && typeof translations === 'object'
              ? translations
              : {},
        });
      }
    } catch {
      // English remains available as the safe fallback.
    }

    // Network refresh runs after startup and cannot crash the app.
    void (async () => {
      try {
        const response = await apiClient.get('/languages');
        const languages = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        set({ languages });

        const savedIsActive = languages.some(
          (item: AdminLanguage) =>
            item.code === savedLanguage && item.isActive !== false,
        );

        const defaultLanguage =
          languages.find(
            (item: AdminLanguage) =>
              item.isDefault && item.isActive !== false,
          )?.code || DEFAULT_LANGUAGE;

        const activeLanguage = savedIsActive
          ? savedLanguage
          : defaultLanguage || DEFAULT_LANGUAGE;

        await get().setLanguage(activeLanguage);
      } catch {
        // Keep the current cached language; when there is no cache it remains
        // English. Socket/API failures must never break the admin UI.
        if (!get().currentLanguage) {
          set({ currentLanguage: DEFAULT_LANGUAGE, translations: {} });
        }
      }
    })();
  },

  refresh: async () => {
    try {
      const response = await apiClient.get('/languages');
      set({
        languages: Array.isArray(response.data?.data)
          ? response.data.data
          : [],
      });
    } catch {
      // Language manager refresh is non-critical.
    }
  },
}));
