/**
 * MealCard Component
 * Displays a single logged meal
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../theme';

export default function MealCard({ meal }) {
  const time = new Date(meal.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.card, SHADOWS.sm]}>
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <Flame size={16} color={COLORS.orange} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{meal.foodQuery || 'Meal'}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.calories}>{meal.nutrition?.calories || 0}</Text>
        <Text style={styles.unit}>kcal</Text>
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
    backgroundColor: COLORS.orangeLight,
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
  time: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  calories: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.orange,
  },
  unit: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
