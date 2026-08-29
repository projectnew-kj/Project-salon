import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Scissors } from 'lucide-react-native';
import { Input } from '../../src/components/common/Input';
import { Button } from '../../src/components/common/Button';
import { useThemeStore } from '../../src/store/useThemeStore';
import { useUserAuthStore } from '../../src/store/useUserAuthStore';
import userApiClient from '../../src/api/userApiClient';

export default function LoginScreen() {
  const { colors } = useThemeStore();
  const { setAuth, setGuest } = useUserAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await userApiClient.post('/auth/login', {
        email: email.trim(),
        password,
      });

      const { user, tokens } = response.data.data;
      await setAuth(user, tokens.accessToken, tokens.refreshToken);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestBrowse = () => {
    setGuest();
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps={"always"} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surfaceSecondary }]}>
            <Scissors size={40} color={colors.primaryAccent} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sign in to manage your appointments
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Input
            label="Email Address"
            placeholder="john@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Button title="Sign In" onPress={handleLogin} loading={loading} />

          <View style={styles.dividerRow}>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
            <Text style={[styles.orText, { color: colors.textMuted }]}>OR</Text>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
          </View>

          <Button
            title="Browse as Guest"
            variant="secondary"
            onPress={handleGuestBrowse}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(auth)/register')}
            style={styles.switchRow}
          >
            <Text style={[styles.switchText, { color: colors.textSecondary }]}>
              Don't have an account? <Text style={{ color: colors.primaryAccent, fontWeight: '700' }}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 28 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 4 },
  card: { padding: 20, borderRadius: 16, borderWidth: 1 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  line: { flex: 1, height: 1 },
  orText: { marginHorizontal: 12, fontSize: 12, fontWeight: '600' },
  switchRow: { marginTop: 16, alignItems: 'center' },
  switchText: { fontSize: 14 },
});