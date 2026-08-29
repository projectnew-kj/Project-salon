import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Plus, Scissors, Gift, Edit2, Trash2, Clock } from 'lucide-react-native';
import { useThemeStore } from '../../../src/store/useThemeStore';
import apiClient from '../../../src/api/apiClient';
import { EmptyState } from '@/components/common/EmptyState';

export default function AdminServicesScreen() {
  const { colors } = useThemeStore();
  const [activeTab, setActiveTab] = useState<'haircuts' | 'offers'>('haircuts');
  const [haircuts, setHaircuts] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'haircuts') {
        const res = await apiClient.get('/admin/haircuts');
        setHaircuts(res.data.data);
      } else {
        const res = await apiClient.get('/admin/offers');
        setOffers(res.data.data);
      }
    } catch (err: any) {
      Alert.alert('Error', 'Failed to fetch catalog data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleDeleteHaircut = (id: string) => {
    Alert.alert('Deactivate Service', 'Are you sure you want to deactivate this haircut?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Deactivate',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/admin/haircuts/${id}`);
            fetchData();
          } catch (err: any) {
            Alert.alert('Error', 'Failed to deactivate service');
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tab Switcher */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'haircuts' && { backgroundColor: colors.primaryAccent }]}
          onPress={() => setActiveTab('haircuts')}
        >
          <Scissors size={16} color={activeTab === 'haircuts' ? '#FFFFFF' : colors.textSecondary} />
          <Text style={[styles.tabText, { color: activeTab === 'haircuts' ? '#FFFFFF' : colors.textSecondary }]}>
            Haircuts ({haircuts.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'offers' && { backgroundColor: colors.primaryAccent }]}
          onPress={() => setActiveTab('offers')}
        >
          <Gift size={16} color={activeTab === 'offers' ? '#FFFFFF' : colors.textSecondary} />
          <Text style={[styles.tabText, { color: activeTab === 'offers' ? '#FFFFFF' : colors.textSecondary }]}>
            Offers & Bundles ({offers.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Floating Add Action Button */}
      <View style={styles.actionHeader}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.addButton, { backgroundColor: colors.primaryAccent }]}
          onPress={() => router.push(activeTab === 'haircuts' ? '/(tabs)/services/haircut-modal' : '/(tabs)/services/offer-modal' as any)}
        >
          <Plus size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add {activeTab === 'haircuts' ? 'Haircut' : 'Offer'}</Text>
        </TouchableOpacity>
      </View>

      {/* List Rendering */}
      {activeTab === 'haircuts' ? (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={haircuts}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} tintColor={colors.primaryAccent} />}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.serviceName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.servicePrice, { color: colors.primaryAccent }]}>₹{item.price}</Text>
              </View>
              <Text style={[styles.serviceDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.description || 'No description provided'}
              </Text>
              <View style={styles.cardFooter}>
                <View style={styles.metaRow}>
                  <Clock size={14} color={colors.textMuted} />
                  <Text style={[styles.metaText, { color: colors.textMuted }]}>{item.durationMinutes} mins</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: '/(tabs)/services/haircut-modal', params: { id: item._id } } as any)}
                    style={styles.iconBtn}
                  >
                    <Edit2 size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteHaircut(item._id)} style={styles.iconBtn}>
                    <Trash2 size={16} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              title="No Haircuts yet"
              subtitle="Create your first haircut to attract more customers!"
            />
          }
        />
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={offers}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} tintColor={colors.primaryAccent} />}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.serviceName, { color: colors.text }]}>{item.title}</Text>
                <View style={styles.priceContainer}>
                  <Text style={[styles.originalPrice, { color: colors.textMuted }]}>₹{item.originalPrice}</Text>
                  <Text style={[styles.servicePrice, { color: colors.success }]}>₹{item.offerPrice}</Text>
                </View>
              </View>
              <Text style={[styles.serviceDesc, { color: colors.textSecondary }]}>{item.description}</Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{item.discountPercentage}% OFF</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              title="No offers yet"
              subtitle="Create your first offer to attract more customers!"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  tabBar: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, padding: 4, marginBottom: 12 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8 },
  tabText: { fontSize: 13, fontWeight: '700' },
  actionHeader: { alignItems: 'flex-end', marginBottom: 12 },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  addButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  listContainer: { gap: 12, paddingBottom: 24 },
  card: { padding: 16, borderRadius: 14, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceName: { fontSize: 16, fontWeight: '700' },
  servicePrice: { fontSize: 16, fontWeight: '800' },
  serviceDesc: { fontSize: 13, marginTop: 6, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 12 },
  iconBtn: { padding: 4 },
  priceContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  originalPrice: { fontSize: 13, textDecorationLine: 'line-through' },
  discountBadge: { alignSelf: 'flex-start', backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 8 },
  discountText: { color: '#D97706', fontSize: 11, fontWeight: '700' }
});