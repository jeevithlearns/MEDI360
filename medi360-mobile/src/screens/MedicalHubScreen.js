/**
 * Medical Hub Screen (Premium)
 * Navigation center for all medical-related features
 */

import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Pill, FileText, ShieldAlert,
  ChevronRight, Stethoscope
} from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../theme';

const { width } = Dimensions.get('window');

export default function MedicalHubScreen({ navigation }) {
  const menuItems = [
    {
      id: 'reminders',
      title: 'Medicine Reminders',
      subtitle: "Daily medication schedule",
      icon: Pill,
      color: COLORS.primary,
      bgColor: '#EEF2FF',
      screen: 'MedicineReminder',
      description: 'Manage dose timings and tracking.'
    },
    {
      id: 'upload',
      title: 'Scan Prescription',
      subtitle: 'AI-Powered Extraction',
      icon: FileText,
      color: COLORS.emerald,
      bgColor: '#ECFDF5',
      screen: 'PrescriptionUpload',
      description: 'Upload your Rx to auto-detect medicines.'
    },
    {
      id: 'safety',
      title: 'Drug Safety Check',
      subtitle: 'Interaction Analysis',
      icon: ShieldAlert,
      color: COLORS.orange,
      bgColor: '#FFF7ED',
      screen: 'DrugSafety',
      description: 'Check safety against your health profile.'
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Premium Header */}
      <LinearGradient colors={['#4F46E5', '#3730A3']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Medical Hub</Text>
            <Text style={styles.headerSubtitle}>Proactive Health Management</Text>
          </View>
          <View style={styles.headerIcon}>
            <Stethoscope size={24} color={COLORS.white} />
          </View>
        </View>

        <View style={styles.summaryStats}>
           <Text style={styles.hubIntro}>
             Access all your clinical services in one place. Powered by advanced AI for your safety.
           </Text>
        </View>
      </LinearGradient>

      {/* Action List */}
      <View style={styles.grid}>
        <Text style={styles.sectionTitle}>Available Services</Text>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.card, SHADOWS.md]}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.9}
          >
            <View style={[styles.iconWrap, { backgroundColor: item.bgColor }]}>
              <item.icon size={26} color={item.color} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              <Text style={styles.cardDesc}>{item.description}</Text>
            </View>
            <View style={styles.arrowWrap}>
              <ChevronRight size={20} color={COLORS.textMuted} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Info Banner */}
      <View style={styles.footerInfo}>
         <View style={styles.infoBadge}>
            <Text style={styles.infoBadgeText}>AI COMPLIANT</Text>
         </View>
         <Text style={styles.footerText}>
           Our models are trained on medical datasets to provide accurate extractions. Always verify with a professional.
         </Text>
      </View>

      <View style={{ height: 32 }} />
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
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: COLORS.white },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  headerIcon: {
    width: 48, height: 48, borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  hubIntro: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 20, fontWeight: '500' },

  // List
  grid: { paddingHorizontal: SPACING.xl, marginTop: 24, gap: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xxl,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    ...SHADOWS.md,
  },
  iconWrap: {
    width: 64, height: 64, borderRadius: RADIUS.xl,
    alignItems: 'center', justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  cardSubtitle: { fontSize: 12, fontWeight: '700', color: COLORS.primary, marginTop: 2, textTransform: 'uppercase' },
  cardDesc: { fontSize: 12, color: COLORS.textMuted, marginTop: 6, lineHeight: 18 },
  arrowWrap: { alignSelf: 'center' },

  // Footer
  footerInfo: { marginTop: 32, paddingHorizontal: 40, alignItems: 'center' },
  infoBadge: {
    backgroundColor: COLORS.primaryBg, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 4, marginBottom: 12, borderWidth: 1, borderColor: COLORS.primary,
  },
  infoBadgeText: { fontSize: 9, fontWeight: '900', color: COLORS.primary },
  footerText: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', lineHeight: 18, fontStyle: 'italic' },
});
