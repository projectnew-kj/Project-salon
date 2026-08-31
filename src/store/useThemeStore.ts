import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { Colors, ThemeColors } from '../constants/Colors';

const THEME_STORAGE_KEY = 'admin_theme_preference';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  initializeTheme: () => Promise<void>;
}

const getColors = (mode: ThemeMode): {
  isDark: boolean;
  colors: ThemeColors;
} => {
  const systemScheme = Appearance.getColorScheme();

  const isDark =
    mode === 'system'
      ? systemScheme === 'dark'
      : mode === 'dark';

  return {
    isDark,
    colors: isDark ? Colors.dark : Colors.light,
  };
};

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'system',
  colors: Colors.light,
  isDark: false,

  setThemeMode: async (mode) => {
    // Always pass a guaranteed string key.
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);

    const { isDark, colors } = getColors(mode);

    set({
      mode,
      isDark,
      colors,
    });
  },

  initializeTheme: async () => {
    let savedMode: ThemeMode = 'system';

    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);

      if (
        stored === 'light' ||
        stored === 'dark' ||
        stored === 'system'
      ) {
        savedMode = stored;
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
    }

    const { isDark, colors } = getColors(savedMode);

    set({
      mode: savedMode,
      isDark,
      colors,
    });
  },
}));