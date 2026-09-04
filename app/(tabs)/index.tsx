import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import {
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  ChevronRight,
  Scissors,
} from "lucide-react-native";
import { useThemeStore } from "../../src/store/useThemeStore";
import { useAdminAuthStore } from "../../src/store/useAdminAuthStore";
import { useAdminBookingStore } from "../../src/store/useAdminBookingStore";
import { StatusBadge } from "../../src/components/common/StatusBadge";
import apiClient from "../../src/api/apiClient";
import { EmptyState } from "@/components/common/EmptyState";

export default function AdminDashboardScreen() {
  const { colors } = useThemeStore();
  const { admin } = useAdminAuthStore();
  const { bookings, fetchBookings } = useAdminBookingStore();

  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState({
    totalBookings: 0,
    todayBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
  });

  const fetchAnalytics = async () => {
    try {
      const res = await apiClient.get("/admin/dashboard/analytics");
      setMetrics(res.data.data);
    } catch (err) {
      console.error("Failed to load dashboard metrics", err);
    }
  };

  const loadData = useCallback(async () => {
    await Promise.all([fetchAnalytics(), fetchBookings({ limit: 5 })]);
  }, [fetchBookings]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primaryAccent}
        />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.textSecondary }]}>
          Welcome back,
        </Text>
        <Text style={[styles.adminName, { color: colors.text }]}>
          {admin?.name || "Administrator"}
        </Text>
      </View>

      {/* Analytics Metric Cards Grid */}
      <View style={styles.metricsGrid}>
        <View
          style={[
            styles.metricCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={[styles.iconBox, { backgroundColor: "#EFF6FF" }]}>
            <Calendar size={22} color="#3B82F6" />
          </View>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {metrics.todayBookings}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Today's Queue
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={[styles.iconBox, { backgroundColor: "#FEF3C7" }]}>
            <Clock size={22} color="#D97706" />
          </View>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {metrics.pendingBookings}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Pending Actions
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={[styles.iconBox, { backgroundColor: "#ECFDF5" }]}>
            <DollarSign size={22} color="#10B981" />
          </View>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            ₹{metrics.totalRevenue.toLocaleString()}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Total Revenue
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={[styles.iconBox, { backgroundColor: "#F3E8FF" }]}>
            <CheckCircle2 size={22} color="#8B5CF6" />
          </View>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {metrics.completedBookings}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Completed
          </Text>
        </View>
      </View>

      {/* Quick Action Navigation Buttons */}
      <View style={styles.quickActionContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.quickActionButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => router.push("/(tabs)/services")}
        >
          <Scissors size={20} color={colors.primaryAccent} />
          <Text style={[styles.quickActionText, { color: colors.text }]}>
            Manage Services
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.quickActionButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => router.push("/(tabs)/schedule")}
        >
          <Clock size={20} color={colors.primaryAccent} />
          <Text style={[styles.quickActionText, { color: colors.text }]}>
            Hours & Slots
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recent Live Activity Stream */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recent Bookings
        </Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/bookings")}>
          <Text style={[styles.seeAllText, { color: colors.primaryAccent }]}>
            View All
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {bookings.length > 0 ? (
          bookings.slice(0, 5).map((item) => (
            <TouchableOpacity
              key={item._id}
              activeOpacity={0.7}
              style={[
                styles.bookingRow,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => router.push(`/(tabs)/bookings/${item._id}` as any)}
            >
              <View style={styles.bookingLeft}>
                <Text style={[styles.bookingCode, { color: colors.text }]}>
                  {item.bookingCode}
                </Text>
                <Text
                  style={[styles.customerName, { color: colors.textSecondary }]}
                >
                  {item.user?.name || "Customer"}
                </Text>
                <Text
                  style={[styles.serviceTitle, { color: colors.textSecondary }]}
                >
                  {item.haircut?.name || item.offer?.title || "Service"} •{" "}
                  {item.bookingTime || "Anytime"}
                </Text>
              </View>

              <View style={styles.bookingRight}>
                <StatusBadge status={item.status} />
                <ChevronRight
                  size={18}
                  color={colors.textMuted}
                  style={styles.chevron}
                />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <EmptyState
            title="No recent bookings"
            subtitle="New customer bookings will appear here."
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { marginTop: 8, marginBottom: 20 },
  greeting: { fontSize: 14, fontWeight: "500" },
  adminName: { fontSize: 24, fontWeight: "800", marginTop: 2 },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  metricCard: {
    width: "48%",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  metricValue: { fontSize: 20, fontWeight: "800" },
  metricLabel: { fontSize: 13, marginTop: 4, fontWeight: "500" },
  quickActionContainer: { flexDirection: "row", gap: 12, marginTop: 16 },
  quickActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickActionText: { fontSize: 14, fontWeight: "600" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  seeAllText: { fontSize: 14, fontWeight: "600" },
  listContainer: { gap: 10, paddingBottom: 40 },
  bookingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  bookingLeft: { flex: 1 },
  bookingCode: { fontSize: 15, fontWeight: "700" },
  customerName: { fontSize: 13, marginTop: 2 },
  serviceTitle: { fontSize: 12, marginTop: 2 },
  bookingRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  chevron: { marginLeft: 4 },
});
