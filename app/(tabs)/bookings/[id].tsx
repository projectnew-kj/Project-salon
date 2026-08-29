import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { User, Phone, Calendar, Clock, DollarSign } from 'lucide-react-native';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { useAdminBookingStore } from '../../../src/store/useAdminBookingStore';
import { StatusBadge } from '../../../src/components/common/StatusBadge';
import { Button } from '../../../src/components/common/Button';
import apiClient from '../../../src/api/apiClient';

export default function AdminBookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useThemeStore();
  const { updateStatus } = useAdminBookingStore();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetails = async () => {
    try {
      const res = await apiClient.get(`/admin/bookings/${id}`);
      setBooking(res.data.data);
    } catch (err) {
      Alert.alert('Error', 'Unable to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const handleTransition = async (nextStatus: string) => {
    setActionLoading(true);
    try {
      await updateStatus(id, nextStatus);
      await fetchDetails();
      Alert.alert('Success', `Status updated to ${nextStatus}`);
    } catch (err: any) {
      Alert.alert('Transition Error', err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !booking) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primaryAccent} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} keyboardShouldPersistTaps="always">
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.bookingCode, { color: colors.text }]}>{booking.bookingCode}</Text>
          <StatusBadge status={booking.status} />
        </View>

        <View style={styles.divider} />

        {/* Customer Information */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Customer Information</Text>
        <View style={styles.infoRow}>
          <User size={18} color={colors.primaryAccent} />
          <Text style={[styles.infoText, { color: colors.text }]}>{booking.user?.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Phone size={18} color={colors.primaryAccent} />
          <Text style={[styles.infoText, { color: colors.text }]}>{booking.user?.phone || 'N/A'}</Text>
        </View>

        <View style={styles.divider} />

        {/* Scheduled Slot */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Scheduled Slot</Text>
        <View style={styles.infoRow}>
          <Calendar size={18} color={colors.primaryAccent} />
          <Text style={[styles.infoText, { color: colors.text }]}>{booking.bookingDate}</Text>
        </View>
        <View style={styles.infoRow}>
          <Clock size={18} color={colors.primaryAccent} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            {booking.bookingTime || 'Flexible Slot'} ({booking.durationMinutes} mins)
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Pricing */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Billing</Text>
        <View style={styles.infoRow}>
          <DollarSign size={18} color={colors.success} />
          <Text style={[styles.totalAmount, { color: colors.text }]}>₹{booking.totalAmount}</Text>
        </View>
      </View>

      {/* State Machine Transition Action Controls */}
      <View style={styles.actionsContainer}>
        {booking.status === 'Pending' && (
          <View style={styles.btnGroup}>
            <Button
              title="Confirm Booking"
              onPress={() => handleTransition('Confirmed')}
              loading={actionLoading}
            />
            <Button
              title="Reject Booking"
              variant="danger"
              onPress={() => handleTransition('Rejected')}
              loading={actionLoading}
            />
          </View>
        )}

        {booking.status === 'Confirmed' && (
          <Button
            title="Start Service (In Progress)"
            onPress={() => handleTransition('In Progress')}
            loading={actionLoading}
          />
        )}

        {booking.status === 'In Progress' && (
          <Button
            title="Mark as Completed"
            onPress={() => handleTransition('Completed')}
            loading={actionLoading}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { padding: 20, borderRadius: 16, borderWidth: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingCode: { fontSize: 20, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  infoText: { fontSize: 15, fontWeight: '500' },
  totalAmount: { fontSize: 22, fontWeight: '800' },
  actionsContainer: { marginTop: 24 },
  btnGroup: { gap: 12 },
});