import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Search, Scissors, Gift } from 'lucide-react-native';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { HaircutCard } from '../../../src/components/home/HaircutCard';
import { OfferCard } from '../../../src/components/home/OfferCard';
import userApiClient from '../../../src/api/userApiClient';
import { Haircut, Offer } from '../../../src/types';

type CatalogTab = 'haircuts' | 'offers';

export default function ExploreScreen() {
  const { colors } = useThemeStore();
  const [activeTab, setActiveTab] = useState<CatalogTab>('haircuts');
  const [searchQuery, setSearchQuery] = useState('');
  const [haircuts, setHaircuts] = useState<Haircut[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const [haircutsRes, offersRes] = await Promise.all([
        userApiClient.get('/haircuts'),
        userApiClient.get('/offers'),
      ]);
      setHaircuts(haircutsRes.data.data);
      setOffers(offersRes.data.data);
    } catch (err) {
      console.error('Failed to load catalog', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const handleServiceSelect = (item: Haircut | Offer, itemType: 'HAIRCUT' | 'OFFER_PACKAGE') => {
    router.push({
      pathname: '/booking/wizard',
      params: {
        itemId: item._id,
        itemType,
        title: 'name' in item ? item.name : item.title,
        price: 'price' in item ? item.price : item.offerPrice,
        duration: 'durationMinutes' in item ? item.durationMinutes : 30,
      },
    } as any);
  };

  const filteredHaircuts = haircuts.filter((h) =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredOffers = offers.filter((o) =>
    o.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Explore</Text>
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={18} color={colors.textMuted} />
          <TextInput
            placeholder="Search haircuts & offers..."
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={[styles.tabRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'haircuts' && { backgroundColor: colors.primaryAccent }]}
            onPress={() => setActiveTab('haircuts')}
          >
            <Scissors size={16} color={activeTab === 'haircuts' ? '#FFFFFF' : colors.textSecondary} />
            <Text style={[styles.tabText, { color: activeTab === 'haircuts' ? '#FFFFFF' : colors.textSecondary }]}>
              Haircuts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'offers' && { backgroundColor: colors.primaryAccent }]}
            onPress={() => setActiveTab('offers')}
          >
            <Gift size={16} color={activeTab === 'offers' ? '#FFFFFF' : colors.textSecondary} />
            <Text style={[styles.tabText, { color: activeTab === 'offers' ? '#FFFFFF' : colors.textSecondary }]}>
              Offers
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'haircuts' ? (
        <FlatList
          data={filteredHaircuts}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadCatalog} tintColor={colors.primaryAccent} />}
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <HaircutCard
                name={item.name}
                description={item.description}
                price={item.price}
                durationMinutes={item.durationMinutes}
                onPress={() => handleServiceSelect(item, 'HAIRCUT')}
              />
            </View>
          )}
          ListEmptyComponent={
            !loading ? <Text style={[styles.emptyText, { color: colors.textMuted }]}>No haircuts found</Text> : null
          }
        />
      ) : (
        <FlatList
        key="offers-list" // Add unique key here
        data={filteredOffers}
        keyExtractor={(item) => item._id}
        numColumns={1}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadCatalog} tintColor={colors.primaryAccent} />}
          renderItem={({ item }) => (
            <View style={styles.offerWrapper}>
              <OfferCard
                title={item.title}
                description={item.description}
                originalPrice={item.originalPrice}
                offerPrice={item.offerPrice}
                discountPercentage={item.discountPercentage}
                onPress={() => handleServiceSelect(item, 'OFFER_PACKAGE')}
              />
            </View>
          )}
          ListEmptyComponent={
            !loading ? <Text style={[styles.emptyText, { color: colors.textMuted }]}>No offers found</Text> : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 16 },
  headerTitle: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 15 },
  tabRow: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, padding: 4, gap: 4, marginBottom: 8 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8 },
  tabText: { fontSize: 13, fontWeight: '600' },
  listContent: { padding: 16, paddingTop: 8, gap: 12 },
  gridRow: { justifyContent: 'space-between', gap: 12 },
  gridItem: { flex: 1 },
  offerWrapper: { marginBottom: 4 },
  emptyText: { textAlign: 'center', marginTop: 60, fontSize: 14 },
});
