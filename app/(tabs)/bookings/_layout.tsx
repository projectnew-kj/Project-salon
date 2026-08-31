import React from 'react';
import { useTranslation } from '../../../src/hooks/useTranslation';
import { Stack } from 'expo-router';
import { useThemeStore } from '../../../src/store/useThemeStore';

export default function BookingsStackLayout() {
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
      <Stack.Screen name="index" options={{ title: t('booking.my_bookings') }} />
      <Stack.Screen name="[id]" options={{ title: t('booking.appointment_details') }} />
    </Stack>
  );
}
