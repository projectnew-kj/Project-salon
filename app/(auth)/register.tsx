import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Scissors } from 'lucide-react-native';
import { Input } from '../../src/components/common/Input';
import { Button } from '../../src/components/common/Button';
import { useThemeStore } from '../../src/store/useThemeStore';
import { useUserAuthStore } from '../../src/store/useUserAuthStore';
import userApiClient from '../../src/api/userApiClient';

export default function RegisterScreen() {
  const { colors } = useThemeStore();
  const { setAuth } = useUserAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Name, email, and password are required');
      return;
    }

    setLoading(true);
    try {
      const response = await userApiClient.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });

      const { user, tokens } = response.data.data;
      await setAuth(user, tokens.accessToken, tokens.refreshToken);
      router.replace('/(tabs)');
    } catch (err: any) {
      console.log(err, "err")
      Alert.alert('Registration Failed', err.response?.data?.message || 'Unable to register account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surfaceSecondary }]}>
            <Scissors size={40} color={colors.primaryAccent} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Book appointments and access exclusive offers
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Input label="Full Name" placeholder="John Doe" value={name} onChangeText={setName} />
          <Input
            label="Email"
            placeholder="john@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Phone Number"
            placeholder="+91 98765 43210"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <Input
            label="Password"
            placeholder="Min. 8 characters"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Button title="Sign Up" onPress={handleRegister} loading={loading} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(auth)/login')}
            style={styles.switchRow}
          >
            <Text style={[styles.switchText, { color: colors.textSecondary }]}>
              Already have an account? <Text style={{ color: colors.primaryAccent, fontWeight: '700' }}>Sign In</Text>
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
  subtitle: { fontSize: 14, marginTop: 4, textAlign: 'center' },
  card: { padding: 20, borderRadius: 16, borderWidth: 1 },
  switchRow: { marginTop: 16, alignItems: 'center' },
  switchText: { fontSize: 14 },
});