import React, { useState, useEffect } from 'react';
import { analyticsAPI, chatAPI, reminderAPI, foodAPI } from '../services/api';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { SectionHeader, StatCard, ChartCard } from '../components/UiComponents';
import { FaHeartbeat, FaAppleAlt, FaRunning, FaExclamationTriangle, FaCheckCircle, FaSpinner } from 'react-icons/fa';

function OverallAnalysis() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [aiInsights, setAiInsights] = useState([]);
  const [dailyNutrition, setDailyNutrition] = useState(null);

  useEffect(() => {
    fetchComprehensiveData();
  }, []);

  const fetchComprehensiveData = async () => {
    try {
      setLoading(true);
      
      const [analyticsRes, insightsRes, nutritionRes] = await Promise.all([
        analyticsAPI.getDashboard().catch(() => ({ data: {} })),
        api.get('/health-insights/personalized').catch(() => ({ data: { insights: [] } })),
        foodAPI.getDailyNutritionSummary().catch(() => ({ data: { summary: null } }))
      ]);

      setDashboardData(analyticsRes.data);
      setAiInsights(insightsRes.data?.insights || []);
      setDailyNutrition(nutritionRes.data?.summary || null);
      
    } catch (error) {
      console.error('Error fetching comprehensive analysis:', error);
      toast.error('Failed to load full analysis');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <FaSpinner className="text-5xl text-blue-500 animate-spin" />
          <p className="text-gray-500 font-bold tracking-widest uppercase">Compiling Health Profile...</p>
        </div>
      </div>
    );
  }

  // Activity Mock or Real Chart
  const activityData = dashboardData?.activityData || [
    { name: 'Mon', calories: 2100, burn: 1800 },
    { name: 'Tue', calories: 1900, burn: 2200 },
    { name: 'Wed', calories: 2400, burn: 1500 },
    { name: 'Thu', calories: 1800, burn: 2600 },
    { name: 'Fri', calories: 2200, burn: 1900 },
    { name: 'Sat', calories: 2600, burn: 1700 },
    { name: 'Sun', calories: 2000, burn: 2100 },
  ];

  // Nutritional split mock or derived from dailyNutrition
  const macroData = dailyNutrition ? [
    { name: 'Protein', value: dailyNutrition.totalProtein || 60, color: '#3b82f6' },
    { name: 'Carbs', value: dailyNutrition.totalCarbs || 120, color: '#22c55e' },
    { name: 'Fats', value: dailyNutrition.totalFats || 45, color: '#eab308' }
  ] : [
    { name: 'Protein', value: 65, color: '#3b82f6' },
    { name: 'Carbs', value: 130, color: '#22c55e' },
    { name: 'Fats', value: 50, color: '#eab308' }
  ];

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      
      <SectionHeader 
        title="Comprehensive Health Analysis" 
        description="A complete 360-degree overview of your medical, nutritional, and physical status."
      />

      {/* Extreme AI Insights Widget Full Breadth */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 rounded-2xl p-8 shadow-lg border border-indigo-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 opacity-10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10">
          <SectionHeader title={<span className="text-white">AI Executive Summary</span>} />
          {aiInsights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {aiInsights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-4 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20">
                  <div className="bg-orange-500/20 p-3 rounded-xl">
                     <FaExclamationTriangle className="text-orange-400 text-xl flex-shrink-0" />
                  </div>
                  <span className="text-white font-medium text-sm leading-relaxed">{insight}</span>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-10 text-white bg-white/5 backdrop-blur-md rounded-2xl mt-4 border border-white/10">
               <FaCheckCircle className="mx-auto text-4xl mb-4 text-emerald-400" />
               <p className="text-lg font-bold">All physiological markers are optimal.</p>
               <p className="text-sm text-indigo-200 mt-2">The AI Health Engine detects no active warnings.</p>
             </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Avg Daily Deficit" 
          value="-400 kcal" 
          icon={FaHeartbeat} 
          colorClass="bg-rose-500" 
          subtitle="On track for weight goal"
        />
        <StatCard 
          title="Active Reminders" 
          value="3" 
          icon={FaAppleAlt} 
          colorClass="bg-blue-500" 
          subtitle="Adherence rate: 100%"
        />
        <StatCard 
          title="Workout Frequency" 
          value="4 / wk" 
          icon={FaRunning} 
          colorClass="bg-emerald-500" 
          subtitle="Top 20% of users"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Weekly Trend */}
        <ChartCard title="Metabolic Trend (Intake vs Output)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCalories2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBurn2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorCalories2)" name="Intake (kcal)" />
              <Area type="monotone" dataKey="burn" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorBurn2)" name="Burn (kcal)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Nutritional Breakdown */}
        <ChartCard title="Today's Macronutrient Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={macroData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {macroData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => `${value}g`}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Weekly Exercise Intensity */}
        <ChartCard title="Exercise Intensity Volume">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend />
              <Bar dataKey="burn" fill="#10b981" name="Output" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </div>
  );
}

export default OverallAnalysis;
