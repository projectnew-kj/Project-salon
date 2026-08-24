export const Config = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:5000',
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'user_access_token',
    REFRESH_TOKEN: 'user_refresh_token',
    USER_PROFILE: 'user_profile_data',
    THEME_PREF: 'user_theme_preference',
    LANGUAGE_PREF: 'user_language',
  }
};

export default Config;
