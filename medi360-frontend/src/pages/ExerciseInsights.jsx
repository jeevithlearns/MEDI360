import React, { useState, useEffect } from 'react';
import { exerciseAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FaRunning, FaSpinner } from 'react-icons/fa';
import { format } from 'date-fns';
import { 
  BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

function ExerciseInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const res = await exerciseAPI.getWeeklyActivitySummary(today);
      if (res.success) {
        setData(res.data.summary);
      }
    } catch (error) {
      toast.error('Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><FaSpinner className="animate-spin text-4xl text-primary-600" /></div>;
  }

  const chartData = data?.dailyData?.map(d => ({
    name: format(new Date(d.date), 'EEE'),
    calories: d.caloriesBurned,
    duration: d.duration
  })) || [];

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <h1 className="text-3xl font-bold mb-2 flex items-center">
        <FaRunning className="mr-3 text-blue-500" />
        Exercise Insights
      </h1>
      <p className="text-gray-600 mb-8">Your weekly activity tracker and calorie burn insights.</p>

      {data && data.dailyData ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Weekly Exercise Chart</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#ef4444" axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} wrapperClassName="rounded-xl shadow-lg border-none" />
                <Legend iconType="circle" />
                <Bar yAxisId="left" dataKey="duration" name="Duration (min)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="calories" name="Calories (kcal)" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">No exercise data found for this week.</div>
      )}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-6 rounded-xl">
            <h3 className="text-blue-800 font-bold mb-1">Total Duration</h3>
            <p className="text-3xl font-black text-blue-600">{data.weeklyTotals.totalDuration} <span className="text-xl">min</span></p>
          </div>
          <div className="bg-red-50 p-6 rounded-xl">
            <h3 className="text-red-800 font-bold mb-1">Calories Burned</h3>
            <p className="text-3xl font-black text-red-600">{data.weeklyTotals.totalCaloriesBurned} <span className="text-xl">kcal</span></p>
          </div>
          <div className="bg-green-50 p-6 rounded-xl">
            <h3 className="text-green-800 font-bold mb-1">Active Days</h3>
            <p className="text-3xl font-black text-green-600">{data.weeklyTotals.activeDays}</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-xl">
            <h3 className="text-purple-800 font-bold mb-1">Total Workouts</h3>
            <p className="text-3xl font-black text-purple-600">{data.weeklyTotals.totalExercises}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExerciseInsights;
