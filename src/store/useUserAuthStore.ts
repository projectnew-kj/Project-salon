import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  preferredLanguage?: string;
  themePreference?: string;
}

interface UserAuthState {
  user: UserData | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  setAuth: (user: UserData, accessToken: string, refreshToken: string) => Promise<void>;
  setGuest: () => void;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useUserAuthStore = create<UserAuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isGuest: true,
  isLoading: true,

  setAuth: async (user, accessToken, refreshToken) => {
    await SecureStore.setItemAsync('user_access_token', accessToken);
    await SecureStore.setItemAsync('user_refresh_token', refreshToken);
    await SecureStore.setItemAsync('user_profile_data', JSON.stringify(user));
    set({ user, accessToken, isAuthenticated: true, isGuest: false, isLoading: false });
  },

  setGuest: () => {
    set({ user: null, accessToken: null, isAuthenticated: false, isGuest: true, isLoading: false });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('user_access_token');
    await SecureStore.deleteItemAsync('user_refresh_token');
    await SecureStore.deleteItemAsync('user_profile_data');
    set({ user: null, accessToken: null, isAuthenticated: false, isGuest: true, isLoading: false });
  },

  restoreSession: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('user_access_token');
      const profile = await SecureStore.getItemAsync('user_profile_data');
      if (accessToken && profile) {
        set({
          accessToken,
          user: JSON.parse(profile),
          isAuthenticated: true,
          isGuest: false,
          isLoading: false
        });
      } else {
        set({ isGuest: true, isLoading: false });
      }
    } catch {
      set({ isGuest: true, isLoading: false });
    }
  }
}));