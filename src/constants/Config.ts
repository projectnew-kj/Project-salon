export const Config = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:5000',
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'admin_access_token',
    REFRESH_TOKEN: 'admin_refresh_token',
    ADMIN_USER: 'admin_user_data',
    THEME_PREF: 'admin_theme_preference',
    LANGUAGE_PREF: 'admin_language_preference',
  }
};
export default Config;