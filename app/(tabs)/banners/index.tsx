import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react-native';
import { useThemeStore } from '../../../src/store/useThemeStore';
import apiClient from '../../../src/api/apiClient';

export default function AdminBannersScreen() {
  const { colors } = useThemeStore();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/carousels');
      setBanners(res.data.data);
    } catch {
      Alert.alert('Error', 'Unable to fetch carousel banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Banner', 'Delete this promotional banner?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await apiClient.delete(`/admin/carousels/${id}`);
          fetchBanners();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={banners}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchBanners} tintColor={colors.primaryAccent} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardContent}>
              <View style={[styles.imagePlaceholder, { backgroundColor: colors.surfaceSecondary }]}>
                <ImageIcon size={24} color={colors.textSecondary} />
              </View>
              <View style={styles.info}>
                <Text style={[styles.bannerTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.bannerDesc, { color: colors.textSecondary }]}>{item.description || 'No description'}</Text>
                <Text style={[styles.orderText, { color: colors.textMuted }]}>Display Order: {item.displayOrder}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteBtn}>
                <Trash2 size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  list: { gap: 12, paddingBottom: 24 },
  card: { padding: 14, borderRadius: 14, borderWidth: 1 },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  imagePlaceholder: { width: 60, height: 60, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  bannerTitle: { fontSize: 15, fontWeight: '700' },
  bannerDesc: { fontSize: 13, marginTop: 2 },
  orderText: { fontSize: 11, marginTop: 4 },
  deleteBtn: { padding: 8 },
});