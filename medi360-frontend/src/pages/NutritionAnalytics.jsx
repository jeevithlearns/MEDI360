import React, { useState, useEffect } from 'react';
import { foodAPI, exerciseAPI, weightGoalAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FaChartBar, FaSpinner } from 'react-icons/fa';
import { format } from 'date-fns';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

function NutritionAnalytics() {
  const [foodSummary, setFoodSummary] = useState(null);
  const [exerciseSummary, setExerciseSummary] = useState(null);
  const [weightGoal, setWeightGoal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const [fRes, eRes, wRes] = await Promise.all([
        foodAPI.getWeeklySummary(today), // Assuming it goes back or gives weekly
        exerciseAPI.getWeeklyActivitySummary(today),
        weightGoalAPI.get().catch(err => ({ success: false })) // Catch if 404
      ]);

      if (fRes.success) setFoodSummary(fRes.data.summary);
      if (eRes.success) setExerciseSummary(eRes.data.summary);
      if (wRes.success) setWeightGoal(wRes.data);
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><FaSpinner className="animate-spin text-4xl text-primary-600" /></div>;
  }

  // Compile Calorie Balance Data (Consumed vs Burned vs Target)
  // Normally we would rely on daily historical data overlapping. For layout, we will build a combo chart for the week.
  const chartData = [];
  if (foodSummary && exerciseSummary) {
    // Merge by date
    foodSummary.dailyData.forEach(f => {
      const e = exerciseSummary.dailyData.find(ex => ex.date === f.date);
      chartData.push({
        date: format(new Date(f.date), 'MMM d'),
        consumed: f.calories || 0,
        burned: e ? e.caloriesBurned : 0,
        target: weightGoal ? weightGoal.dailyCaloriesTarget : 2000
      });
    });
  }

  // Macro Chart Data
  const macroData = foodSummary ? [
    { name: 'Protein', value: foodSummary.weeklyTotals.protein },
    { name: 'Carbs', value: foodSummary.weeklyTotals.carbs },
    { name: 'Fats', value: foodSummary.weeklyTotals.fats },
  ] : [];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <h1 className="text-3xl font-bold mb-2 flex items-center">
        <FaChartBar className="mr-3 text-indigo-500" />
        Nutrition Analytics
      </h1>
      <p className="text-gray-600 mb-8">Comprehensive dashboard tracking calorie balance and macros.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Calorie Balance Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Calorie Balance (Consumed vs Burned)</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="consumed" name="Consumed (kcal)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="burned" name="Burned (kcal)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                {weightGoal && <Line type="dashed" dataKey="target" name="Daily Target" stroke="#8b5cf6" strokeWidth={2} dot={false} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Macro Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Weekly Macro Distribution</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
    </div>
  );
}

export default NutritionAnalytics;
