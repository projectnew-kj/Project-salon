import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Search, ChevronRight } from 'lucide-react-native';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { useAdminBookingStore } from '../../../src/store/useAdminBookingStore';
import { StatusBadge } from '../../../src/components/common/StatusBadge';

const STATUS_TABS = ['All', 'Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];

export default function AdminBookingsScreen() {
  const { colors } = useThemeStore();
  const { bookings, isLoading, fetchBookings } = useAdminBookingStore();
  const [selectedTab, setSelectedTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const filters: Record<string, string> = {};
    if (selectedTab !== 'All') filters.status = selectedTab;
    if (searchQuery.trim()) filters.search = searchQuery.trim();
    fetchBookings(filters);
  }, [selectedTab, searchQuery, fetchBookings]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search size={18} color={colors.textMuted} />
        <TextInput
          placeholder="Search by Booking Code..."
          placeholderTextColor={colors.textMuted}
          style={[styles.searchInput, { color: colors.text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Horizontal Status Filter Chips */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_TABS}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const isSelected = selectedTab === item;
            return (
              <TouchableOpacity
                onPress={() => setSelectedTab(item)}
                style={[
                  styles.tabChip,
                  {
                    backgroundColor: isSelected ? colors.primaryAccent : colors.surface,
                    borderColor: isSelected ? colors.primaryAccent : colors.border,
                  },
                ]}
              >
                <Text style={[styles.tabText, { color: isSelected ? '#FFFFFF' : colors.textSecondary }]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Bookings Stream List */}
      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        refreshing={isLoading}
        onRefresh={() => fetchBookings(selectedTab === 'All' ? {} : { status: selectedTab })}
        contentContainerStyle={styles.listPadding}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push(`/(tabs)/bookings/${item._id}` as any)}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.code, { color: colors.text }]}>{item.bookingCode}</Text>
              <StatusBadge status={item.status} />
            </View>

            <Text style={[styles.customer, { color: colors.textSecondary }]}>
              {item.user?.name} • {item.user?.phone || 'No phone'}
            </Text>

            <View style={styles.cardFooter}>
              <Text style={[styles.timeDetail, { color: colors.textMuted }]}>
                {item.bookingDate} | {item.bookingTime || 'Flexible'}
              </Text>
              <Text style={[styles.price, { color: colors.primaryAccent }]}>₹{item.totalAmount}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  tabsContainer: { paddingHorizontal: 16, marginBottom: 12 },
  tabChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  tabText: { fontSize: 13, fontWeight: '600' },
  listPadding: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  card: { padding: 16, borderRadius: 14, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  code: { fontSize: 16, fontWeight: '700' },
  customer: { fontSize: 14, marginTop: 6 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  timeDetail: { fontSize: 13 },
  price: { fontSize: 16, fontWeight: '800' },
});