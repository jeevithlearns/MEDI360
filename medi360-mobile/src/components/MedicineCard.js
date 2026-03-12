/**
 * MedicineCard Component
 * Displays a medicine reminder with "Mark as Taken" action
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Pill, Check, Clock } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../theme';

export default function MedicineCard({ medicine, time, isTaken, onMarkTaken }) {
  return (
    <View
      style={[
        styles.card,
        SHADOWS.sm,
        isTaken && styles.cardTaken,
      ]}
    >
      <View style={styles.left}>
        <View style={[styles.iconWrap, isTaken && styles.iconTaken]}>
          <Pill size={20} color={isTaken ? COLORS.emerald : COLORS.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{medicine.name}</Text>
          <Text style={styles.dosage}>{medicine.dosage}</Text>
          <View style={styles.timeRow}>
            <Clock size={12} color={COLORS.textMuted} />
            <Text style={styles.timeText}>Scheduled for {time}</Text>
          </View>
        </View>
      </View>

      {isTaken ? (
        <View style={styles.takenBadge}>
          <Check size={14} color={COLORS.emerald} />
          <Text style={styles.takenText}>Taken</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.takeBtn}
          onPress={onMarkTaken}
          activeOpacity={0.8}
        >
          <Text style={styles.takeBtnText}>Take Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cardTaken: {
    backgroundColor: COLORS.emeraldLight,
    borderColor: '#A7F3D0',
    opacity: 0.75,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  iconTaken: {
    backgroundColor: '#D1FAE5',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  dosage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  takenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    gap: 4,
  },
  takenText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.emerald,
  },
  takeBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
  },
  takeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
});
