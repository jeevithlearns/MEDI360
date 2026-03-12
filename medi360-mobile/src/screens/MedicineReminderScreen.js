/**
 * Medicine Reminder Screen (Refined)
 * Today's medicines with mark-as-taken functionality
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, RefreshControl, Alert, TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Pill, Bell, CheckCircle2, Calendar } from 'lucide-react-native';
import { reminderAPI } from '../services/api';
import MedicineCard from '../components/MedicineCard';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../theme';

export default function MedicineReminderScreen() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReminders = useCallback(async () => {
    try {
      const res = await reminderAPI.getToday();
      setMedicines(res.data || []);
    } catch (e) {
      console.error('Failed to load reminders:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchReminders(); }, [fetchReminders]);

  const markTaken = async (medicineId, time) => {
    try {
      await reminderAPI.markTaken(medicineId, time);
      Alert.alert('✅ Confirmed', 'Medicine marked as taken.');
      fetchReminders();
    } catch (e) {
      Alert.alert('Error', 'Could not update status.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const todayStr = new Date().toDateString();
  const totalDoses = medicines.reduce((acc, med) => acc + (med.times?.length || 0), 0);
  const takenCount = medicines.reduce((acc, med) => {
    const takenToday = med.takenLog?.filter(log => new Date(log.date).toDateString() === todayStr).length || 0;
    return acc + takenToday;
  }, 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchReminders(); }} tintColor={COLORS.white} />}
    >
      {/* Reminder Header */}
      <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Medications</Text>
            <Text style={styles.headerSubtitle}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          </View>
          <View style={styles.headerIcon}>
            <Bell size={24} color={COLORS.white} />
          </View>
        </View>

        <View style={styles.summaryCard}>
            <View style={styles.statBox}>
               <Text style={styles.statVal}>{takenCount}/{totalDoses}</Text>
               <Text style={styles.statLab}>Doses Taken</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
               <Text style={styles.statVal}>{medicines.length}</Text>
               <Text style={styles.statLab}>Active Meds</Text>
            </View>
        </View>
      </LinearGradient>

      <View style={styles.listContainer}>
        <View style={styles.sectionHeader}>
           <Calendar size={18} color={COLORS.textSecondary} />
           <Text style={styles.sectionTitle}>Schedule for Today</Text>
        </View>

        {medicines.length === 0 ? (
          <View style={styles.emptyState}>
            <CheckCircle2 size={56} color={COLORS.emerald} style={{ opacity: 0.3 }} />
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptyText}>No medicines scheduled for the rest of today.</Text>
            <TouchableOpacity style={styles.hubBtn} onPress={() => Alert.alert('Add Medication', 'Please use the Prescription Upload or AI Assistant to add new medications.')}>
               <Text style={styles.hubBtnText}>Add New Reminder</Text>
            </TouchableOpacity>
          </View>
        ) : (
          medicines.map((med) =>
            med.times?.map((time) => {
              const takenLog = med.takenLog?.find(
                (log) =>
                  new Date(log.date).toDateString() === todayStr && log.time === time
              );
              return (
                <MedicineCard
                  key={`${med._id}-${time}`}
                  medicine={med}
                  time={time}
                  isTaken={!!takenLog}
                  onMarkTaken={() => markTaken(med._id, time)}
                />
              );
            })
          )
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 32 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },

  // Header
  header: {
    paddingTop: 60,
    paddingBottom: 36,
    paddingHorizontal: SPACING.xl,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: COLORS.white },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  headerIcon: {
    width: 48, height: 48, borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },

  summaryCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  statBox: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 24, fontWeight: '900', color: COLORS.white },
  statLab: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginTop: 4 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 4 },

  listContainer: { paddingHorizontal: SPACING.xl, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },

  emptyState: { alignItems: 'center', marginTop: 40, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginTop: 16 },
  emptyText: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  hubBtn: {
    marginTop: 24, backgroundColor: COLORS.primaryBg, paddingHorizontal: 20,
    paddingVertical: 12, borderRadius: RADIUS.full,
  },
  hubBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
});
