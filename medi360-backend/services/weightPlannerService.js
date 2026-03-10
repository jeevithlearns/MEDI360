/**
 * Weight Goal Planner Service
 * Calculates BMR, TDEE, and weight progress
 */

exports.calculateMetrics = (healthProfile, weightGoal) => {
  if (!healthProfile || !weightGoal) return null;

  const age = healthProfile.age || 25;
  const gender = healthProfile.gender || 'male';
  const activityLevel = healthProfile.lifestyle?.exerciseFrequency || 'moderate';
  
  const currentWeight = weightGoal.currentWeight;
  const height = healthProfile.measurements?.height;
  
  if (!currentWeight || !height) return null;

  // 1. Calculate BMR (Mifflin-St Jeor)
  let bmr;
  if (gender === 'male') {
    bmr = 10 * currentWeight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * currentWeight + 6.25 * height - 5 * age - 161;
  }

  // 2. Activity Multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    'very active': 1.9,
    high: 1.725,
    'very high': 1.9
  };
  
  // 3. Calculate TDEE
  const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

  // 4. Determine Target Calorie Intake based on timeline and goal
  const targetWeight = weightGoal.targetWeight;
  let dailyCalorieTarget = tdee;
  let expectedPoundsPerWeek = 0;

  if (targetWeight < currentWeight) {
    // Weight loss
    dailyCalorieTarget = tdee - 500; // Safe standard deficit
    expectedPoundsPerWeek = 1; // 500 kcal deficit * 7 = 3500 kcal = ~1 lb
  } else if (targetWeight > currentWeight) {
    // Weight gain
    dailyCalorieTarget = tdee + 500;
    expectedPoundsPerWeek = 1;
  }

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    dailyCalorieTarget: Math.round(dailyCalorieTarget),
    expectedPoundsPerWeek,
    expectedKgPerWeek: Number((expectedPoundsPerWeek * 0.453592).toFixed(2))
  };
};
