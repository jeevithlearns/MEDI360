/**
 * Dashboard Screen (Refined)
 * Main health overview with stat cards, weekly chart, quick actions, reminders, and insights
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, RefreshControl, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import {
  Flame, Footprints, CalendarDays, Weight,
  Heart, UtensilsCrossed, Dumbbell, Sparkles,
  CheckCircle, ChevronRight, User as UserIcon,
  Camera, PlusCircle
} from 'lucide-react-native';
import { analyticsAPI, reminderAPI, healthInsightsAPI } from '../services/api';
import api from '../services/api';
import { useAuth } from '../services/AuthContext';
import StatCard from '../components/StatCard';
import InsightCard from '../components/InsightCard';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [todayReminders, setTodayReminders] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [healthDashboard, setHealthDashboard] = useState(null);
  const [weeklyChart, setWeeklyChart] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [analyticsRes, remRes, insightsRes, healthDashRes, weeklyRes] = await Promise.all([
        analyticsAPI.getDashboard().catch(() => ({ data: {} })),
        reminderAPI.getToday().catch(() => ({ data: [] })),
        api.get('/health-insights/personalized').catch(() => ({ data: { insights: [] } })),
        healthInsightsAPI.getDashboard().catch(() => ({ data: null })),
        healthInsightsAPI.getWeeklySummary().catch(() => ({ data: null })),
      ]);

      setDashboardData(analyticsRes.data);
      setTodayReminders(remRes.data || []);
      setAiInsights(insightsRes.data?.insights || []);
      setHealthDashboard(healthDashRes.data || null);

      if (weeklyRes.data?.activity?.dailyData && weeklyRes.data?.nutrition?.dailyData) {
        const activityData = weeklyRes.data.activity.dailyData;
        const nutritionData = weeklyRes.data.nutrition.dailyData;
        const nutritionByDate = {};
        nutritionData.forEach((d) => { nutritionByDate[d.date] = d; });

        const labels = [];
        const intake = [];
        const burn = [];

        activityData.forEach((day) => {
          const nd = nutritionByDate[day.date] || {};
          const dateObj = new Date(day.date);
          labels.push(dateObj.toLocaleDateString(undefined, { weekday: 'short' }));
          intake.push(nd.calories || 0);
          burn.push(day.caloriesBurned || 0);
        });

        setWeeklyChart({ labels, intake, burn });
      }
    } catch (e) {
      console.error('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const caloriesToday = healthDashboard?.nutrition?.totalCalories ?? 0;
  const activeMinutes = healthDashboard?.activity?.totalDuration ?? 0;
  const currentWeight = healthDashboard?.healthProfile?.weight?.value ?? null;
  const weightUnit = healthDashboard?.healthProfile?.weight?.unit || 'kg';
  const bmi = healthDashboard?.healthProfile?.bmi;
  const healthScore = dashboardData?.healthScore || 85;

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loaderText}>Loading your health data...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header Hero ── */}
      <LinearGradient colors={COLORS.gradientPrimary} style={styles.hero}>
        <View style={styles.topRow}>
          <View style={styles.welcomeInfo}>
            <Text style={styles.greetingText}>Hello, {user?.name?.split(' ')[0] || 'User'} 👋</Text>
            <Text style={styles.heroTitle}>Your Dashboard</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileBtn}
            onPress={() => navigation.navigate('HealthProfile')}
            activeOpacity={0.8}
          >
            <UserIcon size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.heroContent}>
          <View>
            <Text style={styles.heroSubtitle}>Your wellness snapshot for today</Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Health Score</Text>
            <Text style={styles.scoreValue}>
              {healthScore}<Text style={styles.scoreMax}>/100</Text>
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── Stat Cards ── */}
      <View style={styles.statsRow}>
        <StatCard
          title="Calories In"
          value={caloriesToday ? `${caloriesToday}` : '0'}
          subtitle="kcal today"
          icon={Flame}
          iconColor={COLORS.orange}
          bgColor={COLORS.orangeLight}
        />
        <StatCard
          title="Active Minutes"
          value={activeMinutes ? `${activeMinutes}` : '0'}
          subtitle="min today"
          icon={Footprints}
          iconColor={COLORS.emerald}
          bgColor={COLORS.emeraldLight}
        />
      </View>
      <View style={styles.statsRow}>
        <StatCard
          title="Active Streak"
          value={dashboardData?.statistics?.totalConsultations != null
            ? `${dashboardData.statistics.totalConsultations}` : '0'}
          subtitle="sessions"
          icon={CalendarDays}
          iconColor={COLORS.blue}
          bgColor={COLORS.blueLight}
        />
        <StatCard
          title="Weight"
          value={currentWeight ? `${currentWeight}` : '—'}
          subtitle={bmi ? `BMI: ${bmi}` : weightUnit}
          icon={Weight}
          iconColor={COLORS.purple}
          bgColor={COLORS.purpleLight}
        />
      </View>

      {/* ── Quick Actions ── */}
      <Text style={[styles.sectionTitle, { marginLeft: 24, marginTop: 24, marginBottom: 12 }]}>Quick Actions</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsScroll}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: COLORS.orangeLight, borderColor: '#FED7AA' }]}
          onPress={() => navigation.navigate('Food')}
        >
          <View style={styles.actionIcon}>
            <UtensilsCrossed size={22} color={COLORS.orange} />
          </View>
          <Text style={styles.actionLabel}>Log Meal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: COLORS.emeraldLight, borderColor: '#A7F3D0' }]}
          onPress={() => navigation.navigate('Exercise')}
        >
          <View style={styles.actionIcon}>
            <Dumbbell size={22} color={COLORS.emerald} />
          </View>
          <Text style={styles.actionLabel}>Log Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: COLORS.primaryBg, borderColor: '#C7D2FE' }]}
          onPress={() => navigation.navigate('MedicalTab', { screen: 'PrescriptionUpload' })}
        >
          <View style={styles.actionIcon}>
            <Camera size={22} color={COLORS.primary} />
          </View>
          <Text style={styles.actionLabel}>Scan Rx</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: COLORS.blueLight, borderColor: '#BFDBFE' }]}
          onPress={() => navigation.navigate('MedicalTab', { screen: 'MedicineReminder' })}
        >
          <View style={styles.actionIcon}>
            <PlusCircle size={22} color={COLORS.blue} />
          </View>
          <Text style={styles.actionLabel}>Add Med</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Weekly Activity Chart ── */}
      {weeklyChart && weeklyChart.labels.length > 0 && (
        <View style={[styles.chartCard, SHADOWS.md]}>
          <Text style={styles.sectionTitle}>Weekly Caloric Balance</Text>
          <LineChart
            data={{
              labels: weeklyChart.labels,
              datasets: [
                { data: weeklyChart.intake.length ? weeklyChart.intake : [0], color: () => COLORS.orange, strokeWidth: 3 },
                { data: weeklyChart.burn.length ? weeklyChart.burn : [0], color: () => COLORS.emerald, strokeWidth: 3 },
              ],
              legend: ['Intake', 'Burn'],
            }}
            width={SCREEN_WIDTH - 64}
            height={200}
            chartConfig={{
              backgroundColor: COLORS.card,
              backgroundGradientFrom: COLORS.card,
              backgroundGradientTo: COLORS.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
              labelColor: () => COLORS.textMuted,
              propsForDots: { r: '4', strokeWidth: '2', stroke: COLORS.primary },
              propsForBackgroundLines: { stroke: COLORS.borderLight },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      {/* ── Upcoming Reminder ── */}
      <View style={[styles.section, SHADOWS.md]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Up Next</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MedicalTab')}>
            <Text style={styles.viewMore}>View Hub</Text>
          </TouchableOpacity>
        </View>
        {todayReminders.length > 0 ? (
          <TouchableOpacity
            style={styles.reminderCard}
            onPress={() => navigation.navigate('MedicalTab', { screen: 'MedicineReminder' })}
            activeOpacity={0.8}
          >
            <View style={styles.reminderLeft}>
              <View style={styles.reminderIcon}>
                <Heart size={18} color={COLORS.white} />
              </View>
              <View>
                <Text style={styles.reminderName}>{todayReminders[0].name}</Text>
                <Text style={styles.reminderTime}>
                  Scheduled for {todayReminders[0].times?.[0] || 'today'}
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={COLORS.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyState}>
            <CheckCircle size={28} color={COLORS.emerald} />
            <Text style={styles.emptyText}>No upcoming reminders today. Great job!</Text>
          </View>
        )}
      </View>

      {/* ── AI Insights ── */}
      <View style={[styles.section, SHADOWS.md, { backgroundColor: COLORS.primaryBg }]}>
        <View style={styles.sectionTitleRow}>
          <Sparkles size={18} color={COLORS.primary} />
          <Text style={[styles.sectionTitle, { marginLeft: 8, marginBottom: 0 }]}>AI Health Insights</Text>
        </View>
        {aiInsights.length > 0 ? (
          aiInsights.map((insight, idx) => <InsightCard key={idx} insight={insight} />)
        ) : (
          <View style={styles.emptyState}>
            <CheckCircle size={28} color={COLORS.emerald} />
            <Text style={styles.emptyText}>Your health markers look great today!</Text>
          </View>
        )}
      </View>

      {/* ── Secondary Links ── */}
      <View style={styles.linksRow}>
        <TouchableOpacity 
          style={styles.linkItem}
          onPress={() => navigation.navigate('WeightGoal')}
        >
          <Weight size={18} color={COLORS.primary} />
          <Text style={styles.linkText}>Goal Settings</Text>
        </TouchableOpacity>
        <View style={styles.linkDivider} />
        <TouchableOpacity 
          style={styles.linkItem}
          onPress={() => navigation.navigate('HealthProfile')}
        >
          <UserIcon size={18} color={COLORS.primary} />
          <Text style={styles.linkText}>Health Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 20 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loaderText: { marginTop: 12, fontSize: 14, color: COLORS.textSecondary },

  // Hero
  hero: {
    paddingTop: 60,
    paddingBottom: 28,
    paddingHorizontal: SPACING.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingText: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  heroTitle: { fontSize: 24, fontWeight: '900', color: COLORS.white },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', maxWidth: 200 },
  scoreCard: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    padding: 12,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  scoreLabel: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.75)' },
  scoreValue: { fontSize: 28, fontWeight: '900', color: COLORS.white, marginTop: 2 },
  scoreMax: { fontSize: 14, color: 'rgba(255,255,255,0.55)' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.lg,
  },

  // Actions
  actionsScroll: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    gap: 12,
  },
  actionCard: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...SHADOWS.sm,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    ...SHADOWS.sm,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },

  // Chart
  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginHorizontal: SPACING.xl,
    marginTop: 24,
  },
  chart: {
    borderRadius: RADIUS.lg,
    marginTop: SPACING.md,
  },

  // Sections
  section: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginHorizontal: SPACING.xl,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  viewMore: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },

  // Reminder
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryBg,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  reminderName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  reminderTime: { fontSize: 12, fontWeight: '600', color: COLORS.primary, marginTop: 2 },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },

  // Links Row
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 20,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  linkDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border,
  }
});
