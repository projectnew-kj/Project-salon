import { useTranslation } from '../../../src/hooks/useTranslation';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Calendar, Clock, Scissors, ShieldAlert, Star, ChevronLeft } from 'lucide-react-native';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { useUserSocket } from '../../../src/hooks/useUserSocket';
import { StatusBadge } from '../../../src/components/common/StatusBadge';
import { Button } from '../../../src/components/common/Button';
import { Input } from '../../../src/components/common/Input';
import userApiClient from '../../../src/api/userApiClient';

export default function BookingTrackerDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useThemeStore();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  // Review Modal State
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchDetails = async () => {
    try {
      const res = await userApiClient.get(`/users/bookings/${id}`);
      setBooking(res.data.data);
    } catch {
      Alert.alert(t('common.error'), t('booking.appointment_fetch_error', 'Unable to fetch appointment details'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  // Connect to isolated booking room for real-time tracking
  useUserSocket({
    activeBookingId: id,
    onBookingStatusUpdated: (data) => {
      if (data.bookingId === id) {
        setBooking((prev: any) => (prev ? { ...prev, status: data.status, statusHistory: data.statusHistory } : prev));
      }
    },
  });

  const handleCancelBooking = () => {
    Alert.alert(t('booking.cancel_appointment'), t('booking.cancel_confirm'), [
      { text: 'Keep Booking', style: 'cancel' },
      {
        text: 'Cancel Appointment',
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          try {
            await userApiClient.post(`/users/bookings/${id}/cancel`, {
              reason: 'Customer initiated cancellation',
            });
            await fetchDetails();
            Alert.alert(t('booking.cancelled'), t('booking.cancelled_message'));
          } catch (err: any) {
            Alert.alert(t('common.error'), err.response?.data?.message || t('booking.cancel_error', 'Unable to cancel'));
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  const handleSubmitReview = async () => {
    setSubmittingReview(true);
    try {
      await userApiClient.post('/users/reviews', {
        bookingId: id,
        rating,
        comment: reviewComment.trim(),
      });
      setReviewModalVisible(false);
      setBooking((prev: any) => ({ ...prev, isReviewed: true }));
      Alert.alert(t('booking.review_thanks'), t('booking.review_success'));
    } catch (err: any) {
      Alert.alert(t('booking.review_error'), err.response?.data?.message || t('booking.failed_review'));
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading || !booking) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primaryAccent} />
      </View>
    );
  }

  const isCompleted = booking.status === 'Completed';
  const isCancellable = booking.status === 'Pending' || booking.status === 'Confirmed';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ChevronLeft size={24} color={colors.text} />
        <Text style={[styles.backText, { color: colors.text }]}>{t('booking.back_to_bookings', 'Back to Bookings')}</Text>
      </TouchableOpacity>

      {/* Main Status Header Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.codeText, { color: colors.text }]}>{booking.bookingCode}</Text>
          <StatusBadge status={booking.status} />
        </View>

        <View style={styles.divider} />

        {/* Live Step Progress Indicator */}
        <View style={styles.progressContainer}>
          {['Pending', 'Confirmed', 'In Progress', 'Completed'].map((step, idx) => {
            const stepsOrder = ['Pending', 'Confirmed', 'In Progress', 'Completed'];
            const currentIndex = stepsOrder.indexOf(booking.status);
            const isPassed = currentIndex >= idx && booking.status !== 'Cancelled' && booking.status !== 'Rejected';

            return (
              <View key={step} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    {
                      backgroundColor: isPassed ? colors.primaryAccent : colors.surfaceSecondary,
                      borderColor: isPassed ? colors.primaryAccent : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.stepNum, { color: isPassed ? '#FFFFFF' : colors.textMuted }]}>
                    {idx + 1}
                  </Text>
                </View>
                <Text style={[styles.stepLabel, { color: isPassed ? colors.text : colors.textMuted }]}>
                  {step}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Service Details Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 16 }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('booking.service_details')}</Text>
        <View style={styles.infoRow}>
          <Scissors size={18} color={colors.primaryAccent} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            {booking.haircut?.name || booking.offer?.title}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Calendar size={18} color={colors.primaryAccent} />
          <Text style={[styles.infoText, { color: colors.text }]}>{booking.bookingDate}</Text>
        </View>
        <View style={styles.infoRow}>
          <Clock size={18} color={colors.primaryAccent} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            {booking.bookingTime || 'Flexible'} ({booking.durationMinutes} mins)
          </Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>{t('booking.total_amount')}</Text>
          <Text style={[styles.totalAmount, { color: colors.primaryAccent }]}>₹{booking.totalAmount}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsWrapper}>
        {isCompleted && !booking.isReviewed && (
          <Button
            title="Leave a Review & Rating"
            onPress={() => setReviewModalVisible(true)}
          />
        )}

        {isCancellable && (
          <Button
            title="Cancel Appointment"
            variant="danger"
            onPress={handleCancelBooking}
            loading={cancelling}
          />
        )}
      </View>

      {/* Post-Booking Rating Modal */}
      <Modal visible={reviewModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('booking.rate_experience')}</Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              How was your service with {booking.haircut?.name || 'us'}?
            </Text>

            {/* 1-5 Star Selector */}
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                  <Star
                    size={32}
                    color={star <= rating ? '#F59E0B' : colors.border}
                    fill={star <= rating ? '#F59E0B' : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Input
              placeholder="Write an optional feedback comment..."
              multiline
              numberOfLines={3}
              value={reviewComment}
              onChangeText={setReviewComment}
            />

            <View style={styles.modalBtnGroup}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setReviewModalVisible(false)}
              />
              <Button
                title="Submit Review"
                onPress={handleSubmitReview}
                loading={submittingReview}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backText: { fontSize: 16, fontWeight: '600', marginLeft: 4 },
  card: { padding: 18, borderRadius: 16, borderWidth: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  codeText: { fontSize: 18, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 14 },
  progressContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  stepItem: { alignItems: 'center', flex: 1 },
  stepCircle: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  stepNum: { fontSize: 12, fontWeight: '700' },
  stepLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 0.5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  infoText: { fontSize: 14, fontWeight: '500' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  priceLabel: { fontSize: 14, fontWeight: '600' },
  totalAmount: { fontSize: 20, fontWeight: '800' },
  actionsWrapper: { marginTop: 24, gap: 12 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { padding: 24, borderRadius: 20, borderWidth: 1 },
  modalTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  modalSub: { fontSize: 13, textAlign: 'center', marginTop: 4, marginBottom: 16 },
  starRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  modalBtnGroup: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 12 },
});