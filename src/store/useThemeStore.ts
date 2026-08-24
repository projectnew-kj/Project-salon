import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { Colors, ThemeColors } from '../constants/Colors';
import { Config } from '../constants/Config';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  initializeTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'system',
  colors: Colors.light,
  isDark: false,

  setThemeMode: async (mode: ThemeMode) => {
    await AsyncStorage.setItem(Config.STORAGE_KEYS.THEME_PREF, mode);
    const systemScheme = Appearance.getColorScheme();
    const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
    set({
      mode,
      isDark,
      colors: isDark ? Colors.dark : Colors.light,
    });
  },

  initializeTheme: async () => {
    const savedMode = (await AsyncStorage.getItem(Config.STORAGE_KEYS.THEME_PREF)) as ThemeMode | null;
    const mode = savedMode || 'system';
    const systemScheme = Appearance.getColorScheme();
    const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
    set({
      mode,
      isDark,
      colors: isDark ? Colors.dark : Colors.light,
    });
  }
}));
