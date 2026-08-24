import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Config } from '../constants/Config';
import { useAdminAuthStore } from '../store/useAdminAuthStore';

const apiClient = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync(Config.STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync(Config.STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) {
          useAdminAuthStore.getState().logout();
          return Promise.reject(error);
        }

        const res = await axios.post(`${Config.API_BASE_URL}/auth/refresh-token`, { refreshToken });
        const { accessToken } = res.data.data.tokens;

        await SecureStore.setItemAsync(Config.STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return apiClient(originalRequest);
      } catch (refreshErr) {
        useAdminAuthStore.getState().logout();
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;