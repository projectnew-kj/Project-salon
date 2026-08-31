import { useLanguageStore } from '../store/useLanguageStore';
export function useTranslation() {
  const t = useLanguageStore((state) => state.t);
  const currentLanguage = useLanguageStore((state) => state.currentLanguage);
  return { t, currentLanguage };
}
export default useTranslation;
