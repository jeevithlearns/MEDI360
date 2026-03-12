/**
 * WorkoutCard Component
 * Displays a single workout entry
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Zap } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../theme';

export default function WorkoutCard({ workout }) {
  const dateStr = new Date(workout.createdAt).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });

  const intensityColors = {
    high: { bg: '#FEF2F2', text: '#DC2626' },
    medium: { bg: COLORS.yellowLight, text: '#D97706' },
    moderate: { bg: COLORS.yellowLight, text: '#D97706' },
    low: { bg: COLORS.emeraldLight, text: '#059669' },
  };

  const ic = intensityColors[workout.intensity] || intensityColors.moderate;

  return (
    <View style={[styles.card, SHADOWS.sm]}>
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <Zap size={16} color={COLORS.emerald} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {workout.exerciseQuery || workout.exerciseName || 'Workout'}
          </Text>
          <View style={styles.meta}>
            <View style={[styles.badge, { backgroundColor: ic.bg }]}>
              <Text style={[styles.badgeText, { color: ic.text }]}>
                {(workout.intensity || 'moderate').toUpperCase()}
              </Text>
            </View>
            <Text style={styles.duration}>{workout.duration} min</Text>
          </View>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.calories}>{workout.caloriesBurned || 0}</Text>
        <Text style={styles.unit}>kcal</Text>
        <Text style={styles.date}>{dateStr}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.emeraldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  duration: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  right: {
    alignItems: 'flex-end',
  },
  calories: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.emerald,
  },
  unit: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  date: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
