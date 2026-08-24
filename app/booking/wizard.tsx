import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Calendar as CalendarIcon, Clock, Scissors, CheckCircle, ChevronLeft } from 'lucide-react-native';
import { useThemeStore } from '../../src/store/useThemeStore';
import { useUserAuthStore } from '../../src/store/useUserAuthStore';
import { SlotPicker, Slot } from '../../src/components/booking/SlotPicker';
import { Button } from '../../src/components/common/Button';
import { Input } from '../../src/components/common/Input';
import userApiClient from '../../src/api/userApiClient';

export default function BookingWizardScreen() {
  const { itemId, itemType, title, price, duration } = useLocalSearchParams<{
    itemId: string;
    itemType: 'HAIRCUT' | 'OFFER_PACKAGE';
    title: string;
    price: string;
    duration: string;
  }>();

  const { colors } = useThemeStore();
  const { isAuthenticated, isGuest } = useUserAuthStore();

  // Generate next 7 selectable days
  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      dates.push({ iso, dayName, dayNum });
    }
    return dates;
  };

  const availableDates = generateDates();
  const [selectedDate, setSelectedDate] = useState(availableDates[0].iso);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [closureReason, setClosureReason] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch slots whenever selected date updates
  useEffect(() => {
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSelectedSlot('');
      try {
        const res = await userApiClient.get(`/bookings/available-slots?date=${selectedDate}`);
        const data = res.data.data;
        setIsOpen(data.isOpen);
        setClosureReason(data.reason || '');
        setSlots(data.slots || []);
      } catch {
        setIsOpen(false);
        setClosureReason('Failed to calculate time slots');
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate]);

  const handleConfirmBooking = async () => {
    if (isGuest || !isAuthenticated) {
      Alert.alert(
        'Authentication Required',
        'Please sign in to place and track your reservation.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }

    if (!selectedSlot) {
      Alert.alert('Selection Missing', 'Please select an appointment time slot.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        itemType,
        itemId,
        bookingDate: selectedDate,
        bookingTime: selectedSlot,
        notes: notes.trim(),
      };

      const res = await userApiClient.post('/bookings', payload);
      const createdBooking = res.data.data;

      Alert.alert(
        'Booking Confirmed!',
        `Your reservation code is ${createdBooking.bookingCode}. We will notify you once confirmed.`,
        [
          {
            text: 'View Booking',
            onPress: () => router.replace(`/(tabs)/bookings/${createdBooking._id}` as any),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Booking Error', err.response?.data?.message || 'Failed to place booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Top Bar Navigation */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ChevronLeft size={24} color={colors.text} />
        <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
      </TouchableOpacity>

      {/* Service Summary Overview */}
      <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.iconBox, { backgroundColor: colors.surfaceSecondary }]}>
          <Scissors size={24} color={colors.primaryAccent} />
        </View>
        <View style={styles.summaryInfo}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.summarySub, { color: colors.textSecondary }]}>
            {duration || 30} mins • Professional Service
          </Text>
        </View>
        <Text style={[styles.priceTag, { color: colors.primaryAccent }]}>₹{price}</Text>
      </View>

      {/* 1. Date Selector */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>1. Select Date</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateList}>
        {availableDates.map((d) => {
          const isSelected = selectedDate === d.iso;
          return (
            <TouchableOpacity
              key={d.iso}
              activeOpacity={0.7}
              onPress={() => setSelectedDate(d.iso)}
              style={[
                styles.dateCard,
                {
                  backgroundColor: isSelected ? colors.primaryAccent : colors.surface,
                  borderColor: isSelected ? colors.primaryAccent : colors.border,
                },
              ]}
            >
              <Text style={[styles.dayName, { color: isSelected ? '#FFFFFF' : colors.textSecondary }]}>
                {d.dayName}
              </Text>
              <Text style={[styles.dayNum, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                {d.dayNum}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 2. Slot Picker */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 20 }]}>
        2. Select Appointment Time
      </Text>
      <SlotPicker
        slots={slots}
        selectedSlot={selectedSlot}
        onSelectSlot={setSelectedSlot}
        loading={loadingSlots}
        isOpen={isOpen}
        closureReason={closureReason}
      />

      {/* 3. Special Instructions */}
      <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 20 }]}>
        3. Special Requests / Notes (Optional)
      </Text>
      <Input
        placeholder="e.g., Low skin taper, keep top length"
        value={notes}
        onChangeText={setNotes}
      />

      {/* Submit Button */}
      <View style={styles.btnWrapper}>
        <Button
          title={isGuest ? 'Sign in to Reserve' : 'Confirm Appointment'}
          onPress={handleConfirmBooking}
          loading={submitting}
          disabled={!isOpen || (!selectedSlot && isOpen)}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backText: { fontSize: 16, fontWeight: '600', marginLeft: 4 },
  summaryCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  summaryInfo: { flex: 1, marginLeft: 12 },
  summaryTitle: { fontSize: 16, fontWeight: '700' },
  summarySub: { fontSize: 13, marginTop: 2 },
  priceTag: { fontSize: 18, fontWeight: '800' },
  sectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5 },
  dateList: { gap: 10, paddingBottom: 4 },
  dateCard: { width: 64, height: 74, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  dayName: { fontSize: 12, fontWeight: '600' },
  dayNum: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  btnWrapper: { marginTop: 24 },
});