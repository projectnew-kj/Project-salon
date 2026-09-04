import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAdminAuthStore } from '../src/store/useAdminAuthStore';
import { useThemeStore } from '../src/store/useThemeStore';
import { useLanguageStore } from '../src/store/useLanguageStore';
import { Loader } from '../src/components/common/Loader';

export default function RootLayout() {
  const { restoreSession, isLoading } = useAdminAuthStore();
  const { isDark, initializeTheme, colors } = useThemeStore();
  const { initialize: initializeLanguage } = useLanguageStore();
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    (async () => {
      await Promise.all([restoreSession(), initializeTheme(), initializeLanguage()]);
      setThemeReady(true);
    })();
  }, []);

  if (isLoading || !themeReady) {
    return <Loader fullScreen message="Loading Admin Portal..." />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </GestureHandlerRootView>
  );
}
