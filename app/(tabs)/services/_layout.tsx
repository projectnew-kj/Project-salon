import React from 'react';
import { Stack } from 'expo-router';
import { useThemeStore } from '../../../src/store/useThemeStore';

export default function ServicesStackLayout() {
  const { colors } = useThemeStore();

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.text,
        headerStyle: { backgroundColor: colors.surface },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Services' }} />
      <Stack.Screen
        name="haircut-modal"
        options={{ title: 'Haircut Service', presentation: 'modal' }}
      />
      <Stack.Screen
        name="offer-modal"
        options={{ title: 'Offer Bundle', presentation: 'modal' }}
      />
    </Stack>
  );
}
