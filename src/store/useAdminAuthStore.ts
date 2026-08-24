import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Config } from '../constants/Config';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  role: string;
}

interface AdminAuthState {
  admin: AdminUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (admin: AdminUser, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  admin: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (admin, accessToken, refreshToken) => {
    await SecureStore.setItemAsync(Config.STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    await SecureStore.setItemAsync(Config.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    await SecureStore.setItemAsync(Config.STORAGE_KEYS.ADMIN_USER, JSON.stringify(admin));
    set({ admin, accessToken, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(Config.STORAGE_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(Config.STORAGE_KEYS.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(Config.STORAGE_KEYS.ADMIN_USER);
    set({ admin: null, accessToken: null, isAuthenticated: false, isLoading: false });
  },

  restoreSession: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync(Config.STORAGE_KEYS.ACCESS_TOKEN);
      const adminData = await SecureStore.getItemAsync(Config.STORAGE_KEYS.ADMIN_USER);

      if (accessToken && adminData) {
        set({
          accessToken,
          admin: JSON.parse(adminData),
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        set({ admin: null, accessToken: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ admin: null, accessToken: null, isAuthenticated: false, isLoading: false });
    }
  }
}));