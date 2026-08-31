import { useTranslation } from '../../../src/hooks/useTranslation';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Modal as RNModal,
  Platform,
} from 'react-native';
import { Clock, Plus, Trash2, Coffee, ChevronDown } from 'lucide-react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { Button } from '../../../src/components/common/Button';
import apiClient from '../../../src/api/apiClient';

type BreakItem = { startTime: string; endTime: string; label: string };
type DaySchedule = {
  day: string;
  isOpen: boolean;
  scheduleType: string;
  slots: Array<{ startTime: string; endTime: string; slotDurationMinutes?: number; maxConcurrentBookings?: number }>;
  breaks?: BreakItem[];
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

const timeToDate = (value: string) => {
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(Number.isFinite(hours) ? hours : 9, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  return date;
};

const formatTime = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export default function AdminScheduleScreen() {
  const { t } = useTranslation();
  const { colors } = useThemeStore();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timePicker, setTimePicker] = useState<{
    visible: boolean;
    dayIndex: number;
    field: 'open' | 'close' | 'breakStart' | 'breakEnd';
    breakIndex?: number;
    value: Date;
  } | null>(null);

  const fetchSchedule = async () => {
    try {
      const res = await apiClient.get('/admin/availability');
      const data = res.data.data;
      data.weeklySchedule = DAYS.map((day) => {
        const existing = (data.weeklySchedule || []).find((item: DaySchedule) => item.day === day);
        return {
          day,
          isOpen: existing?.isOpen ?? true,
          scheduleType: existing?.scheduleType || 'FULL_DAY',
          slots: existing?.slots?.length ? existing.slots : [{ startTime: '09:00', endTime: '21:00', slotDurationMinutes: 30, maxConcurrentBookings: 2 }],
          breaks: existing?.breaks || [],
        };
      });
      setConfig(data);
    } catch {
      Alert.alert(t('Error'), t('Failed to load schedule config'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const updateDay = (index: number, updater: (day: DaySchedule) => DaySchedule) => {
    setConfig((current: any) => {
      const weeklySchedule = current.weeklySchedule.map((day: DaySchedule, i: number) =>
        i === index ? updater({ ...day, slots: day.slots.map((slot) => ({ ...slot })), breaks: [...(day.breaks || [])] }) : day
      );
      return { ...current, weeklySchedule };
    });
  };

  const toggleDay = (index: number) => {
    updateDay(index, (day) => ({ ...day, isOpen: !day.isOpen }));
  };

  const updateTime = (index: number, field: 'startTime' | 'endTime', value: string) => {
    updateDay(index, (day) => ({
      ...day,
      slots: [{ ...day.slots[0], [field]: value }],
    }));
  };

  const updateBreakTime = (dayIndex: number, breakIndex: number, field: 'startTime' | 'endTime', value: string) => {
    updateBreak(dayIndex, breakIndex, field, value);
  };

  const openTimePicker = (
    dayIndex: number,
    field: 'open' | 'close' | 'breakStart' | 'breakEnd',
    value: string,
    breakIndex?: number
  ) => {
    setTimePicker({
      visible: true,
      dayIndex,
      field,
      breakIndex,
      value: timeToDate(value),
    });
  };

  const applyPickedTime = (date: Date) => {
    if (!timePicker) return;
    const value = formatTime(date);
    if (timePicker.field === 'open') updateTime(timePicker.dayIndex, 'startTime', value);
    if (timePicker.field === 'close') updateTime(timePicker.dayIndex, 'endTime', value);
    if (timePicker.field === 'breakStart' && typeof timePicker.breakIndex === 'number') {
      updateBreakTime(timePicker.dayIndex, timePicker.breakIndex, 'startTime', value);
    }
    if (timePicker.field === 'breakEnd' && typeof timePicker.breakIndex === 'number') {
      updateBreakTime(timePicker.dayIndex, timePicker.breakIndex, 'endTime', value);
    }
  };

  const handleTimePickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setTimePicker(null);
      if (event.type === 'set' && selectedDate) applyPickedTime(selectedDate);
      return;
    }
    if (selectedDate) {
      setTimePicker((current) => current ? { ...current, value: selectedDate } : null);
    }
  };

  const addBreak = (index: number) => {
    updateDay(index, (day) => ({
      ...day,
      breaks: [...(day.breaks || []), { startTime: '13:00', endTime: '14:00', label: 'Lunch Break' }],
    }));
  };

  const updateBreak = (dayIndex: number, breakIndex: number, field: keyof BreakItem, value: string) => {
    updateDay(dayIndex, (day) => ({
      ...day,
      breaks: (day.breaks || []).map((breakItem, i) => i === breakIndex ? { ...breakItem, [field]: value } : breakItem),
    }));
  };

  const removeBreak = (dayIndex: number, breakIndex: number) => {
    updateDay(dayIndex, (day) => ({
      ...day,
      breaks: (day.breaks || []).filter((_, i) => i !== breakIndex),
    }));
  };

  const handleSave = async () => {
    for (const day of config.weeklySchedule as DaySchedule[]) {
      if (!day.isOpen) continue;
      const slot = day.slots[0];
      if (!TIME_RE.test(slot.startTime) || !TIME_RE.test(slot.endTime)) {
        Alert.alert(t('Invalid time'), `${day.day}: ${t('use HH:mm format, for example 09:00.')}`);
        return;
      }
      const [openH, openM] = slot.startTime.split(':').map(Number);
      const [closeH, closeM] = slot.endTime.split(':').map(Number);
      const open = openH * 60 + openM;
      const close = closeH * 60 + closeM;
      if (open >= close) {
        Alert.alert(t('Invalid operating hours'), `${day.day}: ${t('closing time must be later than opening time.')}`);
        return;
      }
      for (let i = 0; i < (day.breaks || []).length; i += 1) {
        const item = day.breaks![i];
        if (!TIME_RE.test(item.startTime) || !TIME_RE.test(item.endTime)) {
          Alert.alert(t('Invalid break'), `${day.day}: ${t('break must use HH:mm format.')}`);
          return;
        }
        const [bsh, bsm] = item.startTime.split(':').map(Number);
        const [beh, bem] = item.endTime.split(':').map(Number);
        const bs = bsh * 60 + bsm;
        const be = beh * 60 + bem;
        if (bs >= be || bs < open || be > close) {
          Alert.alert(t('Invalid break'), `${day.day}: ${t('breaks must be inside operating hours and end after they start.')}`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      await apiClient.put('/admin/availability', config);
      Alert.alert(t('Success'), t('Operating hours and breaks updated. Users have been notified.'));
      await fetchSchedule();
    } catch (err: any) {
      Alert.alert(t('Error'), err.response?.data?.message || t('Failed to save changes'));
    } finally {
      setSaving(false);
    }
  };

  const pickerTitle = timePicker
    ? timePicker.field === 'open'
      ? 'Opening Time'
      : timePicker.field === 'close'
        ? 'Closing Time'
        : timePicker.field === 'breakStart'
          ? 'Break Start'
          : 'Break End'
    : 'Select Time';

  if (loading || !config) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primaryAccent} />
      </View>
    );
  }

  return (
    <>
      <RNModal
        visible={Boolean(timePicker?.visible)}
        transparent
        animationType="fade"
        onRequestClose={() => setTimePicker(null)}
      >
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerCard, { backgroundColor: colors.surface }]}>
            <View style={styles.pickerHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.pickerEyebrow, { color: colors.textMuted }]}>{t("SCHEDULE")}</Text>
                <Text style={[styles.pickerTitle, { color: colors.text }]}>{pickerTitle}</Text>
              </View>
              <TouchableOpacity onPress={() => setTimePicker(null)} style={[styles.pickerClose, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.pickerCloseText, { color: colors.textSecondary }]}>×</Text>
              </TouchableOpacity>
            </View>
            {timePicker && (
              <DateTimePicker
                value={timePicker.value}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                is24Hour
                onChange={handleTimePickerChange}
                themeVariant={colors.background === '#FFFFFF' ? 'light' : 'dark'}
              />
            )}
            {Platform.OS === 'ios' && timePicker && (
              <View style={styles.pickerActions}>
                <TouchableOpacity
                  style={[styles.pickerCancelButton, { borderColor: colors.border }]}
                  onPress={() => setTimePicker(null)}
                >
                  <Text style={[styles.pickerCancelText, { color: colors.textSecondary }]}>{t("Cancel")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pickerDoneButton, { backgroundColor: colors.primaryAccent }]}
                  onPress={() => {
                    applyPickedTime(timePicker.value);
                    setTimePicker(null);
                  }}
                >
                  <Text style={styles.pickerDoneText}>{t("Done")}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </RNModal>

      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={[styles.masterCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.switchRow}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={[styles.masterTitle, { color: colors.text }]}>{t("Accept Online Bookings")}</Text>
            <Text style={[styles.masterSub, { color: colors.textSecondary }]}>{t("Global business availability switch")}</Text>
          </View>
          <Switch
            value={config.isBusinessOpen}
            onValueChange={(val) => setConfig({ ...config, isBusinessOpen: val })}
            trackColor={{ true: colors.primaryAccent, false: colors.border }}
          />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t("Weekly Operating Hours")}</Text>
      <Text style={[styles.helperText, { color: colors.textMuted }]}>{t("Edit opening and closing times, then add one or more breaks such as lunch breaks.")}</Text>

      {config.weeklySchedule.map((dayItem: DaySchedule, index: number) => {
        const slot = dayItem.slots[0];
        return (
          <View key={dayItem.day} style={[styles.dayCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.dayHeader}>
              <Text style={[styles.dayName, { color: colors.text }]}>{dayItem.day}</Text>
              <Switch
                value={dayItem.isOpen}
                onValueChange={() => toggleDay(index)}
                trackColor={{ true: colors.primaryAccent, false: colors.border }}
              />
            </View>

            {dayItem.isOpen ? (
              <>
                <View style={styles.timeRow}>
                  <View style={styles.timeField}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t("Opens")}</Text>
                    <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.background }]}>
                      <Clock size={15} color={colors.primaryAccent} />
                      <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => openTimePicker(index, 'open', slot.startTime)}
                        activeOpacity={0.75}
                      >
                        <Text style={[styles.timeValue, { color: colors.text }]}>{slot.startTime}</Text>
                        <ChevronDown size={16} color={colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={[styles.toText, { color: colors.textMuted }]}>{t("to")}</Text>
                  <View style={styles.timeField}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t("Closes")}</Text>
                    <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.background }]}>
                      <Clock size={15} color={colors.primaryAccent} />
                      <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => openTimePicker(index, 'close', slot.endTime)}
                        activeOpacity={0.75}
                      >
                        <Text style={[styles.timeValue, { color: colors.text }]}>{slot.endTime}</Text>
                        <ChevronDown size={16} color={colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {(dayItem.breaks || []).map((breakItem, breakIndex) => (
                  <View key={`${dayItem.day}-break-${breakIndex}`} style={[styles.breakCard, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}>
                    <View style={styles.breakHeader}>
                      <View style={styles.breakTitleRow}>
                        <Coffee size={15} color={colors.primaryAccent} />
                        <Text style={[styles.breakTitle, { color: colors.text }]}>Break {breakIndex + 1}</Text>
                      </View>
                      <TouchableOpacity onPress={() => removeBreak(index, breakIndex)}>
                        <Trash2 size={17} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.labelField}>
                      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t("Label")}</Text>
                      <TextInput
                        value={breakItem.label}
                        onChangeText={(value) => updateBreak(index, breakIndex, 'label', value)}
                        placeholder="Lunch Break"
                        placeholderTextColor={colors.textMuted}
                        style={[styles.textInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                      />
                    </View>
                    <View style={styles.timeRow}>
                      <View style={styles.timeField}>
                        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t("Start")}</Text>
                        <TouchableOpacity
                          style={[styles.textInput, styles.timePickerField, { borderColor: colors.border, backgroundColor: colors.background }]}
                          onPress={() => openTimePicker(index, 'breakStart', breakItem.startTime, breakIndex)}
                          activeOpacity={0.75}
                        >
                          <Text style={[styles.timeValue, { color: colors.text }]}>{breakItem.startTime}</Text>
                          <ChevronDown size={15} color={colors.textMuted} />
                        </TouchableOpacity>
                      </View>
                      <Text style={[styles.toText, { color: colors.textMuted }]}>{t("to")}</Text>
                      <View style={styles.timeField}>
                        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t("End")}</Text>
                        <TouchableOpacity
                          style={[styles.textInput, styles.timePickerField, { borderColor: colors.border, backgroundColor: colors.background }]}
                          onPress={() => openTimePicker(index, 'breakEnd', breakItem.endTime, breakIndex)}
                          activeOpacity={0.75}
                        >
                          <Text style={[styles.timeValue, { color: colors.text }]}>{breakItem.endTime}</Text>
                          <ChevronDown size={15} color={colors.textMuted} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}

                <TouchableOpacity
                  style={[styles.addBreakButton, { borderColor: colors.primaryAccent }]}
                  onPress={() => addBreak(index)}
                  activeOpacity={0.8}
                >
                  <Plus size={16} color={colors.primaryAccent} />
                  <Text style={[styles.addBreakText, { color: colors.primaryAccent }]}>{t("Add Break")}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={[styles.closedText, { color: colors.textMuted }]}>{t("Closed")}</Text>
            )}
          </View>
        );
      })}

      <View style={styles.saveWrapper}>
        <Button title="Save Operating Schedule" onPress={handleSave} loading={saving} />
      </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  masterCard: { padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 20 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  masterTitle: { fontSize: 16, fontWeight: '700' },
  masterSub: { fontSize: 13, marginTop: 2 },
  sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 0.5 },
  helperText: { fontSize: 12, lineHeight: 17, marginBottom: 12 },
  dayCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dayName: { fontSize: 15, fontWeight: '700' },
  timeRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  timeField: { flex: 1 },
  fieldLabel: { fontSize: 11, fontWeight: '600', marginBottom: 5 },
  inputWrap: { minHeight: 44, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  input: { flex: 1, paddingVertical: 9, fontSize: 14, fontWeight: '600' },
  timeButton: { flex: 1, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeValue: { fontSize: 14, fontWeight: '700' },
  timePickerField: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toText: { fontSize: 12, marginBottom: 14 },
  breakCard: { marginTop: 12, borderWidth: 1, borderRadius: 10, padding: 10 },
  breakHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  breakTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  breakTitle: { fontSize: 13, fontWeight: '700' },
  labelField: { marginBottom: 10 },
  textInput: { borderWidth: 1, borderRadius: 9, minHeight: 42, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13 },
  addBreakButton: { marginTop: 12, borderWidth: 1, borderStyle: 'dashed', borderRadius: 9, minHeight: 40, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  addBreakText: { fontSize: 13, fontWeight: '700' },
  closedText: { fontSize: 13, fontStyle: 'italic' },
  saveWrapper: { marginTop: 10 },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 },
  pickerCard: { borderRadius: 20, padding: 18, shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  pickerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  pickerEyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 3 },
  pickerTitle: { fontSize: 19, fontWeight: '800' },
  pickerClose: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  pickerCloseText: { fontSize: 23, lineHeight: 23, fontWeight: '500' },
  pickerActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  pickerCancelButton: { flex: 1, minHeight: 44, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pickerDoneButton: { flex: 1, minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pickerCancelText: { fontSize: 14, fontWeight: '700' },
  pickerDoneText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
