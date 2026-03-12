/**
 * Exercise Tracking Screen (Sporty Review)
 * Log workouts via AI, view weekly summary and workout history
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Dumbbell, Flame, Footprints, CalendarDays, Send, Activity, Timer } from 'lucide-react-native';
import { exerciseAPI } from '../services/api';
import StatCard from '../components/StatCard';
import WorkoutCard from '../components/WorkoutCard';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../theme';

export default function ExerciseTrackingScreen() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [workouts, setWorkouts] = useState([]);
  const [summary, setSummary] = useState({
    totalCaloriesBurned: 0,
    totalActiveMinutes: 0,
    activeDaysThisWeek: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      const [exercisesRes, summaryRes] = await Promise.all([
        exerciseAPI.getRecentExercises().catch(() => ({ success: false })),
        exerciseAPI.getWeeklyActivitySummary().catch(() => ({ success: false })),
      ]);

      if (exercisesRes.success) setWorkouts(exercisesRes.data?.exercises || []);
      if (summaryRes.success && summaryRes.data?.summary?.weeklyTotals) {
        const t = summaryRes.data.summary.weeklyTotals;
        setSummary({
          totalCaloriesBurned: t.totalCaloriesBurned || 0,
          totalActiveMinutes: t.totalActiveMinutes || 0,
          activeDaysThisWeek: t.activeDays || 0,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogWorkout = async () => {
    if (!query.trim()) {
      Alert.alert('Oops', 'Please describe your workout.');
      return;
    }
    try {
      setLoading(true);
      const res = await exerciseAPI.logWorkoutWithAI({ query });
      if (res.success) {
        Alert.alert('✅ Nice Work!', 'Your workout has been analyzed and logged.');
        setQuery('');
        fetchData();
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to log exercise.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={COLORS.white} />}
    >
      {/* Sporty Header */}
      <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Activity</Text>
            <Text style={styles.headerSubtitle}>Push your limits every day</Text>
          </View>
          <View style={styles.headerIcon}>
            <Activity size={24} color={COLORS.white} />
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.mainStat}>
            <Text style={styles.statValue}>{summary.totalActiveMinutes}</Text>
            <Text style={styles.statLabel}>Active Minutes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.mainStat}>
            <Text style={styles.statValue}>{summary.totalCaloriesBurned}</Text>
            <Text style={styles.statLabel}>Calories Burned</Text>
          </View>
        </View>

        <View style={styles.weeklyIndicator}>
           <Text style={styles.weeklyText}>Active {summary.activeDaysThisWeek} days this week</Text>
           <View style={styles.streakWrap}>
              {[...Array(7)].map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.dayDot, 
                    i < summary.activeDaysThisWeek && styles.dayDotActive
                  ]} 
                />
              ))}
           </View>
        </View>
      </LinearGradient>

      {/* AI Log Input */}
      <View style={[styles.logCard, SHADOWS.lg]}>
        <View style={styles.sectionHeader}>
          <Dumbbell size={20} color="#10B981" />
          <Text style={styles.sectionTitle}>Quick Workout Log</Text>
        </View>
        <TextInput
          style={styles.textArea}
          placeholder="e.g. Swam 10 laps in 20 minutes"
          placeholderTextColor={COLORS.placeholder}
          multiline
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity
          style={[styles.logBtn, loading && { opacity: 0.7 }]}
          onPress={handleLogWorkout}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? <ActivityIndicator color={COLORS.white} /> : (
            <View style={styles.btnContent}>
              <Send size={16} color={COLORS.white} />
              <Text style={styles.logBtnText}>Analyze Effort</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Refined Summary Grid */}
      <View style={styles.summaryGrid}>
         <View style={[styles.summaryItem, { backgroundColor: '#ECFDF5' }]}>
            <Timer size={22} color="#10B981" />
            <Text style={styles.summaryVal}>{summary.totalActiveMinutes}m</Text>
            <Text style={styles.summaryLab}>Total Duration</Text>
         </View>
         <View style={[styles.summaryItem, { backgroundColor: '#FEF2F2' }]}>
            <Flame size={22} color="#EF4444" />
            <Text style={styles.summaryVal}>{summary.totalCaloriesBurned}</Text>
            <Text style={styles.summaryLab}>Energy (kcal)</Text>
         </View>
         <View style={[styles.summaryItem, { backgroundColor: '#EFF6FF' }]}>
            <Footprints size={22} color="#3B82F6" />
            <Text style={styles.summaryVal}>{summary.activeDaysThisWeek}/7</Text>
            <Text style={styles.summaryLab}>Weekly Streak</Text>
         </View>
      </View>

      {/* Workout History */}
      <View style={styles.historyHeader}>
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        <CalendarDays size={18} color={COLORS.textMuted} />
      </View>

      {workouts.length === 0 ? (
        <View style={styles.emptyState}>
          <Activity size={40} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>Push yourself!{"\n"}Log your first session above.</Text>
        </View>
      ) : (
        workouts.map((w) => <WorkoutCard key={w._id} workout={w} />)
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 32 },
  
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

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: RADIUS.xxl,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  mainStat: { alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '900', color: COLORS.white },
  statLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' },
  
  weeklyIndicator: { marginTop: 20, alignItems: 'center' },
  weeklyText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.9)', marginBottom: 10 },
  streakWrap: { flexDirection: 'row', gap: 6 },
  dayDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  dayDotActive: { backgroundColor: COLORS.white, transform: [{ scale: 1.2 }] },

  // Log Card
  logCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.xl,
    marginTop: -20,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    ...SHADOWS.lg,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  textArea: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    fontSize: 15,
    minHeight: 90,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    textAlignVertical: 'top',
  },
  logBtn: {
    backgroundColor: '#10B981',
    borderRadius: RADIUS.xl,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    ...SHADOWS.md,
  },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },

  // Summary Grid
  summaryGrid: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    marginTop: 24,
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    padding: 16,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    gap: 6,
    ...SHADOWS.sm,
  },
  summaryVal: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  summaryLab: { fontSize: 9, fontWeight: '700', color: COLORS.textSecondary, textAlign: 'center' },

  // History
  historyHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.xl, marginTop: 32, marginBottom: 16,
  },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginTop: 12, lineHeight: 20 },
});
