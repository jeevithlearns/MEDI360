/**
 * Health Dashboard
 * Integrated view of nutrition and exercise
 */

import React, { useState, useEffect } from 'react';
import { healthInsightsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  FaHeartbeat, 
  FaFire, 
  FaUtensils, 
  FaRunning, 
  FaSpinner,
  FaChartLine,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { format } from 'date-fns';
import { 
  AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

function HealthDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await healthInsightsAPI.getDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load health insights');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <FaSpinner className="animate-spin text-4xl text-primary-600" />
      </div>
    );
  }

  const { nutrition, activity, calorieBalance } = data || {};
  const recommendation = calorieBalance?.recommendation;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FaHeartbeat className="text-red-500" /> 
          Health Integration Hub
        </h1>
        <p className="text-gray-600">Unified view of your intake, activity, and goals</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Calorie Balance Widget */}
        <div className="lg:col-span-2 card bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <FaFire className="text-8xl" />
          </div>
          
          <h3 className="text-lg font-bold mb-6 flex items-center">
            Daily Calorie Balance
            <span className="ml-2 text-xs font-normal opacity-60 uppercase tracking-widest">{format(new Date(), 'MMMM do')}</span>
          </h3>

          <div className="grid grid-cols-3 gap-8 relative z-10">
            <div>
              <div className="text-xs text-blue-300 font-bold uppercase mb-1">Consumed</div>
              <div className="text-4xl font-black">{nutrition?.totalCalories || 0}</div>
              <div className="text-[10px] opacity-60 mt-1">kcal from food</div>
            </div>
            <div className="flex items-center justify-center text-2xl font-light text-gray-500">-</div>
            <div>
              <div className="text-xs text-orange-400 font-bold uppercase mb-1">Burned</div>
              <div className="text-4xl font-black">{activity?.totalCaloriesBurned || 0}</div>
              <div className="text-[10px] opacity-60 mt-1">kcal from exercise</div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex items-end justify-between">
            <div>
              <div className="text-xs text-green-400 font-bold uppercase mb-2">Net Status</div>
              <div className="text-5xl font-black text-white">
                {calorieBalance?.netCalories > 0 ? `+${calorieBalance.netCalories}` : calorieBalance?.netCalories || 0}
              </div>
            </div>
            <div className="text-right max-w-[200px]">
              <p className="text-xs italic opacity-70">
                {recommendation || "Maintain a healthy balance between diet and exercise."}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Sidebar */}
        <div className="space-y-4">
          <div className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="bg-green-100 p-3 rounded-xl text-green-600">
              <FaUtensils />
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase">Meals Logged</div>
              <div className="text-xl font-bold">{nutrition?.mealCount || 0}</div>
            </div>
          </div>
          
          <div className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
              <FaRunning />
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase">Active Time</div>
              <div className="text-xl font-bold">{activity?.totalDuration || 0} min</div>
            </div>
          </div>

          <div className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow border-l-4 border-yellow-400">
            <div className="bg-yellow-100 p-3 rounded-xl text-yellow-600">
              <FaChartLine />
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase">Weight Goal</div>
              <div className="text-xl font-bold">In Progress</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Activity Summary */}
        <div className="card">
          <h3 className="card-header flex items-center border-none mb-6">
            <FaRunning className="mr-2 text-primary-500" />
            Activity Breakdown
          </h3>
          {activity?.byType && Object.keys(activity.byType).length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(activity.byType).map(([type, val]) => ({ type, duration: val.duration }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="duration" fill="#1d4ed8" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>No activity data available. Start moving!</p>
            </div>
          )}
        </div>

        {/* Personalized Insight */}
        <div className="card bg-blue-50 border-blue-100">
          <h3 className="card-header flex items-center border-none text-blue-800">
            <FaCheckCircle className="mr-2 text-blue-500" />
            Daily Health Grade
          </h3>
          <div className="p-4 text-center">
            <div className="text-8xl font-black text-blue-900 opacity-20 mb-4">A-</div>
            <p className="text-blue-700 font-medium">
              Your protein intake is excellent today, and you managed to burn 520 calories. 
              Keeping your net intake below 1500 is helping you reach your goal.
            </p>
            <button className="mt-8 btn bg-blue-600 text-white hover:bg-blue-700 w-full rounded-xl py-3 font-bold shadow-lg shadow-blue-200">
              View Detailed Weekly Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HealthDashboard;
