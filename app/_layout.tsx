import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useUserAuthStore } from '../src/store/useUserAuthStore';
import { useThemeStore } from '../src/store/useThemeStore';
import { useLanguageStore } from '../src/store/useLanguageStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RootLayout() {
  const { restoreSession, isLoading } = useUserAuthStore();
  const { isDark, initializeTheme, colors } = useThemeStore();
  const { loadSavedLanguage } = useLanguageStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      // None of the bootstrap tasks may keep the native splash/loading screen forever.
      await Promise.allSettled([restoreSession(), initializeTheme()]);

      if (mounted) {
        setReady(true);
      }

      // Language is intentionally non-blocking.
      // English is already loaded locally, and the backend/cached language
      // can update the UI after the app is visible.
      void loadSavedLanguage().catch((error) => {
        console.warn('[Language] background initialization failed:', error);
      });
    })();

    return () => {
      mounted = false;
    };
  }, [restoreSession, initializeTheme, loadSavedLanguage]);

  if (isLoading || !ready) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primaryAccent} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1}}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={isDark ? "#000000" : "#FFFFFF"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="booking" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </GestureHandlerRootView>
  );
}
