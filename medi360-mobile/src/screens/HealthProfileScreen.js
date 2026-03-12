/**
 * Health Profile Screen
 * View and update personal health profile
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { User, Heart, Shield, Plus, Save, LogOut } from 'lucide-react-native';
import { healthProfileAPI } from '../services/api';
import { useAuth } from '../services/AuthContext';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../theme';

export default function HealthProfileScreen() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    activityLevel: 'moderate',
  });
  const [newCondition, setNewCondition] = useState('');
  const [newAllergy, setNewAllergy] = useState('');

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await healthProfileAPI.get();
      if (res.success && res.data) {
        setProfile(res.data);
        setForm({
          age: res.data.age?.toString() || '',
          gender: res.data.gender || 'male',
          height: res.data.height?.value?.toString() || '',
          weight: res.data.weight?.value?.toString() || '',
          activityLevel: res.data.activityLevel || 'moderate',
        });
      }
    } catch (e) {
      console.log('No profile yet');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = {
        age: Number(form.age),
        gender: form.gender,
        height: { value: Number(form.height), unit: 'cm' },
        weight: { value: Number(form.weight), unit: 'kg' },
        activityLevel: form.activityLevel,
      };
      const res = profile
        ? await healthProfileAPI.update(data)
        : await healthProfileAPI.create(data);
      if (res.success) {
        setProfile(res.data);
        Alert.alert('✅ Saved', 'Health profile updated!');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCondition = async () => {
    if (!newCondition.trim()) return;
    try {
      await healthProfileAPI.addCondition({ condition: newCondition.trim() });
      setNewCondition('');
      fetchProfile();
      Alert.alert('Added', 'Condition added to your profile.');
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to add');
    }
  };

  const handleAddAllergy = async () => {
    if (!newAllergy.trim()) return;
    try {
      await healthProfileAPI.addAllergy({ allergy: newAllergy.trim() });
      setNewAllergy('');
      fetchProfile();
      Alert.alert('Added', 'Allergy added to your profile.');
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to add');
    }
  };

  const genders = ['male', 'female', 'other'];
  const activities = ['sedentary', 'light', 'moderate', 'active', 'very_active'];

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Health Profile</Text>
      <Text style={styles.subtitle}>Keep your health data up to date for personalised insights.</Text>

      {/* Basic Info */}
      <View style={[styles.card, SHADOWS.md]}>
        <View style={styles.cardHeader}>
          <User size={18} color={COLORS.primary} />
          <Text style={styles.cardTitle}>Basic Information</Text>
        </View>

        <Text style={styles.label}>Age</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={form.age} onChangeText={(v) => setForm({ ...form, age: v })} placeholder="e.g. 28" placeholderTextColor={COLORS.placeholder} />

        <Text style={styles.label}>Gender</Text>
        <View style={styles.chipRow}>
          {genders.map((g) => (
            <TouchableOpacity key={g} style={[styles.chip, form.gender === g && styles.chipActive]} onPress={() => setForm({ ...form, gender: g })}>
              <Text style={[styles.chipText, form.gender === g && styles.chipTextActive]}>{g.charAt(0).toUpperCase() + g.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Height (cm)</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={form.height} onChangeText={(v) => setForm({ ...form, height: v })} placeholder="e.g. 175" placeholderTextColor={COLORS.placeholder} />

        <Text style={styles.label}>Weight (kg)</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={form.weight} onChangeText={(v) => setForm({ ...form, weight: v })} placeholder="e.g. 72" placeholderTextColor={COLORS.placeholder} />

        <Text style={styles.label}>Activity Level</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.lg }}>
          <View style={styles.chipRow}>
            {activities.map((a) => (
              <TouchableOpacity key={a} style={[styles.chip, form.activityLevel === a && styles.chipActive]} onPress={() => setForm({ ...form, activityLevel: a })}>
                <Text style={[styles.chipText, form.activityLevel === a && styles.chipTextActive]}>{a.replace('_', ' ')}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
          {saving ? <ActivityIndicator color={COLORS.white} size="small" /> : (
            <>
              <Save size={16} color={COLORS.white} />
              <Text style={styles.saveBtnText}>Save Profile</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Conditions */}
      <View style={[styles.card, SHADOWS.md]}>
        <View style={styles.cardHeader}>
          <Heart size={18} color={COLORS.red} />
          <Text style={styles.cardTitle}>Medical Conditions</Text>
        </View>
        {profile?.medicalConditions?.map((c, i) => (
          <View key={i} style={styles.tagItem}>
            <Text style={styles.tagText}>{c.condition || c}</Text>
          </View>
        ))}
        <View style={styles.addRow}>
          <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="Add condition..." placeholderTextColor={COLORS.placeholder} value={newCondition} onChangeText={setNewCondition} />
          <TouchableOpacity style={styles.addBtn} onPress={handleAddCondition}>
            <Plus size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Allergies */}
      <View style={[styles.card, SHADOWS.md]}>
        <View style={styles.cardHeader}>
          <Shield size={18} color={COLORS.yellow} />
          <Text style={styles.cardTitle}>Allergies</Text>
        </View>
        {profile?.allergies?.map((a, i) => (
          <View key={i} style={styles.tagItem}>
            <Text style={styles.tagText}>{a.allergy || a}</Text>
          </View>
        ))}
        <View style={styles.addRow}>
          <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="Add allergy..." placeholderTextColor={COLORS.placeholder} value={newAllergy} onChangeText={setNewAllergy} />
          <TouchableOpacity style={styles.addBtn} onPress={handleAddAllergy}>
            <Plus size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={() => {
        Alert.alert('Logout', 'Are you sure you want to sign out?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', style: 'destructive', onPress: logout }
        ]);
      }}>
        <LogOut size={18} color={COLORS.red} />
        <Text style={styles.logoutBtnText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.xl, paddingTop: 60 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4, marginBottom: SPACING.xl },
  card: { backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.xl, marginBottom: SPACING.xl },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: SPACING.xl },
  cardTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.background, borderRadius: RADIUS.lg, padding: SPACING.lg,
    fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg,
  },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: SPACING.lg },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full,
    backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.white },
  saveBtn: {
    flexDirection: 'row', backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    paddingVertical: 14, alignItems: 'center', justifyContent: 'center', gap: 8, ...SHADOWS.md,
  },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  tagItem: {
    backgroundColor: COLORS.primaryBg, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: RADIUS.full, marginBottom: 8, alignSelf: 'flex-start',
  },
  tagText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  addRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 8 },
  addBtn: {
    width: 44, height: 44, borderRadius: RADIUS.lg, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.red,
  },
});
