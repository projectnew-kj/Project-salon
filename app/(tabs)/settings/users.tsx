import { useTranslation } from '../../../src/hooks/useTranslation';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, RefreshControl } from 'react-native';
import { Search, Ban, CheckCircle } from 'lucide-react-native';
import { useThemeStore } from '../../../src/store/useThemeStore';
import apiClient from '../../../src/api/apiClient';
import { AppUser } from '../../../src/types/admin';

export default function AdminCustomersScreen() {
  const { t } = useTranslation();
  const { colors } = useThemeStore();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const res = await apiClient.get('/admin/users', { params });
      setUsers(res.data.data);
    } catch {
      Alert.alert(t('Error'), t('Failed to fetch customers'));
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timeout = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeout);
  }, [fetchUsers]);

  const handleToggleBlock = (user: AppUser) => {
    const action = user.isBlocked ? 'unblock' : 'block';
    Alert.alert(
      `${action === 'block' ? 'Block' : 'Unblock'} Customer`,
      `Are you sure you want to ${action} ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'block' ? 'Block' : 'Unblock',
          style: action === 'block' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await apiClient.patch(`/admin/users/${user._id}/toggle-block`);
              fetchUsers();
            } catch {
              Alert.alert(t('Error'), t('Failed to update customer status'));
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search size={18} color={colors.textMuted} />
        <TextInput
          placeholder="Search by name, email, or phone..."
          placeholderTextColor={colors.textMuted}
          style={[styles.searchInput, { color: colors.text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={users}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchUsers} tintColor={colors.primaryAccent} />}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardInfo}>
              <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.email, { color: colors.textSecondary }]}>{item.email}</Text>
              <Text style={[styles.phone, { color: colors.textMuted }]}>{item.phone || 'No phone on file'}</Text>
              {item.isBlocked && (
                <View style={styles.blockedBadge}>
                  <Text style={styles.blockedText}>{t("BLOCKED")}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={() => handleToggleBlock(item)}
              style={[
                styles.actionBtn,
                { backgroundColor: item.isBlocked ? colors.success + '20' : colors.danger + '20' },
              ]}
            >
              {item.isBlocked ? (
                <CheckCircle size={20} color={colors.success} />
              ) : (
                <Ban size={20} color={colors.danger} />
              )}
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t("No customers found")}</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  listContainer: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, borderWidth: 1 },
  cardInfo: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700' },
  email: { fontSize: 13, marginTop: 2 },
  phone: { fontSize: 12, marginTop: 2 },
  blockedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  blockedText: { color: '#DC2626', fontSize: 10, fontWeight: '700' },
  actionBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 14 },
});
