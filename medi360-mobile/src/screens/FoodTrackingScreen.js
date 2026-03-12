/**
 * Food Tracking Screen (Premium)
 * Log meals via AI query, view daily nutrition summary and meal history
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UtensilsCrossed, Flame, Dumbbell, Leaf, Zap, Send, PlusCircle } from 'lucide-react-native';
import { foodAPI, weightGoalAPI } from '../services/api';
import StatCard from '../components/StatCard';
import MealCard from '../components/MealCard';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../theme';

export default function FoodTrackingScreen() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState([]);
  const [summary, setSummary] = useState({
    totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0,
  });
  const [goals, setGoals] = useState(null);

  const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const fetchData = useCallback(async () => {
    try {
      const [mealsRes, summaryRes, goalsRes] = await Promise.all([
        foodAPI.getRecentMeals().catch(() => ({ success: false })),
        foodAPI.getDailyNutritionSummary(today()).catch(() => ({ success: false })),
        weightGoalAPI.get().catch(() => ({ success: false })),
      ]);
      
      if (mealsRes.success) setFoods(mealsRes.data?.meals || []);
      if (summaryRes.success) {
        const s = summaryRes.data?.summary || summaryRes.data || {};
        setSummary({
          totalCalories: s.totalCalories || 0,
          totalProtein: s.totalProtein || 0,
          totalCarbs: s.totalCarbs || 0,
          totalFats: s.totalFats || 0,
        });
      }
      if (goalsRes.success) {
        setGoals(goalsRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogFood = async () => {
    if (!query.trim()) {
      Alert.alert('Oops', 'Please enter what you ate.');
      return;
    }
    try {
      setLoading(true);
      const res = await foodAPI.logFoodQuery({ query });
      if (res.success) {
        Alert.alert('✅ Success', 'Meal logged and analyzed!');
        setQuery('');
        fetchData();
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to log meal.');
    } finally {
      setLoading(false);
    }
  };

  // Progress calculations
  const calorieGoal = goals?.dailyCalories || 2000;
  const calPercent = Math.min((summary.totalCalories / calorieGoal) * 100, 100);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={COLORS.white} />}
    >
      {/* Premium Header */}
      <LinearGradient colors={['#F97316', '#EA580C']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Nutrition</Text>
            <Text style={styles.headerSubtitle}>Fuel your body for success</Text>
          </View>
          <View style={styles.headerIcon}>
            <UtensilsCrossed size={24} color={COLORS.white} />
          </View>
        </View>

        {/* Calorie Ring/Bar Progress */}
        <View style={styles.calorieCard}>
          <View style={styles.calorieInfo}>
            <Text style={styles.calorieMain}>{summary.totalCalories}</Text>
            <Text style={styles.calorieLabel}>Calories In</Text>
            <View style={styles.goalPill}>
              <Text style={styles.goalText}>Goal: {calorieGoal} kcal</Text>
            </View>
          </View>
          <View style={styles.calProgressWrap}>
             <View style={styles.calProgressBg}>
                <LinearGradient 
                  colors={['#FFF7ED', '#FFEDD5']} 
                  start={{x:0, y:0}} end={{x:1, y:0}}
                  style={[styles.calProgressFill, { width: `${calPercent}%` }]} 
                />
             </View>
             <Text style={styles.progressPercent}>{Math.round(calPercent)}% of daily goal</Text>
          </View>
        </View>
      </LinearGradient>

      {/* AI Log Input */}
      <View style={[styles.logCard, SHADOWS.md]}>
        <View style={styles.sectionHeader}>
          <SparklesIcon />
          <Text style={styles.sectionTitle}>AI Meal Logger</Text>
        </View>
        <TextInput
          style={styles.textArea}
          placeholder="Describe your meal (e.g. 2 eggs and toast)"
          placeholderTextColor={COLORS.placeholder}
          multiline
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity
          style={[styles.logBtn, loading && { opacity: 0.7 }]}
          onPress={handleLogFood}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? <ActivityIndicator color={COLORS.white} /> : (
            <Text style={styles.logBtnText}>Analyze & Add Meal</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Macro Breakdown */}
      <View style={styles.macroSection}>
        <MacroCard title="Protein" value={summary.totalProtein} unit="g" icon={Dumbbell} color="#3B82F6" label="Muscle Growth" />
        <MacroCard title="Carbs" value={summary.totalCarbs} unit="g" icon={Zap} color="#10B981" label="Energy Levels" />
        <MacroCard title="Fats" value={summary.totalFats} unit="g" icon={Leaf} color="#F59E0B" label="Heart Health" />
      </View>

      {/* Meal History */}
      <View style={styles.historyHeader}>
        <Text style={styles.sectionTitle}>Today's Meals</Text>
        <TouchableOpacity onPress={fetchData}>
           <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {foods.length === 0 ? (
        <View style={styles.emptyState}>
          <UtensilsCrossed size={40} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No meals logged yet.{"\n"}Try the AI logger above!</Text>
        </View>
      ) : (
        foods.map((meal) => <MealCard key={meal._id} meal={meal} />)
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function SparklesIcon() {
  return (
    <View style={styles.sparkleWrap}>
      <PlusCircle size={14} color="#F97316" />
    </View>
  );
}

function MacroCard({ title, value, unit, icon: Icon, color, label }) {
  return (
    <View style={[styles.macroCard, { borderLeftColor: color }]}>
       <View style={[styles.macroIconWrap, { backgroundColor: `${color}15` }]}>
          <Icon size={18} color={color} />
       </View>
       <View>
          <Text style={styles.macroTitle}>{title}</Text>
          <Text style={[styles.macroValue, { color }]}>{value}{unit}</Text>
          <Text style={styles.macroLabel}>{label}</Text>
       </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 32 },
  
  // Header
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: SPACING.xl,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: COLORS.white },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  headerIcon: {
    width: 48, height: 48, borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },

  // Calorie Card
  calorieCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  calorieInfo: { alignItems: 'center' },
  calorieMain: { fontSize: 48, fontWeight: '900', color: COLORS.white },
  calorieLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginTop: -4 },
  goalPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: RADIUS.full, marginTop: 12,
  },
  goalText: { fontSize: 11, fontWeight: '700', color: COLORS.white },
  calProgressWrap: { marginTop: 20 },
  calProgressBg: {
    height: 8, backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4, overflow: 'hidden',
  },
  calProgressFill: { height: '100%', borderRadius: 4 },
  progressPercent: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginTop: 8, textAlign: 'center' },

  // Log Card
  logCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.xl,
    marginTop: -24,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    ...SHADOWS.lg,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sparkleWrap: { width: 24, height: 24, borderRadius: 6, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  textArea: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    fontSize: 15,
    minHeight: 100,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    textAlignVertical: 'top',
  },
  logBtn: {
    backgroundColor: '#F97316',
    borderRadius: RADIUS.xl,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    ...SHADOWS.md,
  },
  logBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },

  // Macros
  macroSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    marginTop: 24,
    gap: 12,
  },
  macroCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...SHADOWS.sm,
  },
  macroIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  macroTitle: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },
  macroValue: { fontSize: 18, fontWeight: '800', marginVertical: 2 },
  macroLabel: { fontSize: 9, fontWeight: '600', color: COLORS.textMuted },

  // History
  historyHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.xl, marginTop: 32, marginBottom: 16,
  },
  refreshText: { fontSize: 12, fontWeight: '700', color: '#F97316' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginTop: 12, lineHeight: 20 },
});
