import { useTranslation } from '../../hooks/useTranslation';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';

export interface Slot {
  time: string;
  endTime: string;
  availableSeats: number;
  isAvailable: boolean;
}

interface SlotPickerProps {
  slots: Slot[];
  selectedSlot: string;
  onSelectSlot: (time: string) => void;
  loading: boolean;
  isOpen: boolean;
  closureReason?: string;
  breaks?: { startTime: string; endTime: string; label?: string }[];
}

export const SlotPicker: React.FC<SlotPickerProps> = ({
  slots,
  selectedSlot,
  onSelectSlot,
  loading,
  isOpen,
  closureReason,
  breaks = [],
}) => {
  const { colors } = useThemeStore();
  const { t } = useTranslation();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color={colors.primaryAccent} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('booking.checking_times')}</Text>
      </View>
    );
  }

  if (!isOpen) {
    return (
      <View style={[styles.closureBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
        <Text style={[styles.closureTitle, { color: colors.danger }]}>{t('booking.unavailable')}</Text>
        <Text style={[styles.closureText, { color: colors.textSecondary }]}>
          {closureReason || 'Salon is closed on this date.'}
        </Text>
      </View>
    );
  }

  if (slots.length === 0) {
    return (
      <View style={[styles.closureBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
        <Text style={[styles.closureText, { color: colors.textSecondary }]}>{t('booking.no_slots')}</Text>
      </View>
    );
  }

  return (
    <View>
      {breaks.length > 0 && (
        <View style={styles.breakInfo}>
          <Text style={[styles.breakInfoTitle, { color: colors.text }]}>{t('booking.breaks')}</Text>
          {breaks.map((item, index) => (
            <Text key={`${item.startTime}-${item.endTime}-${index}`} style={[styles.breakInfoText, { color: colors.textSecondary }]}>
              {item.label || 'Break'}: {item.startTime} - {item.endTime}
            </Text>
          ))}
        </View>
      )}
      <View style={styles.gridContainer}>
      {slots.map((slot) => {
        const isSelected = selectedSlot === slot.time;
        const isDisabled = !slot.isAvailable;

        return (
          <TouchableOpacity
            key={slot.time}
            activeOpacity={0.7}
            disabled={isDisabled}
            onPress={() => onSelectSlot(slot.time)}
            style={[
              styles.slotCard,
              {
                backgroundColor: isSelected
                  ? colors.primaryAccent
                  : isDisabled
                  ? colors.surfaceSecondary
                  : colors.surface,
                borderColor: isSelected
                  ? colors.primaryAccent
                  : isDisabled
                  ? colors.border
                  : colors.border,
                opacity: isDisabled ? 0.4 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.slotTime,
                { color: isSelected ? '#FFFFFF' : isDisabled ? colors.textMuted : colors.text },
              ]}
            >
              {slot.time}
            </Text>
            <Text
              style={[
                styles.seatsText,
                { color: isSelected ? '#FFFFFF' : isDisabled ? colors.textMuted : colors.textSecondary },
              ]}
            >
              {isDisabled ? 'Full' : `${slot.availableSeats} left`}
            </Text>
          </TouchableOpacity>
        );
      })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: { paddingVertical: 24, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 13, marginTop: 8 },
  closureBox: { padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center', marginVertical: 8 },
  closureTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  closureText: { fontSize: 13, textAlign: 'center' },
  breakInfo: { padding: 10, borderRadius: 10, marginTop: 8, marginBottom: 2 },
  breakInfoTitle: { fontSize: 12, fontWeight: '700', marginBottom: 3 },
  breakInfoText: { fontSize: 11, marginBottom: 2 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  slotCard: {
    width: '31%',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotTime: { fontSize: 14, fontWeight: '700' },
  seatsText: { fontSize: 11, marginTop: 2 },
});