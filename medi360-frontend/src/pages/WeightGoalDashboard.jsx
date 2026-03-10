import React, { useState, useEffect } from 'react';
import { weightGoalAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FaWeight, FaSpinner, FaBullseye, FaChartLine } from 'react-icons/fa';

function WeightGoalDashboard() {
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    currentWeight: '',
    targetWeight: '',
    targetTimelineWeeks: ''
  });

  useEffect(() => {
    fetchGoal();
  }, []);

  const fetchGoal = async () => {
    try {
      const res = await weightGoalAPI.get();
      if (res.success && res.data) {
        setGoal(res.data);
      }
    } catch (error) {
      if (error?.message && error.message.includes('No weight goal')) {
        // Not a real error, just empty state
      } else {
        toast.error('Failed to load weight goal');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await weightGoalAPI.set({
        currentWeight: Number(form.currentWeight),
        targetWeight: Number(form.targetWeight),
        targetTimelineWeeks: Number(form.targetTimelineWeeks)
      });
      if (res.success) {
        setGoal(res.data);
        toast.success('Goal saved!');
        setForm({ currentWeight: '', targetWeight: '', targetTimelineWeeks: '' });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save goal');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !goal) {
    return <div className="flex justify-center p-12"><FaSpinner className="animate-spin text-4xl text-primary-600" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <h1 className="text-3xl font-bold mb-2 flex items-center">
        <FaWeight className="mr-3 text-purple-500" />
        Weight Goal Tracking
      </h1>
      <p className="text-gray-600 mb-8">Set your targets and get AI-driven daily macro recommendations.</p>

      {goal && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
          <FaBullseye className="absolute -right-4 -bottom-4 text-white/10 text-9xl" />
          <div className="z-10 w-full md:w-2/3">
            <h2 className="text-2xl font-bold mb-4">Your Macro Target</h2>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-purple-200 text-sm font-semibold uppercase">Daily Calories</p>
                <p className="text-4xl font-black">{goal.dailyCaloriesTarget}</p>
                <p className="text-xs text-purple-200 mt-1">kcal/day</p>
              </div>
              <div>
                <p className="text-purple-200 text-sm font-semibold uppercase">Protein</p>
                <p className="text-4xl font-black">{goal.recommendedProtein}g</p>
                <p className="text-xs text-purple-200 mt-1">recommended</p>
              </div>
              <div>
                <p className="text-purple-200 text-sm font-semibold uppercase">Pace</p>
                <p className="text-4xl font-black">{goal.weeklyWeightChange > 0 ? '+' : ''}{goal.weeklyWeightChange}</p>
                <p className="text-xs text-purple-200 mt-1">kg/week</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h3 className="text-xl font-bold mb-6 flex items-center">
          <FaChartLine className="mr-2 text-primary-500" /> 
          {goal ? 'Update Your Goal' : 'Set a New Goal'}
        </h3>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Weight (kg)</label>
              <input 
                type="number" 
                step="0.1"
                required
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500"
                value={form.currentWeight}
                onChange={e => setForm({...form, currentWeight: e.target.value})}
                placeholder={goal?.currentWeight || ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Weight (kg)</label>
              <input 
                type="number" 
                step="0.1"
                required
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500"
                value={form.targetWeight}
                onChange={e => setForm({...form, targetWeight: e.target.value})}
                placeholder={goal?.targetWeight || ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timeline (Weeks)</label>
              <input 
                type="number" 
                required
                min="1"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500"
                value={form.targetTimelineWeeks}
                onChange={e => setForm({...form, targetTimelineWeeks: e.target.value})}
                placeholder={goal?.targetTimelineWeeks || ''}
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full md:w-auto bg-primary-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-700 transition">
            {loading ? 'Saving...' : 'Calculate & Save Goal'}
          </button>
        </form>
      </div>

    </div>
  );
}

export default WeightGoalDashboard;
