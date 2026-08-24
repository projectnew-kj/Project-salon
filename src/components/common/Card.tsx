import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';

interface CardProps extends ViewProps {
  style?: ViewStyle | ViewStyle[];
  padded?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, padded = true, ...props }) => {
  const { colors } = useThemeStore();

  return (
    <View
      style={[
        styles.card,
        padded && styles.padded,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  padded: {
    padding: 16,
  },
});

export default Card;
