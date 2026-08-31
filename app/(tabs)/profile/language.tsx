import { useTranslation } from '../../../src/hooks/useTranslation';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Check, Globe } from 'lucide-react-native';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { useLanguageStore } from '../../../src/store/useLanguageStore';

export default function LanguageSelectionScreen() {
  const { colors } = useThemeStore();
  const { currentLanguage, languages, setLanguage, refreshLanguages } = useLanguageStore();
  const { t } = useTranslation();

  useEffect(() => { refreshLanguages().catch(() => undefined); }, []);

  const handleSelect = async (code: string) => {
    await setLanguage(code);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.header}>
        <Globe size={28} color={colors.primaryAccent} />
        <Text style={[styles.title, { color: colors.text }]}>{t('profile.choose_language')}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('profile.language_subtitle')}</Text>
      </View>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={languages}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isSelected = currentLanguage === item.code;
          return (
            <TouchableOpacity
              style={[styles.row, { backgroundColor: colors.surface, borderColor: isSelected ? colors.primaryAccent : colors.border }]}
              onPress={() => handleSelect(item.code)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.langName, { color: colors.text }]}>{item.nativeName}</Text>
                <Text style={[styles.langCode, { color: colors.textMuted }]}>{item.name} · {item.code.toUpperCase()}</Text>
              </View>
              {isSelected && <Check size={20} color={colors.primaryAccent} />}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={[styles.empty, { color: colors.textMuted }]}>{t('language.no_languages')}</Text>}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 }, header: { alignItems: 'center', padding: 24, paddingBottom: 12 },
  title: { fontSize: 20, fontWeight: '800', marginTop: 10 }, subtitle: { fontSize: 13, marginTop: 4, textAlign: 'center' },
  listContent: { paddingHorizontal: 16, paddingTop: 12, gap: 10, paddingBottom: 32 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 14, borderWidth: 1.5 },
  langName: { fontSize: 15, fontWeight: '700' }, langCode: { fontSize: 12, marginTop: 3 }, empty: { textAlign: 'center', padding: 24 }
});
