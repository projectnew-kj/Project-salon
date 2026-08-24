import { useLanguageStore } from '../store/useLanguageStore';

/**
 * Convenience hook exposing just the translate function and current language,
 * for screens that don't need the setter/loader actions from the full store.
 */
export function useTranslation() {
  const t = useLanguageStore((state) => state.t);
  const currentLanguage = useLanguageStore((state) => state.currentLanguage);

  return { t, currentLanguage };
}

export default useTranslation;
