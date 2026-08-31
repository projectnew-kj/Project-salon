import { useTranslation } from '../../src/hooks/useTranslation';
import React from 'react';
import { Alert } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, Compass, CalendarCheck, User, Languages } from 'lucide-react-native';
import { useThemeStore } from '../../src/store/useThemeStore';
import { useUserSocket } from '../../src/hooks/useUserSocket';

export default function TabsLayout() {
  const { t } = useTranslation();
  const { colors } = useThemeStore();

  // Keep a live connection for booking status pushes and notifications while signed in
  useUserSocket({
    onNewNotification: (notification) => {
      Alert.alert(notification.title || t('notification.new'), notification.body || t('notification.update'));
    },
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
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
          title: t('home.home'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
  
  {/* If explore is in explore/index.tsx */}
      <Tabs.Screen
    name="explore/index"
        options={{
          title: t('home.explore'),
          tabBarIcon: ({ color, size }) => <Compass size={size} color={color} />,
        }}
      />

  {/* If bookings is in bookings/index.tsx */}
      <Tabs.Screen
    name="bookings"
        options={{
          title: t('home.bookings'),
          tabBarIcon: ({ color, size }) => <CalendarCheck size={size} color={color} />,
        }}
      />

  {/* If profile is in profile/index.tsx */}
      <Tabs.Screen
    name="profile"
        options={{
          title: t('home.profile'),
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      {/* <Tabs.Screen
    name="profile/language"
        options={{
          title: t('home.language'),
          tabBarIcon: ({ color, size }) => <Languages size={size} color={color} />,
        }}
      /> */}
    </Tabs>
  );
}
