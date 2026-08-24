import React from 'react';
import { Stack } from 'expo-router';
import { useThemeStore } from '../../../src/store/useThemeStore';

export default function BannersStackLayout() {
  const { colors } = useThemeStore();

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.text,
        headerStyle: { backgroundColor: colors.surface },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Banners' }} />
    </Stack>
  );
}
