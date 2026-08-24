import React from 'react';
import { Stack } from 'expo-router';
import { useThemeStore } from '../../src/store/useThemeStore';

export default function BookingStackLayout() {
  const { colors } = useThemeStore();

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.text,
        headerStyle: { backgroundColor: colors.surface },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="wizard" options={{ title: 'Book Appointment', presentation: 'modal' }} />
    </Stack>
  );
}
