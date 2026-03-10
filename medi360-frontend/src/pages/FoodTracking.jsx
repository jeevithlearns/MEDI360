/**
 * Food Tracking Page
 * Log meals and track nutrition
 */

import React, { useState, useEffect } from 'react';
import { foodAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  FaUtensils, 
  FaPlus, 
  FaHistory, 
  FaTrash, 
  FaSpinner, 
  FaChevronRight 
} from 'react-icons/fa';
import { format } from 'date-fns';

function FoodTracking() {
  const [loading, setLoading] = useState(false);
  const [recentMeals, setRecentMeals] = useState([]);
  const [meal, setMeal] = useState({
    mealType: 'breakfast',
    foodItems: [{ name: '', quantity: '', unit: '' }],
    nutrition: {
      calories: '',
      protein: '',
      carbs: '',
      fats: '',
    },
    notes: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    fetchRecentMeals();
  }, []);

  const fetchRecentMeals = async () => {
    try {
      const res = await foodAPI.getRecentMeals();
      if (res.success) {
        setRecentMeals(res.data.meals || []);
      }
    } catch (error) {
      console.error('Error fetching recent meals:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('nutrition.')) {
      const field = name.split('.')[1];
      const parsedValue = value === '' ? '' : parseFloat(value);
      setMeal({
        ...meal,
        nutrition: {
          ...meal.nutrition,
          [field]: isNaN(parsedValue) && value !== '' ? 0 : parsedValue,
        },
      });
    } else {
      setMeal({ ...meal, [name]: value });
    }
  };

  const handleFoodItemChange = (index, e) => {
    const { name, value } = e.target;
    const newFoodItems = [...meal.foodItems];
    newFoodItems[index][name] = value;
    setMeal({ ...meal, foodItems: newFoodItems });
  };

  const addFoodItem = () => {
    setMeal({
      ...meal,
      foodItems: [...meal.foodItems, { name: '', quantity: '', unit: '' }],
    });
  };

  const removeFoodItem = (index) => {
    const newFoodItems = meal.foodItems.filter((_, i) => i !== index);
    setMeal({ ...meal, foodItems: newFoodItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await foodAPI.addMeal(meal);
      if (res.success) {
        toast.success('Meal logged successfully!');
        setMeal({
          mealType: 'breakfast',
          foodItems: [{ name: '', quantity: '', unit: '' }],
          nutrition: {
            calories: '',
            protein: '',
            carbs: '',
            fats: '',
          },
          notes: '',
          date: format(new Date(), 'yyyy-MM-dd'),
        });
        fetchRecentMeals();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to log meal');
    } finally {
      setLoading(false);
    }
  };

  const deleteMeal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meal record?')) return;
    try {
      const res = await foodAPI.deleteMeal(id);
      if (res.success) {
        toast.success('Meal deleted');
        fetchRecentMeals();
      }
    } catch (error) {
      toast.error('Failed to delete meal');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Food & Nutrition</h1>
        <p className="text-gray-600">Log your daily meals and track your nutrient intake</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Log Meal Form */}
        <div className="md:col-span-2">
          <div className="card">
            <h3 className="card-header flex items-center">
              <FaUtensils className="mr-2 text-primary-600" />
              Log Your Meal
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
                  <select
                    name="mealType"
                    value={meal.mealType}
                    onChange={handleInputChange}
                    className="input"
                    required
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={meal.date}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Food Items</label>
                {meal.foodItems.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2 animate-fade-in">
                    <input
                      placeholder="Item Name"
                      name="name"
                      value={item.name}
                      onChange={(e) => handleFoodItemChange(index, e)}
                      className="input flex-1"
                      required
                    />
                    <input
                      placeholder="Qty"
                      name="quantity"
                      value={item.quantity}
                      onChange={(e) => handleFoodItemChange(index, e)}
                      className="input w-20"
                    />
                    <input
                      placeholder="Unit"
                      name="unit"
                      value={item.unit}
                      onChange={(e) => handleFoodItemChange(index, e)}
                      className="input w-20"
                    />
                    {meal.foodItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFoodItem(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFoodItem}
                  className="text-primary-600 text-sm font-medium flex items-center hover:underline mt-1"
                >
                  <FaPlus className="mr-1 text-xs" /> Add Another Item
                </button>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-inner">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-gray-800">Nutrition Details</h4>
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">✨ Leave blank for AI auto-calculation</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 uppercase font-bold">Calories</label>
                    <input
                      type="number"
                      name="nutrition.calories"
                      value={meal.nutrition.calories}
                      onChange={handleInputChange}
                      className="input mt-1"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase font-bold">Protein (g)</label>
                    <input
                      type="number"
                      name="nutrition.protein"
                      value={meal.nutrition.protein}
                      onChange={handleInputChange}
                      className="input mt-1"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase font-bold">Carbs (g)</label>
                    <input
                      type="number"
                      name="nutrition.carbs"
                      value={meal.nutrition.carbs}
                      onChange={handleInputChange}
                      className="input mt-1"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase font-bold">Fats (g)</label>
                    <input
                      type="number"
                      name="nutrition.fats"
                      value={meal.nutrition.fats}
                      onChange={handleInputChange}
                      className="input mt-1"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={meal.notes}
                  onChange={handleInputChange}
                  className="input"
                  rows="2"
                  placeholder="Any extra details..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full py-3 flex items-center justify-center"
                disabled={loading}
              >
                {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaPlus className="mr-2" />}
                Log Meal
              </button>
            </form>
          </div>
        </div>

        {/* Recent History */}
        <div className="md:col-span-1">
          <div className="card h-full">
            <h3 className="card-header flex items-center">
              <FaHistory className="mr-2 text-primary-600" />
              Recent Meals
            </h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {Array.isArray(recentMeals) && recentMeals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaUtensils className="text-4xl mx-auto mb-2 opacity-20" />
                  <p>No meals logged yet</p>
                </div>
              ) : (
                recentMeals.map((m) => (
                  <div key={m._id} className="p-3 bg-gray-50 rounded-lg hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-1">
                      <span className="badge badge-low capitalize">{m.mealType}</span>
                      <button
                        onClick={() => deleteMeal(m._id)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                    <div className="font-semibold text-gray-800">
                      {m.foodItems.map(f => f.name).join(', ')}
                    </div>
                    <div className="text-xs text-gray-500 flex justify-between mt-2">
                      <span>{format(new Date(m.date), 'MMM d, yyyy')}</span>
                      <span className="font-bold text-primary-600">{m.nutrition.calories} kcal</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {recentMeals.length > 0 && (
              <a href="/nutrition-dashboard" className="block text-center mt-4 text-sm font-medium text-primary-600 hover:underline">
                View Full Dashboard <FaChevronRight className="inline text-[10px]" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodTracking;
