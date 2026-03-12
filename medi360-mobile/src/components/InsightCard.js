/**
 * InsightCard Component
 * Displays an AI health insight
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../theme';

export default function InsightCard({ insight }) {
  return (
    <View style={[styles.card, SHADOWS.sm]}>
      <View style={styles.iconWrap}>
        <AlertTriangle size={14} color={COLORS.orange} />
      </View>
      <Text style={styles.text}>{insight}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primaryBg,
  },
  iconWrap: {
    marginRight: SPACING.md,
    marginTop: 2,
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
    lineHeight: 18,
  },
});
