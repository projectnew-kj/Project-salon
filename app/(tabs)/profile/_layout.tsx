import React from 'react';
import { Stack } from 'expo-router';
import { useThemeStore } from '../../../src/store/useThemeStore';

export default function ProfileStackLayout() {
  const { colors } = useThemeStore();

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.text,
        headerStyle: { backgroundColor: colors.surface },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="language" options={{ title: 'Language' }} />
    </Stack>
  );
}
