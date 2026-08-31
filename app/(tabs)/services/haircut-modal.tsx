import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Input } from '../../../src/components/common/Input';
import { Button } from '../../../src/components/common/Button';
import { useThemeStore } from '../../../src/store/useThemeStore';
import apiClient from '../../../src/api/apiClient';

export default function HaircutModalScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useThemeStore();
  const isEditing = !!id;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      apiClient.get(`/haircuts/${id}`).then((res) => {
        const item = res.data.data;
        setName(item.name);
        setDescription(item.description || '');
        setPrice(String(item.price));
        setDurationMinutes(String(item.durationMinutes));
      });
    }
  }, [id]);

  const handleSave = async () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert(t('Validation Error'), t('Name and price are required'));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        durationMinutes: parseInt(durationMinutes, 10) || 30,
      };

      if (isEditing) {
        await apiClient.patch(`/admin/haircuts/${id}`, payload);
      } else {
        await apiClient.post('/admin/haircuts', payload);
      }

      router.back();
    } catch (err: any) {
      Alert.alert(t('Error'), err.response?.data?.message || t('Failed to save haircut'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: colors.text }]}>{isEditing ? 'Edit Service' : 'Add Haircut Service'}</Text>

      <Input label="Haircut Name" placeholder="e.g. Skin Fade" value={name} onChangeText={setName} />
      <Input label="Description" placeholder="Description of style..." multiline numberOfLines={3} value={description} onChangeText={setDescription} />
      <Input label="Price (₹)" placeholder="250" keyboardType="numeric" value={price} onChangeText={setPrice} />
      <Input label="Estimated Duration (Mins)" placeholder="30" keyboardType="numeric" value={durationMinutes} onChangeText={setDurationMinutes} />

      <View style={styles.buttonWrapper}>
        <Button title={isEditing ? 'Save Changes' : 'Create Haircut'} onPress={handleSave} loading={loading} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 20 },
  buttonWrapper: { marginTop: 16 },
});