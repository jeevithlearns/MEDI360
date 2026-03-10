/**
 * Food Tracking Page
 * Log meals and track nutrition
 */

import React, { useState, useEffect } from 'react';
import { foodAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FaLeaf, FaFire, FaDrumstickBite, FaUtensils, FaDumbbell, FaListOl, FaSpinner } from 'react-icons/fa';
import { SectionHeader, StatCard, ChartCard } from '../components/UiComponents';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

function FoodTracking() {
  const [loading, setLoading] = useState(false);
  // Recent meals and AI query-based logging
  const [query, setQuery] = useState('');
  const [summary, setSummary] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
  });
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    fetchRecentMeals();
    fetchDailySummary();
  }, []);

  const fetchRecentMeals = async () => {
    try {
      setLoading(true);
      const res = await foodAPI.getRecentMeals();
      if (res.success) {
        setFoods(res.data.meals || []);
      }
    } catch (error) {
      console.error('Error fetching recent meals:', error);
      toast.error('Failed to fetch recent meals.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDailySummary = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const res = await foodAPI.getDailyNutritionSummary(today);
      if (res.success && res.data && res.data.summary) {
        setSummary(res.data.summary);
      } else if (res.success && res.data && res.data.summary === undefined && res.data.totalCalories !== undefined) {
        // Fallback to direct summary object shape if controller returns summary at root
        setSummary(res.data);
      }
    } catch (error) {
      console.error('Error fetching daily summary:', error);
    }
  };

  const handleLogFood = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error('Please enter what you ate.');
      return;
    }
    try {
      setLoading(true);
      const res = await foodAPI.logFoodQuery({ query }); // Assuming a new API endpoint for AI analysis
      if (res.success) {
        toast.success('Meal logged and analyzed!');
        setQuery('');
        fetchRecentMeals(); // Refresh recent meals
        fetchDailySummary(); // Refresh daily summary
      }
    } catch (error) {
      toast.error(error.message || 'Failed to log meal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      
      <SectionHeader 
        title="Food Tracking" 
        description="Log your meals to monitor nutritional intake and stay aligned with your daily goals."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Logging Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex items-center gap-3 mb-6">
               <div className="bg-orange-100 p-3 rounded-xl text-orange-500"><FaUtensils className="text-xl" /></div>
               <h3 className="text-xl font-bold text-gray-900">Log a Meal</h3>
             </div>

             <form onSubmit={handleLogFood} className="space-y-4">
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">What did you eat?</label>
                 <textarea 
                   rows="3"
                   value={query}
                   onChange={(e) => setQuery(e.target.value)}
                   className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
                   placeholder="e.g. 2 slices of bread, 1 apple..."
                   required
                 />
                 <p className="text-xs text-gray-500 mt-2 italic">Our AI automatically estimates calories and macros.</p>
               </div>
               
               <button 
                 type="submit" 
                 disabled={loading}
                 className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
               >
                 {loading ? <FaSpinner className="animate-spin" /> : <FaFire />}
                 {loading ? 'Analyzing...' : 'Log & Analyze'}
               </button>
             </form>
          </div>
        </div>

        {/* Right Col: Stats & History */}
        <div className="lg:col-span-2 space-y-6">
          
          <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-500">
              <FaFire className="text-sm" />
            </span>
            <span>Today's Nutrition Summary</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              title="Calories" 
              value={`${summary.totalCalories} kcal`} 
              icon={FaFire} 
              colorClass="bg-orange-500" 
            />
            <StatCard 
              title="Protein" 
              value={`${summary.totalProtein}g`} 
              icon={FaDumbbell} 
              colorClass="bg-blue-500" 
            />
            <StatCard 
              title="Carbs" 
              value={`${summary.totalCarbs}g`} 
              icon={FaUtensils} 
              colorClass="bg-green-500" 
            />
            <StatCard 
              title="Fats" 
              value={`${summary.totalFats}g`} 
              icon={FaLeaf} 
              colorClass="bg-yellow-500" 
            />
          </div>

          <ChartCard title="Recent Logs">
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-gray-400 text-sm font-bold uppercase tracking-wider">
                     <th className="px-4 pb-2">Food / Query</th>
                     <th className="px-4 pb-2">Kcal</th>
                     <th className="px-4 pb-2 hidden sm:table-cell">Protein</th>
                     <th className="px-4 pb-2 hidden sm:table-cell">Carbs</th>
                     <th className="px-4 pb-2 hidden sm:table-cell">Fats</th>
                     <th className="px-4 pb-2">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {foods.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-gray-400 font-medium">No meals logged today.</td>
                    </tr>
                  ) : (
                    foods.map(food => (
                      <tr key={food._id} className="bg-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] rounded-xl transition-transform hover:-translate-y-0.5">
                        <td className="px-4 py-4 rounded-l-xl font-bold text-gray-900 truncate max-w-[150px]">{food.foodQuery}</td>
                        <td className="px-4 py-4 text-orange-600 font-bold">{food.nutrition?.calories || 0}</td>
                        <td className="px-4 py-4 hidden sm:table-cell text-gray-600 font-medium">{food.nutrition?.protein || 0}g</td>
                        <td className="px-4 py-4 hidden sm:table-cell text-gray-600 font-medium">{food.nutrition?.carbs || 0}g</td>
                        <td className="px-4 py-4 hidden sm:table-cell text-gray-600 font-medium">{food.nutrition?.fats || 0}g</td>
                        <td className="px-4 py-4 rounded-r-xl text-gray-400 text-sm font-medium">
                          {new Date(food.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </ChartCard>

        </div>
      </div>
    </div>
  );
}

export default FoodTracking;
