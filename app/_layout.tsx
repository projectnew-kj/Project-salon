import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAdminAuthStore } from '../src/store/useAdminAuthStore';
import { useThemeStore } from '../src/store/useThemeStore';
import { Loader } from '../src/components/common/Loader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RootLayout() {
  const { restoreSession, isLoading } = useAdminAuthStore();
  const { isDark, initializeTheme, colors } = useThemeStore();
  const [themeReady, setThemeReady] = useState(false);

    const insets = useSafeAreaInsets();
    
    // Top inset equals the status bar height
    const statusBarHeight = insets.top;

  useEffect(() => {
    (async () => {
      await Promise.all([restoreSession(), initializeTheme()]);
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
