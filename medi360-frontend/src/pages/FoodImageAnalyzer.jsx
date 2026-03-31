/**
 * Food Image Analyzer Page
 * AI-powered food scanner: Upload/capture → Detect food → Edit → Save meal
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { foodAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  FaCamera,
  FaUpload,
  FaSpinner,
  FaSave,
  FaRedo,
  FaExclamationTriangle,
  FaTrash,
  FaPlus,
  FaCheckCircle,
  FaFire,
  FaDumbbell,
  FaUtensils,
  FaLeaf,
  FaEdit,
  FaEye,
  FaClock,
  FaHistory,
} from 'react-icons/fa';
import { SectionHeader } from '../components/UiComponents';

// Compress image before upload to reduce latency
function compressImage(file, maxWidth = 1024, quality = 0.8) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => resolve(blob),
          file.type || 'image/jpeg',
          quality
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function FoodImageAnalyzer() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [editedFoods, setEditedFoods] = useState([]);
  const [mealType, setMealType] = useState('snack');
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  // Meal history state
  const [recentMeals, setRecentMeals] = useState([]);
  const [dailySummary, setDailySummary] = useState({ totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 });
  const [loadingHistory, setLoadingHistory] = useState(false);

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
        const s = summaryRes.data?.summary || summaryRes.data || {};
        setDailySummary({
          totalCalories: s.totalCalories || 0,
          totalProtein: s.totalProtein || 0,
          totalCarbs: s.totalCarbs || 0,
          totalFats: s.totalFats || 0,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => { fetchMealHistory(); }, [fetchMealHistory]);

  const handleImageSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error('Image too large. Max 15MB.');
      return;
    }

    setImageFile(file);
    setResult(null);
    setEditedFoods([]);
    setSaved(false);

    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  }, []);

  const handleAnalyze = async () => {
    if (!imageFile) {
      toast.error('Please select an image first');
      return;
    }

    try {
      setAnalyzing(true);
      setResult(null);
      setEditedFoods([]);
      setSaved(false);

      // Compress image before sending
      const compressedBlob = await compressImage(imageFile);
      const formData = new FormData();
      formData.append('image', compressedBlob, imageFile.name || 'food.jpg');

      const res = await foodAPI.analyzeImage(formData);

      if (res.success) {
        setResult(res.data);
        setEditedFoods(
          res.data.foods.map((f) => ({
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

        if (res.data.foods.length > 0) {
          toast.success(`Detected ${res.data.foods.length} food item(s)!`);
        } else {
          toast('No food detected. Try a clearer photo.', { icon: '🤔' });
        }
      }
    } catch (error) {
      toast.error(error.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFoodEdit = (index, field, value) => {
    setEditedFoods((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Recalculate per-item macros if grams changed
      if (field === 'grams' && result?.foods?.[index]) {
        const original = result.foods[index];
        const ratio = Number(value) / original.grams || 1;
        updated[index].calories = Math.round(original.calories * ratio);
        updated[index].protein =
          Math.round(original.protein * ratio * 10) / 10;
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
      {
        name: '',
        grams: 100,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        confidence: 1.0,
        needsConfirmation: false,
      },
    ]);
  };

  const totals = editedFoods.reduce(
    (acc, f) => ({
      calories: acc.calories + (Number(f.calories) || 0),
      protein: Math.round((acc.protein + (Number(f.protein) || 0)) * 10) / 10,
      carbs: Math.round((acc.carbs + (Number(f.carbs) || 0)) * 10) / 10,
      fat: Math.round((acc.fat + (Number(f.fat) || 0)) * 10) / 10,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const handleSaveMeal = async () => {
    if (editedFoods.length === 0) {
      toast.error('No food items to save');
      return;
    }
    const invalidItems = editedFoods.filter((f) => !f.name.trim());
    if (invalidItems.length > 0) {
      toast.error('Please fill in all food names');
      return;
    }

    try {
      setSaving(true);
      const res = await foodAPI.saveScanMeal({
        foods: editedFoods,
        mealType,
      });
      if (res.success) {
        toast.success('Meal saved successfully! 🎉');
        setSaved(true);
        fetchMealHistory(); // Refresh meal history
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save meal');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setEditedFoods([]);
    setSaved(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <SectionHeader
        title="AI Food Scanner"
        description="Upload a photo of your meal and our AI will automatically detect food items, estimate portions, and calculate nutrition."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ─── Left Column: Image Upload ─── */}
        <div className="lg:col-span-1 space-y-6">
          {/* Upload Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-violet-100 p-3 rounded-xl text-violet-500">
                <FaCamera className="text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Upload Food Photo
              </h3>
            </div>

            {/* Drop Zone / Preview */}
            <div
              className={`relative border-2 border-dashed rounded-2xl overflow-hidden transition-all ${
                imagePreview
                  ? 'border-violet-300 bg-violet-50/30'
                  : 'border-gray-200 bg-gray-50 hover:border-violet-300 hover:bg-violet-50/20'
              }`}
              onClick={() => !analyzing && fileInputRef.current?.click()}
              style={{ cursor: analyzing ? 'default' : 'pointer' }}
            >
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Food preview"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700">
                    <FaEye className="text-violet-500" /> Preview
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <FaUpload className="text-4xl mb-3" />
                  <p className="text-sm font-bold text-gray-600">
                    Click to upload image
                  </p>
                  <p className="text-xs mt-1 text-gray-400">
                    JPG, PNG (max 15MB)
                  </p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAnalyze}
                disabled={!imageFile || analyzing}
                className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-violet-600/20 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {analyzing ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FaCamera />
                    Scan Food
                  </>
                )}
              </button>

              {imagePreview && (
                <button
                  onClick={handleReset}
                  className="px-4 py-3.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all font-bold"
                  title="Reset"
                >
                  <FaRedo />
                </button>
              )}
            </div>

            {/* Analyzing Skeleton */}
            {analyzing && (
              <div className="mt-6 space-y-3">
                <div className="h-4 bg-gray-200 rounded-full animate-pulse w-3/4" />
                <div className="h-4 bg-gray-200 rounded-full animate-pulse w-1/2" />
                <div className="h-4 bg-gray-200 rounded-full animate-pulse w-5/6" />
                <p className="text-xs text-gray-400 italic mt-3 text-center">
                  AI is analyzing your food image...
                </p>
              </div>
            )}
          </div>

          {/* Meal Type Selector */}
          {editedFoods.length > 0 && !saved && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Meal Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setMealType(type)}
                    className={`py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
                      mealType === type
                        ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                        : 'bg-gray-100 text-gray-600 hover:bg-violet-50 hover:text-violet-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── Right Column: Results ─── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Nutrition Summary */}
          {editedFoods.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MacroCard
                label="Calories"
                value={totals.calories}
                unit="kcal"
                icon={FaFire}
                color="bg-gradient-to-br from-orange-500 to-red-500"
                textColor="text-orange-600"
              />
              <MacroCard
                label="Protein"
                value={totals.protein}
                unit="g"
                icon={FaDumbbell}
                color="bg-gradient-to-br from-blue-500 to-indigo-500"
                textColor="text-blue-600"
              />
              <MacroCard
                label="Carbs"
                value={totals.carbs}
                unit="g"
                icon={FaUtensils}
                color="bg-gradient-to-br from-emerald-500 to-green-500"
                textColor="text-emerald-600"
              />
              <MacroCard
                label="Fat"
                value={totals.fat}
                unit="g"
                icon={FaLeaf}
                color="bg-gradient-to-br from-amber-500 to-yellow-500"
                textColor="text-amber-600"
              />
            </div>
          )}

          {/* Low Confidence Warning */}
          {result?.hasLowConfidence && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <div className="bg-amber-100 p-2 rounded-lg shrink-0 mt-0.5">
                <FaExclamationTriangle className="text-amber-600 text-sm" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800">
                  Low Confidence Detection
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  {result.lowConfidenceCount} item(s) detected with low
                  confidence. Please verify the highlighted items below and
                  adjust if needed.
                </p>
              </div>
            </div>
          )}

          {/* Detected Foods Table */}
          {editedFoods.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-violet-100 p-2 rounded-lg text-violet-500">
                    <FaEdit className="text-sm" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Detected Foods
                  </h3>
                  <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    {editedFoods.length} items
                  </span>
                </div>
                <button
                  onClick={handleAddFood}
                  className="flex items-center gap-2 text-sm font-bold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-3.5 py-2 rounded-xl transition-all"
                >
                  <FaPlus className="text-xs" /> Add Item
                </button>
              </div>

              <div className="divide-y divide-gray-50">
                {editedFoods.map((food, idx) => (
                  <div
                    key={idx}
                    className={`px-6 py-4 transition-all ${
                      food.needsConfirmation
                        ? 'bg-amber-50/50 border-l-4 border-l-amber-400'
                        : 'hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Food Name */}
                      <div className="flex-1 min-w-[180px]">
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">
                          Food Name
                        </label>
                        <input
                          type="text"
                          value={food.name}
                          onChange={(e) =>
                            handleFoodEdit(idx, 'name', e.target.value)
                          }
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white capitalize"
                        />
                      </div>

                      {/* Grams */}
                      <div className="w-24">
                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">
                          Grams
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={food.grams}
                          onChange={(e) =>
                            handleFoodEdit(
                              idx,
                              'grams',
                              Number(e.target.value)
                            )
                          }
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white text-center"
                        />
                      </div>

                      {/* Macros (Read Only) */}
                      <div className="flex gap-3 text-center">
                        <MacroChip
                          label="Cal"
                          value={food.calories}
                          color="text-orange-600 bg-orange-50"
                        />
                        <MacroChip
                          label="P"
                          value={food.protein}
                          color="text-blue-600 bg-blue-50"
                        />
                        <MacroChip
                          label="C"
                          value={food.carbs}
                          color="text-emerald-600 bg-emerald-50"
                        />
                        <MacroChip
                          label="F"
                          value={food.fat}
                          color="text-amber-600 bg-amber-50"
                        />
                      </div>

                      {/* Confidence Badge */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${
                            food.confidence >= 0.8
                              ? 'bg-green-100 text-green-700'
                              : food.confidence >= 0.5
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {Math.round(food.confidence * 100)}%
                        </span>
                        <button
                          onClick={() => handleRemoveFood(idx)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Remove"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </div>

                    {food.needsConfirmation && (
                      <p className="text-xs text-amber-600 mt-2 flex items-center gap-1.5">
                        <FaExclamationTriangle className="text-amber-500" />
                        Low confidence — please verify this item
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Save Button */}
              {!saved ? (
                <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100">
                  <button
                    onClick={handleSaveMeal}
                    disabled={saving || editedFoods.length === 0}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:shadow-none flex items-center justify-center gap-2 text-base"
                  >
                    {saving ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Save Meal
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="px-6 py-5 bg-emerald-50 border-t border-emerald-100">
                  <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold">
                    <FaCheckCircle className="text-lg" />
                    <span>Meal saved successfully!</span>
                  </div>
                  <button
                    onClick={handleReset}
                    className="w-full mt-3 bg-white border border-emerald-200 text-emerald-700 font-bold py-3 rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                  >
                    <FaCamera /> Scan Another Meal
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!result && !analyzing && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
              <div className="bg-violet-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <FaCamera className="text-3xl text-violet-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Ready to Scan
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Take a photo of your meal or upload an existing image. Our AI
                will identify foods and calculate nutrition instantly.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <StepBadge step="1" text="Upload Photo" />
                <StepBadge step="2" text="AI Detects Food" />
                <StepBadge step="3" text="Edit & Save" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Daily Nutrition Summary ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-orange-100 p-2.5 rounded-xl text-orange-500">
            <FaFire className="text-lg" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Today's Nutrition</h3>
            <p className="text-xs text-gray-400">Daily intake summary</p>
          </div>
        </div>

        {/* Calorie Progress */}
        <div className="mb-5">
          <div className="flex justify-between items-end mb-2">
            <span className="text-3xl font-black text-orange-600">{dailySummary.totalCalories}</span>
            <span className="text-sm text-gray-400 font-bold">/ 2000 kcal</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-400 to-orange-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min((dailySummary.totalCalories / 2000) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Macro Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <DailyStat label="Protein" value={dailySummary.totalProtein} unit="g" color="text-blue-600" bg="bg-blue-50" />
          <DailyStat label="Carbs" value={dailySummary.totalCarbs} unit="g" color="text-emerald-600" bg="bg-emerald-50" />
          <DailyStat label="Fat" value={dailySummary.totalFats} unit="g" color="text-amber-600" bg="bg-amber-50" />
        </div>
      </div>

      {/* ─── Recent Meals ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg text-indigo-500">
            <FaHistory className="text-sm" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Recent Meals</h3>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
            {recentMeals.length}
          </span>
        </div>

        {loadingHistory ? (
          <div className="p-8 text-center text-gray-400">
            <FaSpinner className="animate-spin inline text-xl mb-2" />
            <p className="text-sm">Loading meals...</p>
          </div>
        ) : recentMeals.length === 0 ? (
          <div className="p-10 text-center">
            <FaUtensils className="text-3xl text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400 font-bold">No meals logged yet</p>
            <p className="text-xs text-gray-300 mt-1">Scan a food photo above to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentMeals.slice(0, 10).map((meal, idx) => (
              <div key={meal._id || idx} className="px-6 py-4 hover:bg-gray-50/50 transition-all flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2.5 rounded-xl">
                    <FaFire className="text-orange-500 text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 capitalize">{meal.foodQuery || 'Meal'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <FaClock className="text-[10px]" />
                        {new Date(meal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="bg-violet-100 text-violet-600 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                        {meal.mealType || 'snack'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-orange-600">{meal.nutrition?.calories || 0}</p>
                  <p className="text-[10px] text-gray-400 font-bold">kcal</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub Components ──────────────────────────────────────────────────

function MacroCard({ label, value, unit, icon: Icon, color, textColor }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
      <div
        className={`absolute top-0 right-0 w-12 h-12 ${color} opacity-10 rounded-bl-3xl`}
      />
      <div
        className={`${color} w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-md`}
      >
        <Icon className="text-white text-sm" />
      </div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p className={`text-2xl font-black mt-0.5 ${textColor}`}>
        {value}
        <span className="text-sm font-bold text-gray-400 ml-1">{unit}</span>
      </p>
    </div>
  );
}

function MacroChip({ label, value, color }) {
  return (
    <div className={`${color} px-2.5 py-1.5 rounded-lg`}>
      <p className="text-[10px] font-bold opacity-70">{label}</p>
      <p className="text-sm font-black">{value}</p>
    </div>
  );
}

function StepBadge({ step, text }) {
  return (
    <div className="flex items-center gap-2 bg-violet-50 text-violet-700 px-4 py-2 rounded-xl">
      <span className="bg-violet-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">
        {step}
      </span>
      <span className="text-sm font-bold">{text}</span>
    </div>
  );
}

function DailyStat({ label, value, unit, color, bg }) {
  return (
    <div className={`${bg} rounded-xl p-4 text-center`}>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-black mt-1 ${color}`}>
        {Math.round(value * 10) / 10}
        <span className="text-xs font-bold text-gray-400 ml-0.5">{unit}</span>
      </p>
    </div>
  );
}
