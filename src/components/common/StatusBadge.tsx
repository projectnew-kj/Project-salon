import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
  status: 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' | 'Rejected' | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'Pending':
        return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' };
      case 'Confirmed':
        return { bg: '#DBEAFE', text: '#2563EB', border: '#BFDBFE' };
      case 'In Progress':
        return { bg: '#E0E7FF', text: '#4F46E5', border: '#C7D2FE' };
      case 'Completed':
        return { bg: '#D1FAE5', text: '#059669', border: '#A7F3D0' };
      case 'Cancelled':
      case 'Rejected':
        return { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' };
      default:
        return { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' };
    }
  };

  const current = getBadgeStyle();

  return (
    <View style={[styles.badge, { backgroundColor: current.bg, borderColor: current.border }]}>
      <Text style={[styles.text, { color: current.text }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});