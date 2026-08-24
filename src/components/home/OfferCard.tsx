import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { useThemeStore } from '../../store/useThemeStore';

interface OfferCardProps {
  title: string;
  description?: string;
  originalPrice: number;
  offerPrice: number;
  discountPercentage: number;
  onPress: () => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  title,
  description,
  originalPrice,
  offerPrice,
  discountPercentage,
  onPress,
}) => {
  const { colors } = useThemeStore();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={styles.left}>
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>{discountPercentage}% OFF</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {description ? (
          <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
        <View style={styles.priceRow}>
          <Text style={[styles.originalPrice, { color: colors.textMuted }]}>₹{originalPrice}</Text>
          <Text style={[styles.offerPrice, { color: colors.success }]}>₹{offerPrice}</Text>
        </View>
      </View>
      <ArrowRight size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  left: { flex: 1, paddingRight: 12 },
  tagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  tagText: { color: '#D97706', fontSize: 11, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '700' },
  desc: { fontSize: 12, marginTop: 4, lineHeight: 16 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  originalPrice: { fontSize: 13, textDecorationLine: 'line-through' },
  offerPrice: { fontSize: 16, fontWeight: '800' },
});

export default OfferCard;
