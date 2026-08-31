import { useTranslation } from '../../../src/hooks/useTranslation';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { User, Globe, Moon, Sun, Monitor, LogOut, LogIn } from 'lucide-react-native';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { useUserAuthStore } from '../../../src/store/useUserAuthStore';
import { useLanguageStore } from '../../../src/store/useLanguageStore';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'ml', name: 'Malayalam (മലയാളം)' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
];

export default function UserProfileScreen() {
  const { t } = useTranslation();
  const { colors, mode, setThemeMode } = useThemeStore();
  const { user, isGuest, logout } = useUserAuthStore();
  const { currentLanguage, setLanguage } = useLanguageStore();

  const handleLogout = () => {
    Alert.alert(t('profile.sign_out'), t('profile.sign_out_confirm'), [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(tabs)');
        },
      },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.surfaceSecondary }]}>
          <User size={36} color={colors.primaryAccent} />
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>
          {isGuest ? 'Guest User' : user?.name}
        </Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
          {isGuest ? 'Sign in to sync your bookings across devices' : user?.email}
        </Text>
      </View>

      {/* Theme Selection Section */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('profile.appearance')}</Text>
      <View style={[styles.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {(['light', 'dark', 'system'] as const).map((tMode) => {
          const isSelected = mode === tMode;
          return (
            <TouchableOpacity
              key={tMode}
              style={styles.settingRow}
              onPress={() => setThemeMode(tMode)}
            >
              <View style={styles.rowLeft}>
                {tMode === 'light' && <Sun size={18} color={colors.text} />}
                {tMode === 'dark' && <Moon size={18} color={colors.text} />}
                {tMode === 'system' && <Monitor size={18} color={colors.text} />}
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {tMode.charAt(0).toUpperCase() + tMode.slice(1)} Mode
                </Text>
              </View>
              {isSelected && <View style={[styles.activeDot, { backgroundColor: colors.primaryAccent }]} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Multi-Language Selection Section */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 20 }]}>{t("Language / மொழி")}</Text>
      <View style={[styles.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {LANGUAGES.map((lang) => {
          const isSelected = currentLanguage === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={styles.settingRow}
              onPress={() => setLanguage(lang.code)}
            >
              <View style={styles.rowLeft}>
                <Globe size={18} color={colors.text} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>{lang.name}</Text>
              </View>
              {isSelected && <View style={[styles.activeDot, { backgroundColor: colors.primaryAccent }]} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Auth Action */}
      <View style={styles.authActionWrapper}>
        {isGuest ? (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primaryAccent }]}
            onPress={() => router.push('/(auth)/login')}
          >
            <LogIn size={18} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>{t('profile.sign_in_register')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.danger }]}
            onPress={handleLogout}
          >
            <LogOut size={18} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>{t('profile.sign_out')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  profileCard: { padding: 24, borderRadius: 20, borderWidth: 1, alignItems: 'center', marginBottom: 20 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  userName: { fontSize: 20, fontWeight: '800' },
  userEmail: { fontSize: 13, marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5 },
  settingsCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { fontSize: 15, fontWeight: '600' },
  activeDot: { width: 10, height: 10, borderRadius: 5 },
  authActionWrapper: { marginTop: 28 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14 },
  actionBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});