/**
 * Exercise Calculator Service
 * Calculates calories burned using MET formula:
 * Calories burned = MET * weight (kg) * duration (hours)
 */

exports.calculateCaloriesBurned = (exerciseType, durationMinutes, weightKg = 70) => {
  // MET Database
  const metValues = {
    running: 9.8,
    cycling: 7.5,
    'strength training': 5.0,
    strength: 5.0,
    walking: 3.8,
    swimming: 8.0,
    yoga: 3.0,
    cardio: 7.0,
    flexibility: 2.5,
    sports: 7.0,
    weightlifting: 5.0,
    hiit: 8.5,
    dance: 6.0,
    other: 5.0
  };

  const met = metValues[exerciseType.toLowerCase()] || 5.0;
  const durationHours = durationMinutes / 60;
  const caloriesBurned = met * weightKg * durationHours;

  return Math.round(caloriesBurned);
};
