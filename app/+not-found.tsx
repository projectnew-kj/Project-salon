import { useTranslation } from '../src/hooks/useTranslation';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import { AlertTriangle } from 'lucide-react-native';
import { useThemeStore } from '../src/store/useThemeStore';

export default function NotFoundScreen() {
  const { t } = useTranslation();
  const { colors } = useThemeStore();

  return (
    <>
      <Stack.Screen options={{ title: t('not_found.title') }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AlertTriangle size={48} color={colors.textMuted} />
        <Text style={[styles.title, { color: colors.text }]}>{t('not_found.message')}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t('not_found.page_missing', "The page you're looking for couldn't be found.")}
        </Text>
        <Link href="/(tabs)" style={styles.link}>
          <Text style={[styles.linkText, { color: colors.primaryAccent }]}>{t('not_found.home')}</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  link: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
