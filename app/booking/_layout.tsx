import React from 'react';
import { useTranslation } from '../../src/hooks/useTranslation';
import { Stack } from 'expo-router';
import { useThemeStore } from '../../src/store/useThemeStore';

export default function BookingStackLayout() {
  const { t } = useTranslation();
  const { colors } = useThemeStore();

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.text,
        headerStyle: { backgroundColor: colors.surface },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="wizard" options={{ title: t('home.book_now'), presentation: 'modal' }} />
    </Stack>
  );
}
