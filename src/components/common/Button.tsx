import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { useLanguageStore } from '../../store/useLanguageStore';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  loading?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
}) => {
  const { colors } = useThemeStore();
  const translate = useLanguageStore((state) => state.t);

  const getVariantStyles = () => {
    if (variant === 'danger') return { bg: colors.danger, text: '#FFFFFF', border: 'transparent' };
    if (variant === 'secondary') return { bg: colors.surfaceSecondary, text: colors.text, border: 'transparent' };
    if (variant === 'outline') return { bg: 'transparent', text: colors.primaryAccent, border: colors.primaryAccent };
    return { bg: colors.primaryAccent, text: '#FFFFFF', border: 'transparent' };
  };

  const vStyle = getVariantStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: vStyle.bg, borderColor: vStyle.border, opacity: disabled ? 0.5 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={vStyle.text} />
      ) : (
        <Text style={[styles.text, { color: vStyle.text }]}>{translate(title)}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Button;
