/**
 * StatCard Component (Premium)
 * Displays a key metric with icon, value, subtitle
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../theme';

export default function StatCard({ title, value, subtitle, icon: Icon, iconColor, bgColor }) {
  const bg = bgColor || COLORS.primaryBg;
  const ic = iconColor || COLORS.primary;

  return (
    <View style={[styles.card, SHADOWS.sm]}>
      <View style={styles.topRow}>
         <View style={[styles.iconWrap, { backgroundColor: bg }]}>
            {Icon && <Icon size={18} color={ic} />}
         </View>
         <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
      <View style={styles.bottomRow}>
         <Text style={styles.value} numberOfLines={1}>{value ?? '--'}</Text>
         {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    flex: 1,
    minWidth: 140,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  bottomRow: {
    paddingLeft: 2,
  },
  value: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
