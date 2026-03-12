/**
 * Drug Safety Screen (Refined)
 * Check medication interactions against health profile
 */

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldAlert, Search, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react-native';
import { healthProfileAPI } from '../services/api';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../theme';

export default function DrugSafetyScreen() {
  const [medication, setMedication] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCheck = async () => {
    if (!medication.trim()) {
      Alert.alert('Oops', 'Enter a medication name to check.');
      return;
    }
    try {
      setLoading(true);
      const res = await healthProfileAPI.checkMedication(medication.trim());
      if (res.success) {
        setResult(res.data);
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to check medication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Safety Header */}
      <LinearGradient colors={['#EF4444', '#B91C1C']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Drug Safety</Text>
            <Text style={styles.headerSubtitle}>Personalized interaction check</Text>
          </View>
          <View style={styles.headerIcon}>
            <ShieldAlert size={24} color={COLORS.white} />
          </View>
        </View>

        <View style={styles.searchWrap}>
          <TextInput
            style={styles.input}
            placeholder="Enter medicine name (e.g. Aspirin)"
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={medication}
            onChangeText={setMedication}
          />
          <TouchableOpacity
            style={[styles.checkBtn, loading && { opacity: 0.7 }]}
            onPress={handleCheck}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={COLORS.red} size="small" /> : <Search size={22} color={COLORS.red} />}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Result Display */}
      {result ? (
        <View style={styles.resultContainer}>
          <View style={[styles.statusCard, { backgroundColor: result.safe ? COLORS.emeraldLight : COLORS.redLight, borderColor: result.safe ? COLORS.emerald : COLORS.red }]}>
            <View style={styles.statusHeader}>
              {result.safe ? <ShieldCheck size={32} color={COLORS.emerald} /> : <AlertTriangle size={32} color={COLORS.red} />}
              <View>
                <Text style={[styles.statusTitle, { color: result.safe ? COLORS.emerald : COLORS.red }]}>
                  {result.safe ? 'Safe Analysis' : 'Safety Alert'}
                </Text>
                <Text style={styles.statusSubtitle}>Based on your health profile</Text>
              </View>
            </View>

            <Text style={styles.mainMessage}>{result.message || 'We have analyzed this medication against your profile.'}</Text>
          </View>

          {result.warnings?.length > 0 && (
            <View style={styles.warningList}>
              <Text style={styles.warningHeading}>Identified Risks</Text>
              {result.warnings.map((w, i) => (
                <View key={i} style={styles.warningItem}>
                  <AlertTriangle size={14} color="#D97706" />
                  <Text style={styles.warningText}>{w}</Text>
                </View>
              ))}
            </View>
          )}

          {!result.safe && (
             <View style={styles.emergencyNote}>
                <Text style={styles.noteText}>⚠️ Please consult your doctor before taking this medication.</Text>
             </View>
          )}
        </View>
      ) : (
        <View style={styles.introCard}>
           <ShieldCheck size={48} color={COLORS.primary} style={{ opacity: 0.2, marginBottom: 16 }} />
           <Text style={styles.introTitle}>Safety First</Text>
           <Text style={styles.introText}>
             Our AI analyzes potential interactions with your:{"\n"}
             • Medical Conditions{"\n"}
             • Known Allergies{"\n"}
             • Active Medications
           </Text>
        </View>
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
    paddingBottom: 40,
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

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.xl,
    paddingLeft: SPACING.lg,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  input: {
    flex: 1,
    height: 44,
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  checkBtn: {
    width: 44, height: 44, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.sm,
  },

  // Results
  resultContainer: { paddingHorizontal: SPACING.xl, marginTop: 24 },
  statusCard: {
    borderRadius: RADIUS.xxl, padding: SPACING.xl,
    borderWidth: 1, ...SHADOWS.md,
  },
  statusHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  statusTitle: { fontSize: 20, fontWeight: '900' },
  statusSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  mainMessage: { fontSize: 15, color: COLORS.text, lineHeight: 22, fontWeight: '500' },

  warningList: { marginTop: 24, paddingHorizontal: 4 },
  warningHeading: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
  warningItem: { flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'flex-start' },
  warningText: { flex: 1, fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },

  emergencyNote: {
    marginTop: 24, backgroundColor: '#FFF7ED', padding: 16,
    borderRadius: RADIUS.lg, borderLeftWidth: 4, borderLeftColor: '#F97316',
  },
  noteText: { fontSize: 13, fontWeight: '700', color: '#C2410C', textAlign: 'center' },

  // Intro
  introCard: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  introTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
  introText: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 24 },
});
