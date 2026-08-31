import { useLanguageStore } from '../store/useLanguageStore';
export function useTranslation(){const t=useLanguageStore(s=>s.t);const currentLanguage=useLanguageStore(s=>s.currentLanguage);return {t,currentLanguage};}
export default useTranslation;
