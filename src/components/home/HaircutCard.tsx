import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Scissors, Clock } from 'lucide-react-native';
import { useThemeStore } from '../../store/useThemeStore';

interface HaircutCardProps {
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  onPress: () => void;
}

export const HaircutCard: React.FC<HaircutCardProps> = ({
  name,
  description,
  price,
  durationMinutes,
  onPress,
}) => {
  const { colors } = useThemeStore();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={[styles.iconBadge, { backgroundColor: colors.surfaceSecondary }]}>
        <Scissors size={24} color={colors.primaryAccent} />
      </View>
      <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
        {name}
      </Text>
      <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={2}>
        {description || 'Professional styling'}
      </Text>
      <View style={styles.footer}>
        <View style={styles.metaRow}>
          <Clock size={12} color={colors.textMuted} />
          <Text style={[styles.metaText, { color: colors.textMuted }]}>{durationMinutes}m</Text>
        </View>
        <Text style={[styles.price, { color: colors.primaryAccent }]}>₹{price}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { width: "100%", padding: 14, borderRadius: 16, borderWidth: 1 },
  iconBadge: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  name: { fontSize: 15, fontWeight: '700' },
  desc: { fontSize: 12, marginTop: 4, lineHeight: 16 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11 },
  price: { fontSize: 15, fontWeight: '800' },
});

export default HaircutCard;
