import React from 'react';
import { Stack } from 'expo-router';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { useTranslation } from '../../../src/hooks/useTranslation';

export default function BannersStackLayout() {
  const { colors } = useThemeStore();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.text,
        headerStyle: { backgroundColor: colors.surface },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: t('admin.banners') }} />
    </Stack>
  );
}
