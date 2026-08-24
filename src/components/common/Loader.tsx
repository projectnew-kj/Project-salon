import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';

interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ message, fullScreen = true }) => {
  const { colors } = useThemeStore();

  return (
    <View
      style={[
        fullScreen ? styles.fullScreen : styles.inline,
        { backgroundColor: fullScreen ? colors.background : 'transparent' },
      ]}
    >
      <ActivityIndicator size="large" color={colors.primaryAccent} />
      {message ? <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Loader;
