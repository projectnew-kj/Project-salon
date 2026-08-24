import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert, ActivityIndicator } from 'react-native';
import { Clock } from 'lucide-react-native';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { Button } from '../../../src/components/common/Button';
import apiClient from '../../../src/api/apiClient';

export default function AdminScheduleScreen() {
  const { colors } = useThemeStore();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSchedule = async () => {
    try {
      const res = await apiClient.get('/admin/availability');
      setConfig(res.data.data);
    } catch {
      Alert.alert('Error', 'Failed to load schedule config');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const toggleDay = (index: number) => {
    const updated = { ...config };
    updated.weeklySchedule[index].isOpen = !updated.weeklySchedule[index].isOpen;
    setConfig(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put('/admin/availability', config);
      Alert.alert('Success', 'Business schedule updated');
    } catch {
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primaryAccent} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.masterCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.switchRow}>
          <View>
            <Text style={[styles.masterTitle, { color: colors.text }]}>Accept Online Bookings</Text>
            <Text style={[styles.masterSub, { color: colors.textSecondary }]}>Global business availability switch</Text>
          </View>
          <Switch
            value={config.isBusinessOpen}
            onValueChange={(val) => setConfig({ ...config, isBusinessOpen: val })}
            trackColor={{ true: colors.primaryAccent, false: colors.border }}
          />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Weekly Operating Hours</Text>

      {config.weeklySchedule.map((dayItem: any, index: number) => (
        <View key={dayItem.day} style={[styles.dayCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.dayHeader}>
            <Text style={[styles.dayName, { color: colors.text }]}>{dayItem.day}</Text>
            <Switch
              value={dayItem.isOpen}
              onValueChange={() => toggleDay(index)}
              trackColor={{ true: colors.primaryAccent, false: colors.border }}
            />
          </View>
          {dayItem.isOpen && (
            <View style={styles.slotRow}>
              <Clock size={14} color={colors.primaryAccent} />
              <Text style={[styles.slotText, { color: colors.textSecondary }]}>
                {dayItem.slots[0]?.startTime || '09:00'} - {dayItem.slots[0]?.endTime || '21:00'} (30m slots)
              </Text>
            </View>
          )}
        </View>
      ))}

      <View style={styles.saveWrapper}>
        <Button title="Save Operating Schedule" onPress={handleSave} loading={saving} />
      </View>
    </ScrollView>
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
  sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 0.5 },
  dayCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dayName: { fontSize: 15, fontWeight: '700' },
  slotRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  slotText: { fontSize: 13 },
  saveWrapper: { marginTop: 20 },
});