import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useUserAuthStore } from '../../src/store/useUserAuthStore';

export default function AuthLayout() {
  const { isAuthenticated } = useUserAuthStore();

  // Already signed in - no need to show login/register again
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
