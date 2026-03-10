/**
 * Exercise Tracking Page
 * Log workouts and track activity
 */

import React, { useState, useEffect } from 'react';
import { exerciseAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  FaRunning, 
  FaPlus, 
  FaHistory, 
  FaTrash, 
  FaSpinner, 
  FaChevronRight,
  FaFire,
  FaClock
} from 'react-icons/fa';
import { format } from 'date-fns';

function ExerciseTracking() {
  const [loading, setLoading] = useState(false);
  const [recentExercises, setRecentExercises] = useState([]);
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
    fetchRecentExercises();
  }, []);

  const fetchRecentExercises = async () => {
    try {
      const res = await exerciseAPI.getRecentExercises();
      if (res.success) {
        setRecentExercises(res.data.exercises || []);
      }
    } catch (error) {
      console.error('Error fetching recent exercises:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExercise({ ...exercise, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await exerciseAPI.addExercise(exercise);
      if (res.success) {
        toast.success('Exercise logged successfully!');
        setExercise({
          exerciseType: 'cardio',
          exerciseName: '',
          duration: 30,
          caloriesBurned: '',
          intensity: 'moderate',
          date: format(new Date(), 'yyyy-MM-dd'),
          notes: '',
        });
        fetchRecentExercises();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to log exercise');
    } finally {
      setLoading(false);
    }
  };

  const deleteExercise = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exercise record?')) return;
    try {
      const res = await exerciseAPI.deleteExercise(id);
      if (res.success) {
        toast.success('Exercise deleted');
        fetchRecentExercises();
      }
    } catch (error) {
      toast.error('Failed to delete exercise');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Exercise & Activity</h1>
        <p className="text-gray-600">Log your workouts and track your physical activity goals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Log Exercise Form */}
        <div className="md:col-span-2">
          <div className="card">
            <h3 className="card-header flex items-center">
              <FaRunning className="mr-2 text-primary-600" />
              Log Your Workout
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Name</label>
                  <input
                    type="text"
                    name="exerciseName"
                    value={exercise.exerciseName}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="e.g. Morning Run, Weightlifting"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="exerciseType"
                    value={exercise.exerciseType}
                    onChange={handleInputChange}
                    className="input"
                    required
                  >
                    <option value="cardio">Cardio</option>
                    <option value="strength">Strength</option>
                    <option value="flexibility">Flexibility / Yoga</option>
                    <option value="sports">Sports</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaClock className="mr-1 text-xs opacity-50" /> Duration (min)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={exercise.duration}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaFire className="mr-1 text-xs opacity-50" /> Calories Burned
                  </label>
                  <input
                    type="number"
                    name="caloriesBurned"
                    value={exercise.caloriesBurned}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Auto-calculated"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Intensity</label>
                  <select
                    name="intensity"
                    value={exercise.intensity}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                    <option value="very high">Very High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={exercise.date}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={exercise.notes}
                  onChange={handleInputChange}
                  className="input"
                  rows="2"
                  placeholder="How did it feel?"
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full py-3 flex items-center justify-center transform transition-transform hover:scale-[1.01]"
                disabled={loading}
              >
                {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaPlus className="mr-2" />}
                Log Workout
              </button>
            </form>
          </div>
        </div>

        {/* Recent Exercises */}
        <div className="md:col-span-1">
          <div className="card h-full border-l-4 border-primary-500">
            <h3 className="card-header flex items-center">
              <FaHistory className="mr-2 text-primary-600" />
              Recent Workouts
            </h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {Array.isArray(recentExercises) && recentExercises.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaRunning className="text-4xl mx-auto mb-2 opacity-20" />
                  <p>No workouts logged yet</p>
                </div>
              ) : (
                recentExercises.map((ex) => (
                  <div key={ex._id} className="p-3 bg-gray-50 rounded-xl group transition-all hover:bg-white hover:shadow-lg border border-transparent hover:border-blue-100">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        ex.exerciseType === 'cardio' ? 'bg-blue-100 text-blue-700' : 
                        ex.exerciseType === 'strength' ? 'bg-purple-100 text-purple-700' : 
                        'bg-green-100 text-green-700'
                      }`}>
                        {ex.exerciseType}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-gray-400">
                          {ex.intensity} intensity
                        </span>
                        <button
                          onClick={() => deleteExercise(ex._id)}
                          className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <FaTrash className="text-[10px]" />
                        </button>
                      </div>
                    </div>
                    <div className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {ex.exerciseName}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 font-medium">
                      <span className="flex items-center"><FaClock className="mr-1 opacity-40" /> {ex.duration}m</span>
                      <span className="flex items-center text-orange-600"><FaFire className="mr-1 opacity-70" /> {ex.caloriesBurned} kcal</span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-2 italic">
                      {format(new Date(ex.date), 'EEEE, MMM do')}
                    </div>
                  </div>
                ))
              )}
            </div>
            {recentExercises.length > 0 && (
              <a href="/health-dashboard" className="block text-center mt-6 p-2 bg-primary-50 text-xs font-bold text-primary-600 rounded-lg hover:bg-primary-100 transition-colors uppercase tracking-wider">
                Full Activity Report
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExerciseTracking;
