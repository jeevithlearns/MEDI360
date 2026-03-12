/**
 * Prescription Upload Screen
 * Camera/gallery capture → upload image → display parsed medicines
 */

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Upload, FileText, CheckCircle, X } from 'lucide-react-native';
import { prescriptionAPI } from '../services/api';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../theme';

export default function PrescriptionUploadScreen() {
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [extractedData, setExtractedData] = useState(null);

  const pickImage = async (useCamera = false) => {
    const permissionMethod = useCamera
      ? ImagePicker.requestCameraPermissionsAsync
      : ImagePicker.requestMediaLibraryPermissionsAsync;

    const { status } = await permissionMethod();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera/gallery access.');
      return;
    }

    const launchMethod = useCamera
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;

    const result = await launchMethod({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setImageBase64(`data:image/jpeg;base64,${asset.base64}`);
      setExtractedData(null);
    }
  };

  const handleUpload = async () => {
    if (!imageBase64) {
      Alert.alert('No Image', 'Please capture or select a prescription image first.');
      return;
    }
    try {
      setLoading(true);
      const res = await prescriptionAPI.upload({ imageBase64 });
      setExtractedData(res.extracted);
      Alert.alert('✅ Done', 'Prescription parsed & saved successfully!');
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to parse prescription.');
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImageUri(null);
    setImageBase64(null);
    setExtractedData(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Upload Prescription</Text>
      <Text style={styles.subtitle}>
        Capture or upload your prescription and our AI will extract medicines and set up reminders.
      </Text>

      {/* Upload Card */}
      <View style={[styles.card, SHADOWS.md]}>
        <FileText size={40} color={COLORS.primary} style={{ alignSelf: 'center', marginBottom: 16 }} />

        {imageUri ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
            <TouchableOpacity style={styles.clearBtn} onPress={clearImage}>
              <X size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.uploadArea}>
            <TouchableOpacity style={styles.captureBtn} onPress={() => pickImage(true)} activeOpacity={0.8}>
              <Camera size={24} color={COLORS.primary} />
              <Text style={styles.captureBtnText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.galleryBtn} onPress={() => pickImage(false)} activeOpacity={0.8}>
              <Upload size={20} color={COLORS.textSecondary} />
              <Text style={styles.galleryBtnText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        {imageUri && (
          <TouchableOpacity
            style={[styles.uploadBtn, loading && { opacity: 0.7 }]}
            onPress={handleUpload}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Upload size={16} color={COLORS.white} />
                <Text style={styles.uploadBtnText}>Upload & Parse (AI)</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Extracted Data */}
      {extractedData && (
        <View style={[styles.card, SHADOWS.md]}>
          <Text style={styles.extractedTitle}>Extracted Information</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Doctor</Text>
              <Text style={styles.infoValue}>{extractedData.doctorName || 'Not found'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Diagnosis</Text>
              <Text style={styles.infoValue}>{extractedData.diagnosis || 'Not found'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Date Issued</Text>
              <Text style={styles.infoValue}>{extractedData.issuedDate || 'Not found'}</Text>
            </View>
          </View>

          <Text style={styles.medTitle}>Medicines Found</Text>
          {extractedData.medicines?.map((med, idx) => (
            <View key={idx} style={styles.medCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.medName}>{med.name}</Text>
                <Text style={styles.medDetail}>Dosage: {med.dosage}</Text>
                <Text style={styles.medDetail}>Instructions: {med.instructions}</Text>
              </View>
              <View style={styles.medBadge}>
                <Text style={styles.medBadgeText}>{med.frequency} × {med.durationDays} days</Text>
              </View>
            </View>
          ))}

          <View style={styles.successStrip}>
            <CheckCircle size={18} color={COLORS.emerald} />
            <Text style={styles.successText}>Reminders have been automatically created!</Text>
          </View>
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.xl, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4, marginBottom: SPACING.xl, lineHeight: 20 },

  card: { backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.xl, marginBottom: SPACING.xl },

  // Upload area
  uploadArea: { gap: 12 },
  captureBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderWidth: 2, borderStyle: 'dashed', borderColor: COLORS.primary,
    borderRadius: RADIUS.xl, paddingVertical: 24,
  },
  captureBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  galleryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.background, borderRadius: RADIUS.lg, paddingVertical: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  galleryBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },

  // Preview
  previewWrap: { position: 'relative', marginBottom: SPACING.lg },
  preview: { width: '100%', height: 220, borderRadius: RADIUS.lg },
  clearBtn: {
    position: 'absolute', top: 8, right: 8, width: 32, height: 32,
    borderRadius: RADIUS.full, backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },

  uploadBtn: {
    flexDirection: 'row', backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    paddingVertical: 14, alignItems: 'center', justifyContent: 'center', gap: 8, ...SHADOWS.md,
  },
  uploadBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },

  // Extracted
  extractedTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: SPACING.md },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: SPACING.xl },
  infoItem: {},
  infoLabel: { fontSize: 11, color: COLORS.textMuted, textTransform: 'uppercase', fontWeight: '600' },
  infoValue: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginTop: 2 },

  medTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  medCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.blueLight,
    padding: SPACING.lg, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: '#BFDBFE', marginBottom: SPACING.sm,
  },
  medName: { fontSize: 15, fontWeight: '700', color: '#1E3A5F' },
  medDetail: { fontSize: 12, color: '#3B82F6', marginTop: 2 },
  medBadge: {
    backgroundColor: COLORS.card, paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: RADIUS.full, ...SHADOWS.sm,
  },
  medBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.blue },

  successStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.emeraldLight, padding: SPACING.md,
    borderRadius: RADIUS.md, marginTop: SPACING.lg,
  },
  successText: { fontSize: 13, fontWeight: '600', color: '#065F46' },
});
