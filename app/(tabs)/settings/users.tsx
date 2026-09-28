import { useTranslation } from '../../../src/hooks/useTranslation';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, RefreshControl, Modal, Image } from 'react-native';
import { Search, Ban, CheckCircle, Lock, X, Save } from 'lucide-react-native';
import { useThemeStore } from '../../../src/store/useThemeStore';
import apiClient from '../../../src/api/apiClient';
import { AppUser } from '../../../src/types/admin';

export default function AdminCustomersScreen() {
  const { t } = useTranslation();
  const { colors } = useThemeStore();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordUser, setPasswordUser] = useState<AppUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const res = await apiClient.get('/admin/users', { params });
      const payload = res.data?.data;
      setUsers(Array.isArray(payload) ? payload : (payload?.items || []));
    } catch {
      Alert.alert(t('Error'), t('Failed to fetch customers'));
    } finally { setLoading(false); }
  }, [searchQuery, t]);

  useEffect(() => { const timeout = setTimeout(fetchUsers, 300); return () => clearTimeout(timeout); }, [fetchUsers]);

  const handleToggleBlock = (user: AppUser) => {
    const action = user.isBlocked ? 'unblock' : 'block';
    Alert.alert(
      action === 'block' ? 'Block Customer' : 'Unblock Customer',
      `Are you sure you want to ${action} ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: action === 'block' ? 'Block' : 'Unblock', style: action === 'block' ? 'destructive' : 'default', onPress: async () => {
          try { await apiClient.patch(`/admin/users/${user._id}/toggle-block`); fetchUsers(); }
          catch { Alert.alert(t('Error'), t('Failed to update customer status')); }
        }}
      ]
    );
  };

  const savePassword = async () => {
    if (!passwordUser || newPassword.length < 8) {
      Alert.alert(t('Error'), 'Password must be at least 8 characters.');
      return;
    }
    setSavingPassword(true);
    try {
      await apiClient.post(`/admin/users/${passwordUser._id}/change-password`, { newPassword });
      Alert.alert(t('Success'), `Password changed for ${passwordUser.name}.`);
      setPasswordUser(null); setNewPassword('');
    } catch (e: any) {
      Alert.alert(t('Error'), e.response?.data?.message || 'Unable to change password.');
    } finally { setSavingPassword(false); }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search size={18} color={colors.textMuted} />
        <TextInput placeholder="Search by name, email, or phone..." placeholderTextColor={colors.textMuted} style={[styles.searchInput, { color: colors.text }]} value={searchQuery} onChangeText={setSearchQuery} />
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchUsers} tintColor={colors.primaryAccent} />}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {item.profileImage ? <Image source={{ uri: item.profileImage }} style={styles.avatar} /> : <View style={[styles.avatar, { backgroundColor: colors.surfaceSecondary }]} />}
            <View style={styles.cardInfo}>
              <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.email, { color: colors.textSecondary }]}>{item.email}</Text>
              <Text style={[styles.phone, { color: colors.textMuted }]}>{item.phone || 'No phone on file'}</Text>
              {item.isBlocked && <View style={styles.blockedBadge}><Text style={styles.blockedText}>BLOCKED</Text></View>}
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => { setPasswordUser(item); setNewPassword(''); }} style={[styles.iconBtn, { backgroundColor: colors.primaryAccent + '18' }]}><Lock size={18} color={colors.primaryAccent} /></TouchableOpacity>
              <TouchableOpacity onPress={() => handleToggleBlock(item)} style={[styles.iconBtn, { backgroundColor: item.isBlocked ? colors.success + '20' : colors.danger + '20' }]}>
                {item.isBlocked ? <CheckCircle size={20} color={colors.success} /> : <Ban size={20} color={colors.danger} />}
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={!loading ? <Text style={[styles.emptyText, { color: colors.textMuted }]}>No customers found</Text> : null}
      />

      <Modal transparent visible={Boolean(passwordUser)} animationType="slide" onRequestClose={() => setPasswordUser(null)}>
        <View style={styles.overlay}><View style={[styles.modal, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}><View><Text style={[styles.modalTitle, { color: colors.text }]}>Change User Password</Text><Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>{passwordUser?.name}</Text></View><TouchableOpacity onPress={() => setPasswordUser(null)}><X size={22} color={colors.textMuted} /></TouchableOpacity></View>
          <Text style={[styles.label, { color: colors.textSecondary }]}>New Password</Text>
          <TextInput secureTextEntry value={newPassword} onChangeText={setNewPassword} placeholder="Minimum 8 characters" placeholderTextColor={colors.textMuted} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} />
          <TouchableOpacity disabled={savingPassword} onPress={savePassword} style={[styles.saveBtn, { backgroundColor: colors.primaryAccent }]}><Save size={18} color="#fff" /><Text style={styles.saveText}>{savingPassword ? 'Saving...' : 'Save Password'}</Text></TouchableOpacity>
        </View></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, searchBox: { flexDirection: 'row', alignItems: 'center', margin: 16, paddingHorizontal: 12, height: 46, borderRadius: 12, borderWidth: 1, gap: 8 }, searchInput: { flex: 1, fontSize: 15 }, listContainer: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 }, card: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, gap: 12 }, avatar: { width: 48, height: 48, borderRadius: 24 }, cardInfo: { flex: 1 }, name: { fontSize: 15, fontWeight: '700' }, email: { fontSize: 13, marginTop: 2 }, phone: { fontSize: 12, marginTop: 2 }, actions: { flexDirection: 'row', gap: 8 }, iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' }, blockedBadge: { alignSelf: 'flex-start', backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 6 }, blockedText: { color: '#DC2626', fontSize: 10, fontWeight: '700' }, emptyText: { textAlign: 'center', marginTop: 40, fontSize: 14 }, overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }, modal: { borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 32 }, modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }, modalTitle: { fontSize: 19, fontWeight: '800' }, modalSubtitle: { fontSize: 13, marginTop: 3 }, label: { fontSize: 12, fontWeight: '700', marginBottom: 7 }, input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 16 }, saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12 }, saveText: { color: '#fff', fontWeight: '800' }
});
