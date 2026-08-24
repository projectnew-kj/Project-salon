import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { StatusBadge } from '../common/StatusBadge';
import { Booking } from '../../types/booking';

interface RecentBookingRowProps {
  booking: Booking;
}

export const RecentBookingRow: React.FC<RecentBookingRowProps> = ({ booking }) => {
  const { colors } = useThemeStore();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => router.push(`/(tabs)/bookings/${booking._id}` as any)}
    >
      <View style={styles.left}>
        <Text style={[styles.code, { color: colors.text }]}>{booking.bookingCode}</Text>
        <Text style={[styles.customer, { color: colors.textSecondary }]}>{booking.user?.name || 'Customer'}</Text>
        <Text style={[styles.service, { color: colors.textSecondary }]}>
          {booking.haircut?.name || booking.offer?.title || 'Service'} • {booking.bookingTime || 'Anytime'}
        </Text>
      </View>
      <View style={styles.right}>
        <StatusBadge status={booking.status} />
        <ChevronRight size={18} color={colors.textMuted} style={styles.chevron} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  left: { flex: 1 },
  code: { fontSize: 15, fontWeight: '700' },
  customer: { fontSize: 13, marginTop: 2 },
  service: { fontSize: 12, marginTop: 2 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chevron: { marginLeft: 4 },
});

export default RecentBookingRow;
