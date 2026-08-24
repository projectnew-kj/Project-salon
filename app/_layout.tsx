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
  const insets = useSafeAreaInsets();
  
  // Top inset equals the status bar height
  const statusBarHeight = insets.top;

  useEffect(() => {
    (async () => {
      await Promise.all([restoreSession(), initializeTheme(), loadSavedLanguage()]);
      setReady(true);
    })();
  }, []);

  if (isLoading || !ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primaryAccent} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, paddingTop: statusBarHeight }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
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
