import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Input } from '../../../src/components/common/Input';
import { Button } from '../../../src/components/common/Button';
import { useThemeStore } from '../../../src/store/useThemeStore';
import apiClient from '../../../src/api/apiClient';
import { Haircut } from '../../../src/types/service';

const toDateInput = (isoDate?: string) => (isoDate ? isoDate.slice(0, 10) : '');

export default function OfferModalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useThemeStore();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [availableHaircuts, setAvailableHaircuts] = useState<Haircut[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCatalog, setFetchingCatalog] = useState(true);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const res = await apiClient.get('/admin/haircuts', { params: { isActive: true } });
        setAvailableHaircuts(res.data.data);
      } catch (err) {
        Alert.alert('Error', 'Failed to load haircut catalog');
      } finally {
        setFetchingCatalog(false);
      }
    };
    loadCatalog();
  }, []);

  useEffect(() => {
    if (isEditing) {
      apiClient.get('/admin/offers').then((res) => {
        const offer = res.data.data.find((o: any) => o._id === id);
        if (offer) {
          setTitle(offer.title);
          setDescription(offer.description || '');
          setOriginalPrice(String(offer.originalPrice));
          setOfferPrice(String(offer.offerPrice));
          setValidFrom(toDateInput(offer.validFrom));
          setValidTo(toDateInput(offer.validTo));
          setSelectedServiceIds(offer.services.map((s: any) => (typeof s === 'string' ? s : s._id)));
        }
      });
    }
  }, [id]);

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((s) => s !== serviceId) : [...prev, serviceId]
    );
  };

  const handleSave = async () => {
    if (!title.trim() || !originalPrice.trim() || !offerPrice.trim() || !validFrom || !validTo) {
      Alert.alert('Validation Error', 'Title, prices, and valid date range are required');
      return;
    }

    if (selectedServiceIds.length === 0) {
      Alert.alert('Validation Error', 'Select at least one haircut service for this bundle');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        originalPrice: parseFloat(originalPrice),
        offerPrice: parseFloat(offerPrice),
        services: selectedServiceIds,
        validFrom: new Date(validFrom).toISOString(),
        validTo: new Date(validTo).toISOString(),
      };

      if (isEditing) {
        await apiClient.patch(`/admin/offers/${id}`, payload);
      } else {
        await apiClient.post('/admin/offers', payload);
      }

      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save offer bundle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: colors.text }]}>{isEditing ? 'Edit Offer' : 'Add Offer Bundle'}</Text>

      <Input label="Offer Title" placeholder="e.g. Grooming Combo" value={title} onChangeText={setTitle} />
      <Input
        label="Description"
        placeholder="Bundle details..."
        multiline
        numberOfLines={3}
        value={description}
        onChangeText={setDescription}
      />
      <Input label="Original Price (₹)" placeholder="500" keyboardType="numeric" value={originalPrice} onChangeText={setOriginalPrice} />
      <Input label="Offer Price (₹)" placeholder="399" keyboardType="numeric" value={offerPrice} onChangeText={setOfferPrice} />
      <Input label="Valid From (YYYY-MM-DD)" placeholder="2026-01-01" value={validFrom} onChangeText={setValidFrom} />
      <Input label="Valid To (YYYY-MM-DD)" placeholder="2026-12-31" value={validTo} onChangeText={setValidTo} />

      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Included Services</Text>
      {fetchingCatalog ? (
        <Text style={[styles.hint, { color: colors.textMuted }]}>Loading haircut catalog...</Text>
      ) : (
        <View style={styles.servicesList}>
          {availableHaircuts.map((haircut) => {
            const isSelected = selectedServiceIds.includes(haircut._id);
            return (
              <TouchableOpacity
                key={haircut._id}
                style={[
                  styles.serviceOption,
                  {
                    backgroundColor: isSelected ? colors.primaryAccent : colors.surface,
                    borderColor: isSelected ? colors.primaryAccent : colors.border,
                  },
                ]}
                onPress={() => toggleService(haircut._id)}
              >
                {isSelected && <Check size={14} color="#FFFFFF" style={styles.checkIcon} />}
                <Text style={[styles.serviceOptionText, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                  {haircut.name} (₹{haircut.price})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={styles.buttonWrapper}>
        <Button title={isEditing ? 'Save Changes' : 'Create Offer'} onPress={handleSave} loading={loading} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 20 },
  sectionLabel: { fontSize: 14, fontWeight: '600', marginBottom: 10, marginTop: 4 },
  hint: { fontSize: 13 },
  servicesList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serviceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  checkIcon: { marginRight: 6 },
  serviceOptionText: { fontSize: 13, fontWeight: '600' },
  buttonWrapper: { marginTop: 24 },
});
