import { useTranslation } from '../../../src/hooks/useTranslation';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Calendar, Clock, ChevronRight, Scissors } from 'lucide-react-native';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { useUserAuthStore } from '../../../src/store/useUserAuthStore';
import { StatusBadge } from '../../../src/components/common/StatusBadge';
import { Button } from '../../../src/components/common/Button';
import userApiClient from '../../../src/api/userApiClient';

export default function UserBookingsScreen() {
  const { t } = useTranslation();
  const { colors } = useThemeStore();
  const { isGuest, isAuthenticated } = useUserAuthStore();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUserBookings = useCallback(async () => {
    if (isGuest || !isAuthenticated) return;
    setLoading(true);
    try {
      const res = await userApiClient.get('/users/bookings');
      setBookings(res.data.data);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setLoading(false);
    }
  }, [isGuest, isAuthenticated]);

  useEffect(() => {
    fetchUserBookings();
  }, [fetchUserBookings]);

  if (isGuest || !isAuthenticated) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.iconCircle, { backgroundColor: colors.surfaceSecondary }]}>
          <Scissors size={36} color={colors.primaryAccent} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('booking.sign_in_view')}</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Track your live appointment status and access your service history.
        </Text>
        <View style={styles.authBtnWrapper}>
          <Button title="Sign In" onPress={() => router.push('/(auth)/login')} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={bookings}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchUserBookings}
            tintColor={colors.primaryAccent}
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('booking.no_bookings')}</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Your scheduled haircuts and styling sessions will appear here.
              </Text>
              <View style={styles.browseBtn}>
                <Button title={t('booking.explore_services')} onPress={() => router.push('/(tabs)')} />
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.bookingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push(`/(tabs)/bookings/${item._id}` as any)}
          >
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.bookingCode, { color: colors.text }]}>{item.bookingCode}</Text>
                <Text style={[styles.serviceTitle, { color: colors.textSecondary }]}>
                  {item.haircut?.name || item.offer?.title || 'Salon Appointment'}
                </Text>
              </View>
              <StatusBadge status={item.status} />
            </View>

            <View style={styles.divider} />

            <View style={styles.cardFooter}>
              <View style={styles.timeInfo}>
                <Calendar size={14} color={colors.primaryAccent} />
                <Text style={[styles.dateText, { color: colors.text }]}>{item.bookingDate}</Text>
                <Clock size={14} color={colors.primaryAccent} style={{ marginLeft: 8 }} />
                <Text style={[styles.dateText, { color: colors.text }]}>
                  {item.bookingTime || 'Flexible'}
                </Text>
              </View>
              <View style={styles.actionRight}>
                <Text style={[styles.price, { color: colors.primaryAccent }]}>₹{item.totalAmount}</Text>
                <ChevronRight size={18} color={colors.textMuted} />
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16, gap: 12, paddingBottom: 32 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyState: { alignItems: 'center', marginTop: 80, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptySubtitle: { fontSize: 14, marginTop: 6, textAlign: 'center', lineHeight: 20 },
  authBtnWrapper: { width: '100%', marginTop: 24 },
  browseBtn: { marginTop: 20, width: 200 },
  bookingCard: { padding: 16, borderRadius: 16, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingCode: { fontSize: 15, fontWeight: '800' },
  serviceTitle: { fontSize: 13, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 13, fontWeight: '600' },
  actionRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  price: { fontSize: 16, fontWeight: '800' },
});