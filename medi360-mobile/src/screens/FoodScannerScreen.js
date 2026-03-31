/**
 * Food Scanner Screen (React Native / Expo)
 * AI-powered food image recognition: Camera/Gallery → Detect → Edit → Save
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  ImagePlus,
  ScanLine,
  AlertTriangle,
  Trash2,
  PlusCircle,
  Save,
  RotateCcw,
  CheckCircle2,
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
  ChevronDown,
  Clock,
  History,
  UtensilsCrossed,
} from 'lucide-react-native';
import { foodAPI } from '../services/api';
import MealCard from '../components/MealCard';
import { COLORS, RADIUS, SHADOWS, SPACING, FONTS } from '../theme';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function FoodScannerScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [editedFoods, setEditedFoods] = useState([]);
  const [mealType, setMealType] = useState('snack');
  const [saved, setSaved] = useState(false);

  // Meal history state
  const [recentMeals, setRecentMeals] = useState([]);
  const [dailySummary, setDailySummary] = useState({ totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 });
  const [loadingHistory, setLoadingHistory] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const cardWidth = screenWidth - (SPACING.xl * 2);

  const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const fetchMealHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const [mealsRes, summaryRes] = await Promise.all([
        foodAPI.getRecentMeals().catch(() => ({ success: false })),
        foodAPI.getDailyNutritionSummary(todayStr()).catch(() => ({ success: false })),
      ]);
      if (mealsRes.success) setRecentMeals(mealsRes.data?.meals || []);
      if (summaryRes.success) {
        const ss = summaryRes.data?.summary || summaryRes.data || {};
        setDailySummary({
          totalCalories: ss.totalCalories || 0,
          totalProtein: ss.totalProtein || 0,
          totalCarbs: ss.totalCarbs || 0,
          totalFats: ss.totalFats || 0,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => { fetchMealHistory(); }, [fetchMealHistory]);

  // ─── Image Picker ────────────────────────────────────────────
  const pickImage = useCallback(async (useCamera = false) => {
    try {
      // Request permissions
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Needed', 'Camera access is required to take photos.');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Needed', 'Gallery access is required to select photos.');
          return;
        }
      }

      // NOTE: allowsEditing can cause blank URIs on some Android devices
      // base64 is fetched separately to avoid memory issues
      const options = {
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
        base64: true,
        aspect: [4, 3],
      };

      let pickerResult;
      if (useCamera) {
        pickerResult = await ImagePicker.launchCameraAsync(options);
      } else {
        pickerResult = await ImagePicker.launchImageLibraryAsync(options);
      }

      console.log('[FoodScanner] Picker result canceled:', pickerResult.canceled);

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        const asset = pickerResult.assets[0];
        console.log('[FoodScanner] Asset URI:', asset.uri ? 'exists' : 'MISSING');
        console.log('[FoodScanner] Asset base64:', asset.base64 ? 'exists' : 'MISSING');

        const uri = asset.uri;
        const b64 = asset.base64 || null;

        // Set state
        setImageUri(uri);
        setImageBase64(b64);
        setScanResult(null);
        setEditedFoods([]);
        setSaved(false);
      }
    } catch (error) {
      console.error('[FoodScanner] Pick image error:', error);
      Alert.alert('Error', 'Failed to pick image: ' + (error.message || 'Unknown error'));
    }
  }, []);

  // ─── Analyze Image ───────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!imageUri) {
      Alert.alert('No Image', 'Please take or select a photo first.');
      return;
    }

    try {
      setAnalyzing(true);
      setScanResult(null);
      setEditedFoods([]);
      setSaved(false);

      // Prefer base64 upload if available (more reliable on mobile)
      let res;
      if (imageBase64) {
        res = await foodAPI.analyzeImageBase64(`data:image/jpeg;base64,${imageBase64}`);
      } else {
        const formData = new FormData();
        formData.append('image', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'food_scan.jpg',
        });
        res = await foodAPI.analyzeImage(formData);
      }

      if (res.success) {
        setScanResult(res.data);
        setEditedFoods(
          (res.data.foods || []).map((f) => ({
            name: f.name,
            grams: f.grams,
            calories: f.calories,
            protein: f.protein,
            carbs: f.carbs,
            fat: f.fat,
            confidence: f.confidence,
            needsConfirmation: f.needsConfirmation,
          }))
        );

        if (res.data.foods?.length > 0) {
          Alert.alert('✅ Success', `Detected ${res.data.foods.length} food item(s)!`);
        } else {
          Alert.alert('No Food Detected', 'Try a clearer photo of your meal.');
        }
      }
    } catch (error) {
      Alert.alert('Analysis Failed', error.message || 'Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // ─── Edit Food Items ─────────────────────────────────────────
  const handleFoodEdit = (index, field, value) => {
    setEditedFoods((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      if (field === 'grams' && scanResult?.foods?.[index]) {
        const original = scanResult.foods[index];
        const ratio = Number(value) / original.grams || 1;
        updated[index].calories = Math.round(original.calories * ratio);
        updated[index].protein = Math.round(original.protein * ratio * 10) / 10;
        updated[index].carbs = Math.round(original.carbs * ratio * 10) / 10;
        updated[index].fat = Math.round(original.fat * ratio * 10) / 10;
      }
      return updated;
    });
  };

  const handleRemoveFood = (index) => {
    setEditedFoods((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddFood = () => {
    setEditedFoods((prev) => [
      ...prev,
      { name: '', grams: 100, calories: 0, protein: 0, carbs: 0, fat: 0, confidence: 1.0, needsConfirmation: false },
    ]);
  };

  // ─── Calculate Totals ────────────────────────────────────────
  const totals = editedFoods.reduce(
    (acc, f) => ({
      calories: acc.calories + (Number(f.calories) || 0),
      protein: Math.round((acc.protein + (Number(f.protein) || 0)) * 10) / 10,
      carbs: Math.round((acc.carbs + (Number(f.carbs) || 0)) * 10) / 10,
      fat: Math.round((acc.fat + (Number(f.fat) || 0)) * 10) / 10,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // ─── Save Meal ───────────────────────────────────────────────
  const handleSaveMeal = async () => {
    if (editedFoods.length === 0) return Alert.alert('Error', 'No food items to save');
    const invalid = editedFoods.filter((f) => !f.name.trim());
    if (invalid.length > 0) return Alert.alert('Error', 'Please fill in all food names');

    try {
      setSaving(true);
      const res = await foodAPI.saveScanMeal({ foods: editedFoods, mealType });
      if (res.success) {
        Alert.alert('✅ Saved!', 'Meal has been logged successfully.');
        setSaved(true);
        fetchMealHistory(); // Refresh meal history
      }
    } catch (error) {
      Alert.alert('Save Failed', error.message || 'Please try again');
    } finally {
      setSaving(false);
    }
  };

  // ─── Reset ───────────────────────────────────────────────────
  const handleReset = () => {
    setImageUri(null);
    setImageBase64(null);
    setScanResult(null);
    setEditedFoods([]);
    setSaved(false);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {/* ── Header ── */}
      <LinearGradient colors={['#7C3AED', '#6D28D9']} style={s.header}>
        <View style={s.headerTop}>
          <View>
            <Text style={s.headerTitle}>AI Food Scanner</Text>
            <Text style={s.headerSub}>Snap a photo, get instant nutrition</Text>
          </View>
          <View style={s.headerIcon}>
            <ScanLine size={24} color={COLORS.white} />
          </View>
        </View>
      </LinearGradient>

      {/* ── Image Capture ── */}
      <View style={[s.card, SHADOWS.lg, { marginTop: -20 }]}>
        <Text style={s.cardTitle}>Capture or Upload</Text>

        {imageUri ? (
          <View style={s.previewWrap}>
            <Image
              source={{ uri: imageUri }}
              style={s.previewImage}
              resizeMode="cover"
            />
            <TouchableOpacity style={s.removePreview} onPress={handleReset}>
              <RotateCcw size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.placeholder}>
            <Camera size={40} color={COLORS.textMuted} />
            <Text style={s.placeholderText}>Take a photo or select from gallery</Text>
          </View>
        )}

        <View style={s.buttonRow}>
          <TouchableOpacity style={[s.captureBtn, s.cameraBtn]} onPress={() => pickImage(true)} activeOpacity={0.8}>
            <Camera size={18} color={COLORS.white} />
            <Text style={s.captureBtnText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.captureBtn, s.galleryBtn]} onPress={() => pickImage(false)} activeOpacity={0.8}>
            <ImagePlus size={18} color={COLORS.white} />
            <Text style={s.captureBtnText}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {imageUri && (
          <TouchableOpacity
            style={[s.analyzeBtn, analyzing && { opacity: 0.7 }]}
            onPress={handleAnalyze}
            disabled={analyzing}
            activeOpacity={0.8}
          >
            {analyzing ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <ScanLine size={18} color={COLORS.white} />
                <Text style={s.analyzeBtnText}>Scan Food</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Skeleton Loading */}
        {analyzing && (
          <View style={s.skeleton}>
            <View style={[s.skelBar, { width: '75%' }]} />
            <View style={[s.skelBar, { width: '50%' }]} />
            <View style={[s.skelBar, { width: '85%' }]} />
            <Text style={s.skelText}>AI is analyzing your food image...</Text>
          </View>
        )}
      </View>

      {/* ── Macro Summary ── */}
      {editedFoods.length > 0 && (
        <View style={s.macroRow}>
          <MacroCard icon={Flame} label="Calories" value={totals.calories} unit="kcal" color="#F97316" />
          <MacroCard icon={Dumbbell} label="Protein" value={totals.protein} unit="g" color="#3B82F6" />
          <MacroCard icon={Wheat} label="Carbs" value={totals.carbs} unit="g" color="#10B981" />
          <MacroCard icon={Droplets} label="Fat" value={totals.fat} unit="g" color="#F59E0B" />
        </View>
      )}

      {/* ── Low Confidence Warning ── */}
      {scanResult?.hasLowConfidence && (
        <View style={s.warningBanner}>
          <AlertTriangle size={16} color="#D97706" />
          <View style={s.warningText}>
            <Text style={s.warningTitle}>Low Confidence</Text>
            <Text style={s.warningDesc}>{scanResult.lowConfidenceCount} item(s) — please verify below</Text>
          </View>
        </View>
      )}

      {/* ── Detected Food List ── */}
      {editedFoods.length > 0 && (
        <View style={[s.card, SHADOWS.md]}>
          <View style={s.detectedHeader}>
            <Text style={s.cardTitle}>Detected Foods</Text>
            <TouchableOpacity style={s.addBtn} onPress={handleAddFood}>
              <PlusCircle size={14} color="#7C3AED" />
              <Text style={s.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          {editedFoods.map((food, idx) => (
            <View key={idx} style={[s.foodItem, food.needsConfirmation && s.foodItemWarning]}>
              <View style={s.foodRow}>
                <View style={s.foodNameWrap}>
                  <Text style={s.fieldLabel}>Food Name</Text>
                  <TextInput
                    style={s.input}
                    value={food.name}
                    onChangeText={(val) => handleFoodEdit(idx, 'name', val)}
                    placeholder="Food name"
                    placeholderTextColor={COLORS.placeholder}
                  />
                </View>
                <View style={s.foodGramsWrap}>
                  <Text style={s.fieldLabel}>Grams</Text>
                  <TextInput
                    style={[s.input, s.inputCenter]}
                    value={String(food.grams)}
                    onChangeText={(val) => handleFoodEdit(idx, 'grams', Number(val) || 0)}
                    keyboardType="numeric"
                    placeholder="g"
                    placeholderTextColor={COLORS.placeholder}
                  />
                </View>
              </View>

              <View style={s.macroChipRow}>
                <MacroChip label="Cal" value={food.calories} color="#F97316" />
                <MacroChip label="P" value={food.protein} color="#3B82F6" />
                <MacroChip label="C" value={food.carbs} color="#10B981" />
                <MacroChip label="F" value={food.fat} color="#F59E0B" />
                <View style={[s.confBadge, { backgroundColor: food.confidence >= 0.8 ? '#DCFCE7' : food.confidence >= 0.5 ? '#FEF3C7' : '#FEE2E2' }]}>
                  <Text style={[s.confText, { color: food.confidence >= 0.8 ? '#16A34A' : food.confidence >= 0.5 ? '#D97706' : '#DC2626' }]}>
                    {Math.round(food.confidence * 100)}%
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveFood(idx)} style={s.deleteBtn}>
                  <Trash2 size={14} color="#EF4444" />
                </TouchableOpacity>
              </View>

              {food.needsConfirmation && (
                <View style={s.lowConfRow}>
                  <AlertTriangle size={12} color="#D97706" />
                  <Text style={s.lowConfText}>Low confidence — please verify</Text>
                </View>
              )}
            </View>
          ))}

          {/* Meal Type Picker */}
          <View style={s.mealTypeSection}>
            <Text style={s.fieldLabel}>Meal Type</Text>
            <View style={s.mealTypeRow}>
              {MEAL_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[s.mealTypeBtn, mealType === type && s.mealTypeBtnActive]}
                  onPress={() => setMealType(type)}
                >
                  <Text style={[s.mealTypeText, mealType === type && s.mealTypeTextActive]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save / Success */}
          {!saved ? (
            <TouchableOpacity
              style={[s.saveBtn, (saving || editedFoods.length === 0) && { opacity: 0.6 }]}
              onPress={handleSaveMeal}
              disabled={saving || editedFoods.length === 0}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Save size={18} color={COLORS.white} />
                  <Text style={s.saveBtnText}>Save Meal</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View style={s.savedWrap}>
              <CheckCircle2 size={20} color="#10B981" />
              <Text style={s.savedText}>Meal saved!</Text>
              <TouchableOpacity style={s.scanAgainBtn} onPress={handleReset}>
                <Camera size={14} color="#7C3AED" />
                <Text style={s.scanAgainText}>Scan Another</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* ── Empty State ── */}
      {!scanResult && !analyzing && (
        <View style={s.emptyState}>
          <View style={s.emptyIcon}>
            <Camera size={32} color="#7C3AED" />
          </View>
          <Text style={s.emptyTitle}>Ready to Scan</Text>
          <Text style={s.emptyDesc}>
            Capture a meal photo or upload one from your gallery. Our AI will detect food items and estimate nutrition.
          </Text>
          <View style={s.stepsRow}>
            <StepBadge num="1" text="Photo" />
            <StepBadge num="2" text="AI Scan" />
            <StepBadge num="3" text="Save" />
          </View>
        </View>
      )}

      {/* ── Today's Nutrition Summary ── */}
      <View style={[s.card, SHADOWS.md, { marginTop: SPACING.lg }]}>
        <View style={s.summaryHeader}>
          <View style={s.summaryIconWrap}>
            <Flame size={18} color="#F97316" />
          </View>
          <View>
            <Text style={s.cardTitle}>Today's Nutrition</Text>
            <Text style={s.summarySubTitle}>Daily intake summary</Text>
          </View>
        </View>

        {/* Calorie Progress */}
        <View style={s.calProgressSection}>
          <View style={s.calProgressHeader}>
            <Text style={s.calProgressValue}>{dailySummary.totalCalories}</Text>
            <Text style={s.calProgressGoal}>/ 2000 kcal</Text>
          </View>
          <View style={s.calProgressBg}>
            <View style={[s.calProgressFill, { width: `${Math.min((dailySummary.totalCalories / 2000) * 100, 100)}%` }]} />
          </View>
        </View>

        {/* Macro Row */}
        <View style={s.dailyMacroRow}>
          <DailyStat label="Protein" value={dailySummary.totalProtein} unit="g" color="#3B82F6" />
          <DailyStat label="Carbs" value={dailySummary.totalCarbs} unit="g" color="#10B981" />
          <DailyStat label="Fat" value={dailySummary.totalFats} unit="g" color="#F59E0B" />
        </View>
      </View>

      {/* ── Recent Meals ── */}
      <View style={[s.card, SHADOWS.md, { marginTop: SPACING.lg }]}>
        <View style={s.summaryHeader}>
          <View style={[s.summaryIconWrap, { backgroundColor: '#EEF2FF' }]}>
            <History size={18} color="#6366F1" />
          </View>
          <Text style={s.cardTitle}>Recent Meals</Text>
          <View style={s.mealCountBadge}>
            <Text style={s.mealCountText}>{recentMeals.length}</Text>
          </View>
        </View>

        {loadingHistory ? (
          <View style={s.historyLoading}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={s.historyLoadingText}>Loading meals...</Text>
          </View>
        ) : recentMeals.length === 0 ? (
          <View style={s.historyEmpty}>
            <UtensilsCrossed size={28} color={COLORS.border} />
            <Text style={s.historyEmptyTitle}>No meals logged yet</Text>
            <Text style={s.historyEmptyDesc}>Scan a food photo above to get started</Text>
          </View>
        ) : (
          recentMeals.slice(0, 8).map((meal, idx) => (
            <MealCard key={meal._id || idx} meal={meal} />
          ))
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── Sub Components ───────────────────────────────────────────

function MacroCard({ icon: Icon, label, value, unit, color }) {
  return (
    <View style={[s.macroCard, SHADOWS.sm]}>
      <View style={[s.macroIconWrap, { backgroundColor: `${color}15` }]}>
        <Icon size={16} color={color} />
      </View>
      <Text style={s.macroLabel}>{label}</Text>
      <Text style={[s.macroValue, { color }]}>{value}<Text style={s.macroUnit}>{unit}</Text></Text>
    </View>
  );
}

function MacroChip({ label, value, color }) {
  return (
    <View style={[s.chipWrap, { backgroundColor: `${color}10` }]}>
      <Text style={[s.chipLabel, { color }]}>{label}</Text>
      <Text style={[s.chipValue, { color }]}>{value}</Text>
    </View>
  );
}

function StepBadge({ num, text }) {
  return (
    <View style={s.stepBadge}>
      <View style={s.stepNum}>
        <Text style={s.stepNumText}>{num}</Text>
      </View>
      <Text style={s.stepText}>{text}</Text>
    </View>
  );
}

function DailyStat({ label, value, unit, color }) {
  return (
    <View style={[s.dailyStatItem, { backgroundColor: `${color}10` }]}>
      <Text style={s.dailyStatLabel}>{label}</Text>
      <Text style={[s.dailyStatValue, { color }]}>
        {Math.round(value * 10) / 10}
        <Text style={s.dailyStatUnit}>{unit}</Text>
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const s = StyleSheet.create({
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
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '900', color: COLORS.white },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  headerIcon: {
    width: 48, height: 48, borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },

  // Card
  card: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.xl,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    marginTop: SPACING.lg,
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md },

  // Preview
  previewWrap: { 
    width: '100%', 
    aspectRatio: 1, 
    borderRadius: RADIUS.xl, 
    overflow: 'hidden', 
    marginBottom: SPACING.lg, 
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'
  },
  previewImage: { width: '100%', height: '100%' },
  removePreview: {
    position: 'absolute', top: 10, right: 10,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },

  placeholder: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: COLORS.border,
    borderRadius: RADIUS.xl, paddingVertical: 40,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.background, marginBottom: SPACING.md,
  },
  placeholderText: { fontSize: 13, color: COLORS.textMuted, marginTop: SPACING.sm },

  // Buttons
  buttonRow: { flexDirection: 'row', gap: 12, marginBottom: SPACING.md },
  captureBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: RADIUS.xl,
  },
  cameraBtn: { backgroundColor: '#7C3AED' },
  galleryBtn: { backgroundColor: '#6366F1' },
  captureBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },

  analyzeBtn: {
    backgroundColor: '#10B981', borderRadius: RADIUS.xl,
    paddingVertical: 16, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 8,
  },
  analyzeBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },

  // Skeleton
  skeleton: { marginTop: SPACING.lg },
  skelBar: {
    height: 12, backgroundColor: COLORS.border, borderRadius: 6,
    marginBottom: 10,
  },
  skelText: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginTop: 8, fontStyle: 'italic' },

  // Macro summary
  macroRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg, marginTop: SPACING.lg, gap: 10,
  },
  macroCard: {
    flex: 1, minWidth: '45%',
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl,
    padding: 14, alignItems: 'center',
  },
  macroIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  macroLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted },
  macroValue: { fontSize: 20, fontWeight: '900', marginTop: 2 },
  macroUnit: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted },

  // Warning
  warningBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FEF3C7', borderRadius: RADIUS.xl,
    padding: SPACING.lg, marginHorizontal: SPACING.xl, marginTop: SPACING.lg,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  warningText: { flex: 1 },
  warningTitle: { fontSize: 13, fontWeight: '800', color: '#92400E' },
  warningDesc: { fontSize: 11, color: '#B45309', marginTop: 2 },

  // Detected foods
  detectedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F5F3FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.md },
  addBtnText: { fontSize: 12, fontWeight: '700', color: '#7C3AED' },

  foodItem: {
    borderWidth: 1, borderColor: COLORS.borderLight,
    borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.sm, backgroundColor: COLORS.background,
  },
  foodItemWarning: { borderColor: '#FDE68A', backgroundColor: '#FFFBEB' },
  foodRow: { flexDirection: 'row', gap: 10 },
  foodNameWrap: { flex: 1 },
  foodGramsWrap: { width: 80 },
  fieldLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 14, fontWeight: '600', color: COLORS.text,
  },
  inputCenter: { textAlign: 'center' },

  macroChipRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  chipWrap: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignItems: 'center' },
  chipLabel: { fontSize: 9, fontWeight: '700' },
  chipValue: { fontSize: 13, fontWeight: '800' },

  confBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  confText: { fontSize: 11, fontWeight: '800' },
  deleteBtn: { marginLeft: 'auto', padding: 6 },

  lowConfRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  lowConfText: { fontSize: 11, color: '#D97706', fontWeight: '600' },

  // Meal type
  mealTypeSection: { marginTop: SPACING.lg, paddingTop: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  mealTypeRow: { flexDirection: 'row', gap: 8 },
  mealTypeBtn: {
    flex: 1, paddingVertical: 10, borderRadius: RADIUS.lg,
    alignItems: 'center', backgroundColor: COLORS.background,
    borderWidth: 1, borderColor: COLORS.border,
  },
  mealTypeBtnActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  mealTypeText: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  mealTypeTextActive: { color: COLORS.white },

  // Save
  saveBtn: {
    backgroundColor: '#10B981', borderRadius: RADIUS.xl,
    paddingVertical: 16, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 8, marginTop: SPACING.lg,
  },
  saveBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },

  savedWrap: { alignItems: 'center', marginTop: SPACING.lg, gap: 8 },
  savedText: { fontSize: 16, fontWeight: '800', color: '#10B981' },
  scanAgainBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F5F3FF', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: RADIUS.lg, marginTop: 4,
  },
  scanAgainText: { fontSize: 13, fontWeight: '700', color: '#7C3AED' },

  // Empty state
  emptyState: {
    alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24,
    marginHorizontal: SPACING.xl, marginTop: SPACING.xxl,
    backgroundColor: COLORS.card, borderRadius: RADIUS.xxl,
  },
  emptyIcon: {
    width: 64, height: 64, borderRadius: RADIUS.xl,
    backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  emptyDesc: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  stepsRow: { flexDirection: 'row', gap: 12, marginTop: SPACING.xl },
  stepBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F5F3FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.lg,
  },
  stepNum: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center',
  },
  stepNumText: { fontSize: 11, fontWeight: '900', color: COLORS.white },
  stepText: { fontSize: 12, fontWeight: '700', color: '#7C3AED' },

  // Daily Summary
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: SPACING.md },
  summaryIconWrap: {
    width: 36, height: 36, borderRadius: RADIUS.md,
    backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center',
  },
  summarySubTitle: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  calProgressSection: { marginBottom: SPACING.lg },
  calProgressHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 },
  calProgressValue: { fontSize: 30, fontWeight: '900', color: '#F97316' },
  calProgressGoal: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  calProgressBg: { height: 10, backgroundColor: COLORS.background, borderRadius: 5, overflow: 'hidden' },
  calProgressFill: { height: '100%', backgroundColor: '#F97316', borderRadius: 5 },
  dailyMacroRow: { flexDirection: 'row', gap: 10 },
  dailyStatItem: { flex: 1, borderRadius: RADIUS.lg, padding: 12, alignItems: 'center' },
  dailyStatLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase' },
  dailyStatValue: { fontSize: 18, fontWeight: '900', marginTop: 4 },
  dailyStatUnit: { fontSize: 10, fontWeight: '600', color: COLORS.textMuted },

  // Meal history
  mealCountBadge: {
    backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 12, marginLeft: 'auto',
  },
  mealCountText: { fontSize: 12, fontWeight: '800', color: '#6366F1' },
  historyLoading: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  historyLoadingText: { fontSize: 12, color: COLORS.textMuted },
  historyEmpty: { alignItems: 'center', paddingVertical: 30, gap: 6 },
  historyEmptyTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted },
  historyEmptyDesc: { fontSize: 11, color: COLORS.textMuted },
});
