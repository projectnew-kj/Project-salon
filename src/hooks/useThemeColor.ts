import { useThemeStore } from '../store/useThemeStore';
import { ThemeColors } from '../constants/Colors';

/**
 * Resolves a single theme color by key, always reflecting the currently active
 * (light/dark/system-resolved) palette from the theme store.
 */
export function useThemeColor(colorName: keyof ThemeColors): string {
  const { colors } = useThemeStore();
  return colors[colorName];
}

export default useThemeColor;
