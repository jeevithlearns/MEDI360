/**
 * Weight Goal Screen
 * Set target weight, see calorie target, weight progress
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Weight, Target, TrendingDown, TrendingUp, Save } from 'lucide-react-native';
import { weightGoalAPI } from '../services/api';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../theme';

export default function WeightGoalScreen() {
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    currentWeight: '',
    targetWeight: '',
    targetTimelineWeeks: '',
  });

  useEffect(() => { fetchGoal(); }, []);

  const fetchGoal = async () => {
    try {
      const res = await weightGoalAPI.get();
      if (res.success && res.data) setGoal(res.data);
    } catch (e) {
      if (!e?.message?.includes('No weight goal')) {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.currentWeight || !form.targetWeight || !form.targetTimelineWeeks) {
      Alert.alert('Missing Info', 'Please fill in all three fields.');
      return;
    }
    try {
      setSaving(true);
      const res = await weightGoalAPI.set({
        currentWeight: Number(form.currentWeight),
        targetWeight: Number(form.targetWeight),
        targetTimelineWeeks: Number(form.targetTimelineWeeks),
      });
      if (res.success) {
        setGoal(res.data);
        Alert.alert('✅ Done', 'Weight goal saved!');
        setForm({ currentWeight: '', targetWeight: '', targetTimelineWeeks: '' });
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to save goal');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isGaining = goal?.weeklyWeightChange > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Weight Goal</Text>
      <Text style={styles.subtitle}>Set targets and get AI-driven daily macro recommendations.</Text>

      {/* Current Goal Display */}
      {goal && (
        <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.goalCard}>
          <View style={styles.goalBgIcon}>
            <Target size={80} color="rgba(255,255,255,0.08)" />
          </View>
          <Text style={styles.goalHeading}>Your Macro Target</Text>
          <View style={styles.goalGrid}>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Daily Calories</Text>
              <Text style={styles.goalValue}>{goal.dailyCaloriesTarget}</Text>
              <Text style={styles.goalUnit}>kcal/day</Text>
            </View>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Protein</Text>
              <Text style={styles.goalValue}>{goal.recommendedProtein}g</Text>
              <Text style={styles.goalUnit}>recommended</Text>
            </View>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Pace</Text>
              <View style={styles.paceRow}>
                {isGaining
                  ? <TrendingUp size={16} color={COLORS.white} />
                  : <TrendingDown size={16} color={COLORS.white} />}
                <Text style={styles.goalValue}>
                  {isGaining ? '+' : ''}{goal.weeklyWeightChange}
                </Text>
              </View>
              <Text style={styles.goalUnit}>kg/week</Text>
            </View>
          </View>
        </LinearGradient>
      )}

      {/* Form */}
      <View style={[styles.card, SHADOWS.md]}>
        <Text style={styles.formTitle}>{goal ? 'Update Your Goal' : 'Set a New Goal'}</Text>

        <Text style={styles.fieldLabel}>Current Weight (kg)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder={goal?.currentWeight?.toString() || 'e.g. 75'}
          placeholderTextColor={COLORS.placeholder}
          value={form.currentWeight}
          onChangeText={(v) => setForm({ ...form, currentWeight: v })}
        />

        <Text style={styles.fieldLabel}>Target Weight (kg)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder={goal?.targetWeight?.toString() || 'e.g. 70'}
          placeholderTextColor={COLORS.placeholder}
          value={form.targetWeight}
          onChangeText={(v) => setForm({ ...form, targetWeight: v })}
        />

        <Text style={styles.fieldLabel}>Timeline (Weeks)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder={goal?.targetTimelineWeeks?.toString() || 'e.g. 12'}
          placeholderTextColor={COLORS.placeholder}
          value={form.targetTimelineWeeks}
          onChangeText={(v) => setForm({ ...form, targetTimelineWeeks: v })}
        />

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <>
              <Save size={16} color={COLORS.white} />
              <Text style={styles.saveBtnText}>Calculate & Save Goal</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.xl, paddingTop: 60 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4, marginBottom: SPACING.xl },

  // Goal card
  goalCard: {
    borderRadius: RADIUS.xxl,
    padding: SPACING.xxl,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  goalBgIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
  goalHeading: { fontSize: 20, fontWeight: '800', color: COLORS.white, marginBottom: SPACING.xl },
  goalGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  goalItem: { alignItems: 'center', flex: 1 },
  goalLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginBottom: 4 },
  goalValue: { fontSize: 28, fontWeight: '900', color: COLORS.white },
  goalUnit: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  paceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  // Form
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
  },
  formTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xl },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: SPACING.sm,
    ...SHADOWS.md,
  },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
});
