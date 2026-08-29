import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Pencil, Plus, Trash2 } from 'lucide-react-native';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { EmptyState } from '@/components/common/EmptyState';
import { Input } from '../../../src/components/common/Input';
import { Button } from '../../../src/components/common/Button';
import Modal from '../../../src/components/common/Modal';
import apiClient from '../../../src/api/apiClient';

interface CarouselBanner {
  _id: string;
  title: string;
  description?: string;
  images: string[];
  ctaAction?: string;
  ctaTargetId?: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string | null;
}

interface FormState {
  title: string;
  description: string;
  images: string;
  ctaAction: string;
  ctaTargetId: string;
  displayOrder: string;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  images: '',
  ctaAction: '',
  ctaTargetId: '',
  displayOrder: '0',
  isActive: true,
};

const normalizeImages = (value: string) =>
  value
    .split(/\r?\n|,/) 
    .map((item) => item.trim())
    .filter(Boolean);

export default function AdminBannersScreen() {
  const { colors } = useThemeStore();
  const [banners, setBanners] = useState<CarouselBanner[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const editingTitle = useMemo(() => (editingId ? 'Edit Banner' : 'Add Banner'), [editingId]);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/carousels');
      setBanners(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      Alert.alert('Error', 'Unable to fetch carousel banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEdit = (banner: CarouselBanner) => {
    setEditingId(banner._id);
    setForm({
      title: banner.title || '',
      description: banner.description || '',
      images: (banner.images || []).join('\n'),
      ctaAction: banner.ctaAction || '',
      ctaTargetId: banner.ctaTargetId || '',
      displayOrder: String(banner.displayOrder ?? 0),
      isActive: banner.isActive !== false,
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    if (!saving) setModalVisible(false);
  };

  const handleSave = async () => {
    const images = normalizeImages(form.images);
    if (!form.title.trim()) {
      Alert.alert('Validation', 'Banner title is required.');
      return;
    }
    if (images.length === 0) {
      Alert.alert('Validation', 'Add at least one image URL.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      images,
      ctaAction: form.ctaAction.trim(),
      ctaTargetId: form.ctaTargetId.trim(),
      displayOrder: Number(form.displayOrder) || 0,
      isActive: form.isActive,
    };

    setSaving(true);
    try {
      if (editingId) {
        await apiClient.patch(`/admin/carousels/${editingId}`, payload);
      } else {
        await apiClient.post('/admin/carousels', payload);
      }
      setModalVisible(false);
      await fetchBanners();
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Unable to save carousel banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Banner', 'Delete this promotional banner?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/admin/carousels/${id}`);
            await fetchBanners();
          } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message || 'Unable to delete banner');
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.toolbar}>
        <View>
          <Text style={[styles.heading, { color: colors.text }]}>Carousel Banners</Text>
          <Text style={[styles.subheading, { color: colors.textSecondary }]}>Manage promotional images shown on the user home screen.</Text>
        </View>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primaryAccent }]} onPress={openCreate}>
          <Plus size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={banners}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchBanners} tintColor={colors.primaryAccent} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const firstImage = item.images?.[0];
          return (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardContent}>
                {firstImage ? (
                  <Image source={{ uri: firstImage }} style={styles.thumbnail} resizeMode="cover" />
                ) : (
                  <View style={[styles.thumbnail, { backgroundColor: colors.surfaceSecondary }]} />
                )}
                <View style={styles.info}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.bannerTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                    <View style={[styles.status, { backgroundColor: item.isActive ? '#DCFCE7' : colors.surfaceSecondary }]}>
                      <Text style={[styles.statusText, { color: item.isActive ? '#15803D' : colors.textMuted }]}> 
                        {item.isActive ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.bannerDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                    {item.description || 'No description'}
                  </Text>
                  <Text style={[styles.metaText, { color: colors.textMuted }]}>Images: {item.images?.length || 0} · Order: {item.displayOrder}</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconButton}>
                    <Pencil size={18} color={colors.primaryAccent} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.iconButton}>
                    <Trash2 size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            title="No banners yet"
            subtitle="Create your first banner to attract more customers!"
          />
        }
      />

      <Modal visible={modalVisible} onClose={closeModal} title={editingTitle}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Input
            label="Title *"
            placeholder="Summer Grooming Special"
            value={form.title}
            onChangeText={(title) => setForm((prev) => ({ ...prev, title }))}
          />
          <Input
            label="Description"
            placeholder="Up to 30% OFF on styling packages"
            value={form.description}
            onChangeText={(description) => setForm((prev) => ({ ...prev, description }))}
            multiline
            style={styles.multilineInput}
          />
          <Input
            label="Images *"
            placeholder={'Paste image URLs, one per line\nhttps://.../banner-1.jpg\nhttps://.../banner-2.jpg'}
            value={form.images}
            onChangeText={(images) => setForm((prev) => ({ ...prev, images }))}
            multiline
            textAlignVertical="top"
            style={styles.imagesInput}
          />
          <Text style={[styles.helper, { color: colors.textMuted }]}>You can enter multiple URLs separated by commas or new lines. The first image is used as the admin thumbnail.</Text>
          <Input
            label="CTA Action"
            placeholder="BOOK_NOW / OFFER_VIEW"
            value={form.ctaAction}
            onChangeText={(ctaAction) => setForm((prev) => ({ ...prev, ctaAction }))}
          />
          <Input
            label="CTA Target ID"
            placeholder="Optional service/offer ID"
            value={form.ctaTargetId}
            onChangeText={(ctaTargetId) => setForm((prev) => ({ ...prev, ctaTargetId }))}
          />
          <Input
            label="Display Order"
            placeholder="0"
            keyboardType="number-pad"
            value={form.displayOrder}
            onChangeText={(displayOrder) => setForm((prev) => ({ ...prev, displayOrder }))}
          />

          <TouchableOpacity
            onPress={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
            style={styles.activeToggle}
          >
            <View style={[styles.checkbox, { borderColor: colors.border, backgroundColor: form.isActive ? colors.primaryAccent : 'transparent' }]}>
              {form.isActive ? <Text style={styles.checkmark}>✓</Text> : null}
            </View>
            <Text style={[styles.toggleText, { color: colors.text }]}>Show this banner to users</Text>
          </TouchableOpacity>

          <View style={styles.modalActions}>
            <Button title="Cancel" variant="outline" onPress={closeModal} disabled={saving} />
            <Button title={editingId ? 'Update Banner' : 'Create Banner'} onPress={handleSave} loading={saving} />
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 },
  heading: { fontSize: 20, fontWeight: '800' },
  subheading: { fontSize: 12, marginTop: 3, maxWidth: 270 },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  addButtonText: { color: '#FFFFFF', fontWeight: '700' },
  list: { gap: 12, paddingBottom: 24 },
  card: { padding: 14, borderRadius: 14, borderWidth: 1 },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumbnail: { width: 80, height: 60, borderRadius: 10 },
  info: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bannerTitle: { flex: 1, fontSize: 15, fontWeight: '700' },
  bannerDesc: { fontSize: 13, marginTop: 2 },
  metaText: { fontSize: 11, marginTop: 5 },
  status: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '700' },
  actions: { gap: 4 },
  iconButton: { padding: 8 },
  multilineInput: { height: 88, paddingTop: 12 },
  imagesInput: { height: 120, paddingTop: 12 },
  helper: { fontSize: 11, lineHeight: 16, marginTop: -8, marginBottom: 12 },
  activeToggle: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  checkmark: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  toggleText: { fontSize: 14, fontWeight: '600' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, paddingBottom: 4 },
});
