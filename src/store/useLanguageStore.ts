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
  translations: Record<string,string>;
  languages: AdminLanguage[];
  t: (key: string, fallback?: string) => string;
  setLanguage: (code: string) => Promise<void>;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
}
const cacheKey = (code:string) => `admin_translations_${code}`;
export const useLanguageStore = create<State>((set,get)=>({
  currentLanguage:'en', translations:{}, languages:[], t:(key,fallback)=>get().translations[key] || fallback || key,
  setLanguage: async(code)=>{
    await AsyncStorage.setItem(Config.STORAGE_KEYS.LANGUAGE_PREF, code);
    const cached=await AsyncStorage.getItem(cacheKey(code));
    if(cached) set({currentLanguage:code,translations:JSON.parse(cached)});
    try{const r=await apiClient.get(`/languages/${code}/translations`); const tr=r.data?.data?.translations||{}; await AsyncStorage.setItem(cacheKey(code),JSON.stringify(tr)); set({currentLanguage:code,translations:tr});}catch{}
  },
  initialize: async()=>{try{const saved=await AsyncStorage.getItem(Config.STORAGE_KEYS.LANGUAGE_PREF)||'en'; const r=await apiClient.get('/languages'); const ls=r.data?.data||[]; set({languages:ls}); await get().setLanguage(saved);}catch{set({currentLanguage:'en'});}},
  refresh: async()=>{const r=await apiClient.get('/languages'); set({languages:r.data?.data||[]});}
}));
