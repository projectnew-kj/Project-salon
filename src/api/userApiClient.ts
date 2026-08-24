import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Config } from '../constants/Config';
import { useUserAuthStore } from '../store/useUserAuthStore';

const userApiClient = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

userApiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('user_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

userApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync('user_refresh_token');
        if (!refreshToken) {
          useUserAuthStore.getState().logout();
          return Promise.reject(error);
        }

        const res = await axios.post(`${Config.API_BASE_URL}/auth/refresh-token`, { refreshToken });
        const { accessToken } = res.data.data.tokens;

        await SecureStore.setItemAsync('user_access_token', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return userApiClient(originalRequest);
      } catch (err) {
        useUserAuthStore.getState().logout();
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default userApiClient;