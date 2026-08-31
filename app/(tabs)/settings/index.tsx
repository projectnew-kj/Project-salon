import { useTranslation } from '../../../src/hooks/useTranslation';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import {
  User,
  Users,
  Globe,
  Moon,
  Sun,
  Smartphone,
  Lock,
  LogOut,
  ChevronRight,
  Star,
} from 'lucide-react-native';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { useAdminAuthStore } from '../../../src/store/useAdminAuthStore';
import apiClient from '../../../src/api/apiClient';


export default function AdminSettingsScreen() {
  const { t } = useTranslation();
  const { colors, mode, setThemeMode } = useThemeStore();
  const { admin, logout } = useAdminAuthStore();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert(t('Log Out'), t('admin.logout_confirm'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Log Out'),
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await apiClient.post('/admin/logout');
          } catch {
            // Ignore network errors on logout - clear local session regardless
          } finally {
            await logout();
            router.replace('/(auth)/login');
          }
        },
      },
    ]);
  };

  const themeOptions: { key: 'light' | 'dark' | 'system'; label: string; icon: React.ReactNode }[] = [
    { key: 'light', label: 'Light', icon: <Sun size={16} color={mode === 'light' ? '#FFFFFF' : colors.textSecondary} /> },
    { key: 'dark', label: 'Dark', icon: <Moon size={16} color={mode === 'dark' ? '#FFFFFF' : colors.textSecondary} /> },
    { key: 'system', label: 'System', icon: <Smartphone size={16} color={mode === 'system' ? '#FFFFFF' : colors.textSecondary} /> },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Profile Summary */}
      <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.surfaceSecondary }]}>
          <User size={28} color={colors.primaryAccent} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.text }]}>{admin?.name || 'Administrator'}</Text>
          <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{admin?.email}</Text>
        </View>
      </View>

      {/* Appearance */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t("Appearance")}</Text>
      <View style={[styles.themeRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {themeOptions.map((option) => {
          const isSelected = mode === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.themeOption,
                isSelected && { backgroundColor: colors.primaryAccent },
              ]}
              onPress={() => setThemeMode(option.key)}
            >
              {option.icon}
              <Text style={[styles.themeOptionText, { color: isSelected ? '#FFFFFF' : colors.textSecondary }]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Management */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('Management')}</Text>
      <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/(tabs)/settings/users')}>
          <View style={styles.menuLeft}>
            <Users size={18} color={colors.primaryAccent} />
            <Text style={[styles.menuText, { color: colors.text }]}>{t('Customer Accounts')}</Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TouchableOpacity>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/(tabs)/settings/languages')}>
          <View style={styles.menuLeft}>
            <Globe size={18} color={colors.primaryAccent} />
            <Text style={[styles.menuText, { color: colors.text }]}>{t('language.title')}</Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TouchableOpacity>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/(tabs)/banners')}>
          <View style={styles.menuLeft}>
            <Star size={18} color={colors.primaryAccent} />
            <Text style={[styles.menuText, { color: colors.text }]}>{t('Promotional Banners')}</Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Account */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('Account')}</Text>
      <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity style={styles.menuRow} onPress={() => Alert.alert(t('Coming Soon'), t('Password change is coming soon.'))}>
          <View style={styles.menuLeft}>
            <Lock size={18} color={colors.primaryAccent} />
            <Text style={[styles.menuText, { color: colors.text }]}>{t("Change Password")}</Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <TouchableOpacity style={styles.menuRow} onPress={handleLogout} disabled={loggingOut}>
          <View style={styles.menuLeft}>
            <LogOut size={18} color={colors.danger} />
            <Text style={[styles.menuText, { color: colors.danger }]}>{loggingOut ? 'Logging out...' : 'Log Out'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={[styles.versionText, { color: colors.textMuted }]}>{t("Salon Admin • v1.0.0")}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: '700' },
  profileEmail: { fontSize: 13, marginTop: 2 },
  sectionLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  themeRow: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, padding: 4, marginBottom: 24, gap: 4 },
  themeOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8 },
  themeOptionText: { fontSize: 12, fontWeight: '600' },
  menuCard: { borderRadius: 14, borderWidth: 1, marginBottom: 24, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuText: { fontSize: 15, fontWeight: '600' },
  divider: { height: 1, marginHorizontal: 16 },
  versionText: { textAlign: 'center', fontSize: 12, marginTop: 8 },
});
