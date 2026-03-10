/**
 * Exercise Tracking Page
 * Log workouts and track activity
 */

import React, { useState, useEffect } from 'react';
import { exerciseAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FaFilter, FaDumbbell, FaPlus, FaHistory, FaTrash, FaSpinner, FaRunning, FaFire, FaClock, FaCalendarDay } from 'react-icons/fa';
import { SectionHeader, StatCard, ChartCard } from '../components/UiComponents';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

function ExerciseTracking() {
  const [loading, setLoading] = useState(false);
  const [workouts, setWorkouts] = useState([]); // Renamed from recentExercises
  const [query, setQuery] = useState(''); // New state for the workout query
  const [summary, setSummary] = useState({ // New state for weekly summary
    totalCaloriesBurned: 0,
    totalActiveMinutes: 0,
    activeDaysThisWeek: 0,
  });

  // Old exercise state, might be removed or adapted if AI handles parsing
  const [exercise, setExercise] = useState({
    exerciseType: 'cardio',
    exerciseName: '',
    duration: 30,
    caloriesBurned: '',
    intensity: 'moderate',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  });

  useEffect(() => {
    fetchWorkouts(); // Renamed from fetchRecentExercises
    fetchSummary(); // New function to fetch summary
  }, []);

  const fetchWorkouts = async () => { // Renamed from fetchRecentExercises
    try {
      const res = await exerciseAPI.getRecentExercises(); // Assuming this API call still works
      if (res.success) {
        setWorkouts(res.data.exercises || []);
      }
    } catch (error) {
      console.error('Error fetching recent exercises:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await exerciseAPI.getWeeklyActivitySummary();
      if (res.success && res.data && res.data.summary && res.data.summary.weeklyTotals) {
        const totals = res.data.summary.weeklyTotals;
        setSummary({
          totalCaloriesBurned: totals.totalCaloriesBurned || 0,
          totalActiveMinutes: totals.totalActiveMinutes || 0,
          activeDaysThisWeek: totals.activeDays || 0,
        });
      } else {
        setSummary({
          totalCaloriesBurned: 0,
          totalActiveMinutes: 0,
          activeDaysThisWeek: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching weekly summary:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExercise({ ...exercise, [name]: value });
  };

  const handleLogWorkout = async (e) => { // New function, replaces handleSubmit
    e.preventDefault();
    try {
      setLoading(true);
      const res = await exerciseAPI.logWorkoutWithAI({ query });
      if (res.success) {
        toast.success('Workout logged successfully!');
        setQuery('');
        fetchWorkouts();
        fetchSummary();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to log exercise');
    } finally {
      setLoading(false);
    }
  };

  // The old handleSubmit is no longer used with the new UI form
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     setLoading(true);
  //     const res = await exerciseAPI.addExercise(exercise);
  //     if (res.success) {
  //       toast.success('Exercise logged successfully!');
  //       setExercise({
  //         exerciseType: 'cardio',
  //         exerciseName: '',
  //         duration: 30,
  //         caloriesBurned: '',
  //         intensity: 'moderate',
  //         date: format(new Date(), 'yyyy-MM-dd'),
  //         notes: '',
  //       });
  //       fetchWorkouts();
  //     }
  //   } catch (error) {
  //     toast.error(error.message || 'Failed to log exercise');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const deleteExercise = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exercise record?')) return;
    try {
      const res = await exerciseAPI.deleteExercise(id);
      if (res.success) {
        toast.success('Exercise deleted');
        fetchWorkouts();
        fetchSummary(); // Update summary after deletion
      }
    } catch (error) {
      toast.error('Failed to delete exercise');
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      
      <SectionHeader 
        title="Exercise Tracking" 
        description="Log your workouts and monitor your physical activity over time."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Logging Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex items-center gap-3 mb-6">
               <div className="bg-emerald-100 p-3 rounded-xl text-emerald-500"><FaRunning className="text-xl" /></div>
               <h3 className="text-xl font-bold text-gray-900">Log a Workout</h3>
             </div>

             <form onSubmit={handleLogWorkout} className="space-y-4">
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">What did you do?</label>
                 <textarea 
                   rows="3"
                   value={query}
                   onChange={(e) => setQuery(e.target.value)}
                   className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
                   placeholder="e.g. Ran 5km in 30 minutes, or 45 mins weightlifting..."
                   required
                 />
                 <p className="text-xs text-gray-500 mt-2 italic">Our AI automatically calculates calories burned and standardizes the activity.</p>
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
          
          <h3 className="text-xl font-bold text-gray-900 mb-4">Weekly Exercise Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard 
              title="Calories Burned" 
              value={`${summary.totalCaloriesBurned} kcal`} 
              icon={FaFire} 
              colorClass="bg-orange-500" 
            />
            <StatCard 
              title="Active Minutes" 
              value={`${summary.totalActiveMinutes} min`} 
              icon={FaRunning} 
              colorClass="bg-emerald-500" 
            />
            <StatCard 
              title="Active Days" 
              value={`${summary.activeDaysThisWeek}/7`} 
              icon={FaCalendarDay} 
              colorClass="bg-blue-500" 
            />
          </div>

          <ChartCard title="Recent Workouts">
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-gray-400 text-sm font-bold uppercase tracking-wider">
                     <th className="px-4 pb-2">Activity / Query</th>
                     <th className="px-4 pb-2">Intensity</th>
                     <th className="px-4 pb-2">Minutes</th>
                     <th className="px-4 pb-2">Kcal Burned</th>
                     <th className="px-4 pb-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {workouts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-400 font-medium">No workouts logged yet.</td>
                    </tr>
                  ) : (
                    workouts.map(workout => (
                      <tr key={workout._id} className="bg-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] rounded-xl transition-transform hover:-translate-y-0.5">
                        <td className="px-4 py-4 rounded-l-xl font-bold text-gray-900 truncate max-w-[150px]">{workout.exerciseQuery}</td>
                        <td className="px-4 py-4">
                           <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                             workout.intensity === 'high' ? 'bg-red-100 text-red-700' :
                             workout.intensity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                             'bg-emerald-100 text-emerald-700'
                           }`}>
                             {workout.intensity?.toUpperCase() || 'MODERATE'}
                           </span>
                        </td>
                        <td className="px-4 py-4 text-gray-600 font-medium">{workout.duration}</td>
                        <td className="px-4 py-4 text-orange-600 font-bold">{workout.caloriesBurned}</td>
                        <td className="px-4 py-4 rounded-r-xl text-gray-400 text-sm font-medium">
                          {new Date(workout.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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

export default ExerciseTracking;
