import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Scissors, Gift, Clock, Star, ArrowRight } from 'lucide-react-native';
import { useThemeStore } from '../../src/store/useThemeStore';
import { useUserAuthStore } from '../../src/store/useUserAuthStore';
import { useLanguageStore } from '../../src/store/useLanguageStore';
import { AnimatedBannerCarousel } from '../../src/components/home/AnimatedBannerCarousel';
import userApiClient from '../../src/api/userApiClient';

export default function UserHomeScreen() {
  const { colors } = useThemeStore();
  const { user, isGuest } = useUserAuthStore();
  const { t } = useLanguageStore();

  const [banners, setBanners] = useState<any[]>([]);
  const [haircuts, setHaircuts] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadHomeData = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        userApiClient.get('/haircuts'),
        userApiClient.get('/offers'),
        userApiClient.get('/carousels'),
      ]);

      const [haircutsResult, offersResult, carouselsResult] = results;

      if (haircutsResult.status === 'fulfilled') {
        setHaircuts(haircutsResult.value.data.data || []);
      }

      if (offersResult.status === 'fulfilled') {
        setOffers(offersResult.value.data.data || []);
      }

      if (carouselsResult.status === 'fulfilled') {
        setBanners((carouselsResult.value.data.data || []).map((banner: any) => ({
          ...banner,
          images: Array.isArray(banner.images)
            ? banner.images
            : banner.image
              ? [banner.image]
              : [],
        })));
      } else {
        setBanners([]);
      }
    } catch (err) {
      console.error('Failed to load homepage data', err);
      setBanners([]);
    }
  }, []);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const handleServiceSelect = (item: any, itemType: 'HAIRCUT' | 'OFFER_PACKAGE') => {
    router.push({
      pathname: '/booking/wizard',
      params: {
        itemId: item._id,
        itemType,
        title: item.name || item.title,
        price: item.price || item.offerPrice,
        duration: item.durationMinutes || 30,
      },
    } as any);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryAccent} />}
    >
      {/* User Greeting Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
            {isGuest ? 'Guest Explorer' : `Hello, ${user?.name}`}
          </Text>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>{t('welcome')}</Text>
        </View>

        {isGuest && (
          <TouchableOpacity
            style={[styles.signInPill, { backgroundColor: colors.primaryAccent }]}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.signInPillText}>Sign In</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Promotional Carousel */}
      <AnimatedBannerCarousel banners={banners} />

      {/* Trending Haircuts Catalog Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('popularServices')}</Text>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={haircuts}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.horizontalList}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.haircutCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => handleServiceSelect(item, 'HAIRCUT')}
          >
            <View style={[styles.iconBadge, { backgroundColor: colors.surfaceSecondary }]}>
              <Scissors size={24} color={colors.primaryAccent} />
            </View>
            <Text style={[styles.serviceName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
            <Text style={[styles.serviceDesc, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description || 'Professional styling'}
            </Text>
            <View style={styles.cardFooter}>
              <View style={styles.metaRow}>
                <Clock size={12} color={colors.textMuted} />
                <Text style={[styles.metaText, { color: colors.textMuted }]}>{item.durationMinutes}m</Text>
              </View>
              <Text style={[styles.priceText, { color: colors.primaryAccent }]}>₹{item.price}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Special Offers & Bundles */}
      {offers && offers?.length > 0 && (
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('specialOffers')}</Text>
      </View>
      )}

      <View style={styles.offersContainer}>
        {offers.map((offer) => (
          <TouchableOpacity
            key={offer._id}
            activeOpacity={0.8}
            style={[styles.offerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => handleServiceSelect(offer, 'OFFER_PACKAGE')}
          >
            <View style={styles.offerLeft}>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{offer.discountPercentage}% OFF</Text>
              </View>
              <Text style={[styles.offerTitle, { color: colors.text }]}>{offer.title}</Text>
              <Text style={[styles.offerDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                {offer.description}
              </Text>
              <View style={styles.priceRow}>
                <Text style={[styles.originalPrice, { color: colors.textMuted }]}>₹{offer.originalPrice}</Text>
                <Text style={[styles.offerPrice, { color: colors.success }]}>₹{offer.offerPrice}</Text>
              </View>
            </View>
            <ArrowRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 4,
  },
  welcomeSubtitle: { fontSize: 13, fontWeight: '500' },
  welcomeTitle: { fontSize: 22, fontWeight: '800', marginTop: 2 },
  signInPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
  signInPillText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  sectionHeader: { paddingHorizontal: 16, marginTop: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  horizontalList: { paddingHorizontal: 16, gap: 12 },
  haircutCard: { width: 170, padding: 14, borderRadius: 16, borderWidth: 1 },
  iconBadge: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  serviceName: { fontSize: 15, fontWeight: '700' },
  serviceDesc: { fontSize: 12, marginTop: 4, lineHeight: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11 },
  priceText: { fontSize: 15, fontWeight: '800' },
  offersContainer: { paddingHorizontal: 16, gap: 12, paddingBottom: 32 },
  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  offerLeft: { flex: 1, paddingRight: 12 },
  tagBadge: { alignSelf: 'flex-start', backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginBottom: 6 },
  tagText: { color: '#D97706', fontSize: 11, fontWeight: '700' },
  offerTitle: { fontSize: 16, fontWeight: '700' },
  offerDesc: { fontSize: 12, marginTop: 4, lineHeight: 16 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  originalPrice: { fontSize: 13, textDecorationLine: 'line-through' },
  offerPrice: { fontSize: 16, fontWeight: '800' },
});