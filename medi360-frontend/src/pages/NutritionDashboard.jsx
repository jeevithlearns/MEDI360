/**
 * Nutrition Dashboard
 * Visual representation of nutrition data
 */

import React, { useState, useEffect } from 'react';
import { foodAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  FaUtensils, 
  FaChartPie, 
  FaCalendarAlt, 
  FaSpinner, 
  FaArrowLeft, 
  FaArrowRight,
  FaLightbulb
} from 'react-icons/fa';
import { format, addDays, subDays } from 'date-fns';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

function NutritionDashboard() {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      const [summaryRes, insightsRes] = await Promise.all([
        foodAPI.getDailyNutritionSummary(dateStr),
        foodAPI.getNutritionInsights()
      ]);

      if (summaryRes.success) setSummary(summaryRes.data.summary);
      if (insightsRes.success) setInsights(insightsRes.data.insights);
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
      toast.error('Failed to load nutrition data');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  const macroData = summary ? [
    { name: 'Protein', value: summary.totalProtein },
    { name: 'Carbs', value: summary.totalCarbs },
    { name: 'Fats', value: summary.totalFats },
  ] : [];

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center h-96">
        <FaSpinner className="animate-spin text-4xl text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nutrition Dashboard</h1>
          <p className="text-gray-600">Analyze your dietary patterns and health goals</p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          <button 
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <FaArrowLeft className="text-gray-400" />
          </button>
          <div className="px-4 py-1 flex items-center gap-2 font-bold text-gray-700 min-w-40 justify-center">
            <FaCalendarAlt className="text-primary-500" />
            {format(selectedDate, 'MMM d, yyyy')}
          </div>
          <button 
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
            disabled={format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')}
          >
            <FaArrowRight className={format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? "text-gray-100" : "text-gray-400"} />
          </button>
        </div>
      </div>

      {summary && summary.mealCount > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Summary Cards */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card text-center border-b-4 border-primary-500">
              <div className="text-xs font-bold text-gray-400 uppercase mb-1">Calories</div>
              <div className="text-2xl font-black text-gray-800">{summary.totalCalories}</div>
              <div className="text-[10px] text-gray-500">kcal total</div>
            </div>
            <div className="card text-center border-b-4 border-green-500">
              <div className="text-xs font-bold text-gray-400 uppercase mb-1">Protein</div>
              <div className="text-2xl font-black text-gray-800">{summary.totalProtein}</div>
              <div className="text-[10px] text-gray-500">grams</div>
            </div>
            <div className="card text-center border-b-4 border-blue-500">
              <div className="text-xs font-bold text-gray-400 uppercase mb-1">Carbs</div>
              <div className="text-2xl font-black text-gray-800">{summary.totalCarbs}</div>
              <div className="text-[10px] text-gray-500">grams</div>
            </div>
            <div className="card text-center border-b-4 border-yellow-500">
              <div className="text-xs font-bold text-gray-400 uppercase mb-1">Fats</div>
              <div className="text-2xl font-black text-gray-800">{summary.totalFats}</div>
              <div className="text-[10px] text-gray-500">grams</div>
            </div>

            {/* Macro Chart */}
            <div className="col-span-full card">
              <h3 className="card-header flex items-center font-bold">
                <FaChartPie className="mr-2 text-primary-600" />
                Macro Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
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

          {/* Recommendations Sidebar */}
          <div className="space-y-6">
            <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white border-none shadow-xl">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <FaLightbulb className="mr-2 text-yellow-300" />
                AI Nutrition Insights
              </h3>
              {insights && insights.recommendations ? (
                <div className="space-y-4">
                  <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/20">
                    <p className="text-sm italic font-medium">"{insights.recommendations.dailyCalories} kcal target based on your profile."</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Protein Goal</span>
                      <span>{summary.totalProtein} / {insights.recommendations.protein}g</span>
                    </div>
                    <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-green-400 h-full transition-all duration-500" 
                        style={{ width: `${Math.min((summary.totalProtein / insights.recommendations.protein) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm opacity-80">Log more meals to get personalized AI recommendations.</p>
              )}
            </div>

            <div className="card">
              <h3 className="card-header text-sm font-bold flex items-center">
                <FaUtensils className="mr-2 text-primary-500" />
                Meal Frequency
              </h3>
              <div className="space-y-3">
                {summary.mealsByType && Object.entries(summary.mealsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors uppercase text-[10px] font-bold tracking-widest text-gray-500">
                    <span>{type}</span>
                    <span className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded-md min-w-[24px] text-center">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center py-24 bg-white/50 backdrop-blur-sm border-2 border-dashed border-gray-200">
          <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaUtensils className="text-4xl text-gray-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Data for this Date</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            You haven't logged any meals for {format(selectedDate, 'MMMM do')}. Start tracking to see your stats!
          </p>
          <a href="/food-tracking" className="btn btn-primary px-8 py-3 rounded-full shadow-lg shadow-primary-200 inline-flex items-center gap-2">
            <FaPlus /> Log a Meal
          </a>
        </div>
      )}
    </div>
  );
}

export default NutritionDashboard;
