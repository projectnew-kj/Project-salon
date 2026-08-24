import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';

interface MetricCardProps {
  icon: React.ReactNode;
  iconBg: string;
  value: string | number;
  label: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ icon, iconBg, value, label }) => {
  const { colors } = useThemeStore();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
  },
  label: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default MetricCard;
