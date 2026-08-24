import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAdminAuthStore } from '../../src/store/useAdminAuthStore';

export default function AuthLayout() {
  const { isAuthenticated } = useAdminAuthStore();

  // Already signed in - skip straight to the dashboard
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}
