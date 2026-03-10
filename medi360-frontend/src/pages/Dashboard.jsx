import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, chatAPI, reminderAPI, healthInsightsAPI } from '../services/api';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  FaUser, FaComments, FaChartLine, FaExclamationTriangle,
  FaCheckCircle, FaSpinner, FaUtensils, FaRunning, FaHeartbeat,
  FaFire, FaWalking, FaCalendarDay, FaWeight
} from 'react-icons/fa';
import { StatCard, SectionHeader, ChartCard } from '../components/UiComponents';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [todayReminders, setTodayReminders] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [healthDashboard, setHealthDashboard] = useState(null);
  const [weeklyActivitySeries, setWeeklyActivitySeries] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [analyticsRes, sessionsRes, remRes, insightsRes, healthDashRes, weeklyRes] = await Promise.all([
        analyticsAPI.getDashboard().catch(() => ({ data: {} })),
        chatAPI.getSessions({ limit: 3 }).catch(() => ({ data: { sessions: [] } })),
        reminderAPI.getToday().catch(() => ({ data: [] })),
        api.get('/health-insights/personalized').catch(() => ({ data: { insights: [] } })),
        healthInsightsAPI.getDashboard().catch(() => ({ data: null })),
        healthInsightsAPI.getWeeklySummary().catch(() => ({ data: null }))
      ]);

      setDashboardData(analyticsRes.data);
      setRecentSessions(sessionsRes.data?.sessions || []);
      setTodayReminders(remRes.data || []);
      setAiInsights(insightsRes.data?.insights || []);
      setHealthDashboard(healthDashRes.data || null);

      // Build weekly activity chart data from integrated health insights
      if (weeklyRes.data && weeklyRes.data.activity && weeklyRes.data.nutrition) {
        const dailyActivity = weeklyRes.data.activity.dailyData || [];
        const dailyNutrition = weeklyRes.data.nutrition.dailyData || [];
        const nutritionByDate = dailyNutrition.reduce((acc, day) => {
          acc[day.date] = day;
          return acc;
        }, {});

        const series = dailyActivity.map(day => {
          const nutritionDay = nutritionByDate[day.date] || {};
          // Use short weekday label for chart
          const dateObj = new Date(day.date);
          const weekday = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
          return {
            name: weekday,
            calories: nutritionDay.calories || 0,
            burn: day.caloriesBurned || 0,
          };
        });

        setWeeklyActivitySeries(series);
      } else {
        setWeeklyActivitySeries([]);
      }
      
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const caloriesToday = healthDashboard?.nutrition?.totalCalories ?? 0;
  const activeMinutesToday = healthDashboard?.activity?.totalDuration ?? 0;
  const currentWeight = healthDashboard?.healthProfile?.weight?.value ?? null;
  const weightSubtitle = healthDashboard?.healthProfile?.bmi
    ? `BMI: ${healthDashboard.healthProfile.bmi}`
    : 'Update your health profile';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative">
         <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
         <div className="relative z-10">
           <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Health Overview</h1>
           <p className="text-blue-100 mt-2 text-lg max-w-2xl">Good morning! Here's a snapshot of your wellness journey today.</p>
         </div>
         <div className="relative z-10 text-right">
           <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/20">
             <p className="text-sm font-medium text-blue-100">Overall Health Score</p>
             <p className="text-4xl font-extrabold text-white mt-1">
               {dashboardData?.healthScore || 85}<span className="text-xl text-blue-200">/100</span>
             </p>
           </div>
         </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Calories Consumed Today" 
          value={caloriesToday ? `${caloriesToday} kcal` : '--'} 
          subtitle={healthDashboard?.calorieBalance?.tdee ? `Goal: ${healthDashboard.calorieBalance.tdee} kcal` : 'Log meals to see your intake'}
          icon={FaFire} 
          colorClass="bg-orange-500" 
        />
        <StatCard 
          title="Active Minutes Today" 
          value={activeMinutesToday ? `${activeMinutesToday} min` : '--'} 
          subtitle={activeMinutesToday ? 'Great job staying active' : 'Log workouts to see activity'}
          icon={FaWalking} 
          colorClass="bg-emerald-500" 
        />
        <StatCard 
          title="Active Streak" 
          value={dashboardData?.statistics?.totalConsultations != null ? `${dashboardData.statistics.totalConsultations} Consults` : '--'} 
          icon={FaCalendarDay} 
          colorClass="bg-blue-500" 
        />
        <StatCard 
          title="Current Weight" 
          value={currentWeight ? `${currentWeight} ${healthDashboard?.healthProfile?.weight?.unit || 'kg'}` : '—'} 
          subtitle={weightSubtitle}
          icon={FaWeight} 
          colorClass="bg-purple-500" 
        />
      </div>

      {/* Middle Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title="Weekly Activity (Caloric Balance)">
          {weeklyActivitySeries.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Log meals and workouts this week to see your calorie balance here.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyActivitySeries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBurn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorCalories)" name="Intake" />
                <Area type="monotone" dataKey="burn" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorBurn)" name="Burn" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Quick Actions & Reminders */}
        <div className="space-y-6">
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <SectionHeader title="Up Next" />
             {todayReminders.length > 0 ? (
               <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   <div className="bg-indigo-600 text-white p-3 rounded-xl shadow-inner">
                     <FaHeartbeat className="text-xl" />
                   </div>
                   <div>
                     <p className="font-bold text-gray-900">{todayReminders[0].name}</p>
                     <p className="text-sm font-medium text-indigo-700">Scheduled for {todayReminders[0].times[0]} today</p>
                   </div>
                 </div>
                 <Link to="/reminders" className="px-4 py-2 bg-white text-indigo-600 font-bold rounded-lg shadow-sm hover:shadow-md transition">Take Now</Link>
               </div>
             ) : (
                <div className="text-center py-6 text-gray-500">
                  No upcoming reminders today. Great job!
                </div>
             )}
           </div>

           {/* AI Insights Widget */}
           <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-sm border border-indigo-100">
             <SectionHeader title="AI Health Insights" />
             {aiInsights.length > 0 ? (
               <ul className="space-y-3 mt-4">
                 {aiInsights.map((insight, idx) => (
                   <li key={idx} className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm border border-indigo-50">
                     <FaExclamationTriangle className="text-orange-500 mt-1 flex-shrink-0" />
                     <span className="text-gray-800 font-medium text-sm">{insight}</span>
                   </li>
                 ))}
               </ul>
             ) : (
               <div className="text-center py-6 text-gray-500 bg-white rounded-xl mt-4">
                 <FaCheckCircle className="mx-auto text-3xl mb-2 text-emerald-400" />
                 Your health markers look great today!
               </div>
             )}
           </div>

           <div className="grid grid-cols-2 gap-4">
             <Link to="/food-tracking" className="bg-orange-50 hover:bg-orange-100 transition rounded-2xl p-6 text-orange-700 flex flex-col items-center justify-center gap-3 border border-orange-100 group">
               <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition"><FaUtensils className="text-xl text-orange-500" /></div>
               <span className="font-bold">Log Meal</span>
             </Link>
             <Link to="/exercise-tracking" className="bg-emerald-50 hover:bg-emerald-100 transition rounded-2xl p-6 text-emerald-700 flex flex-col items-center justify-center gap-3 border border-emerald-100 group">
               <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition"><FaRunning className="text-xl text-emerald-500" /></div>
               <span className="font-bold">Log Workout</span>
             </Link>
           </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;
