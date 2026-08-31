import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { LayoutDashboard, CalendarCheck, Scissors, Image as ImageIcon, Clock, Settings } from 'lucide-react-native';
import { useAdminAuthStore } from '../../src/store/useAdminAuthStore';
import { useThemeStore } from '../../src/store/useThemeStore';
import { useTranslation } from '../../src/hooks/useTranslation';
import { useAdminSocket } from '../../src/hooks/useAdminSocket';

export default function TabsLayout() {
  const { isAuthenticated } = useAdminAuthStore();
  const { colors } = useThemeStore();
  const { t } = useTranslation();
  useAdminSocket(); // Keep the real-time pipeline alive across the entire admin app

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primaryAccent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('admin.dashboard'),
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: t('admin.bookings'),
          tabBarIcon: ({ color, size }) => <CalendarCheck size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: t('admin.services'),
          tabBarIcon: ({ color, size }) => <Scissors size={size} color={color} />,
        }}
      />
      {/* Changed 'banners' to 'banners/index' */}
      <Tabs.Screen
        name="banners"
        options={{
          title: t('admin.banners'),
          tabBarIcon: ({ color, size }) => <ImageIcon size={size} color={color} />,
        }}
      />
      {/* Changed 'schedule' to 'schedule/index' */}
      <Tabs.Screen
        name="schedule"
        options={{
          title: t('admin.schedule'),
          tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('admin.settings'),
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
