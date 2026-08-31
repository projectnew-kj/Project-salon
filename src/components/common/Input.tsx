import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, Pressable } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { useLanguageStore } from '../../store/useLanguageStore';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, secureTextEntry, ...props }) => {
  const { colors } = useThemeStore();
  const translate = useLanguageStore((state) => state.t);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = Boolean(secureTextEntry);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{translate(label)}</Text>}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: error ? colors.danger : colors.border,
              color: colors.text,
              paddingRight: isPassword ? 52 : 14,
            },
            style,
          ]}
          secureTextEntry={isPassword ? !passwordVisible : secureTextEntry}
          {...props}
          placeholder={props.placeholder ? translate(props.placeholder) : props.placeholder}
        />
        {isPassword && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={translate(passwordVisible ? 'Hide password' : 'Show password')}
            accessibilityHint={translate(passwordVisible ? 'Hides the password text' : 'Shows the password text')}
            hitSlop={8}
            onPress={() => setPasswordVisible((visible) => !visible)}
            style={({ pressed }) => [styles.passwordToggle, pressed && styles.passwordTogglePressed]}
          >
            {passwordVisible ? (
              <EyeOff size={20} color={colors.textMuted} strokeWidth={2.2} />
            ) : (
              <Eye size={20} color={colors.textMuted} strokeWidth={2.2} />
            )}
          </Pressable>
        )}
      </View>
      {error && <Text style={[styles.error, { color: colors.danger }]}>{translate(error)}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  passwordToggle: {
    position: 'absolute',
    right: 10,
    top: 6,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  passwordTogglePressed: {
    opacity: 0.65,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
