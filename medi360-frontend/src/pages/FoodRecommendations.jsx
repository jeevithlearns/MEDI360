import React, { useState, useEffect } from 'react';
import { foodAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FaAppleAlt, FaSpinner } from 'react-icons/fa';

function FoodRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const res = await foodAPI.getFoodRecommendations();
      if (res.success) {
        setRecommendations(res.data);
      }
    } catch (error) {
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><FaSpinner className="animate-spin text-4xl text-primary-600" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <h1 className="text-3xl font-bold mb-2 flex items-center">
        <FaAppleAlt className="mr-3 text-green-500" />
        AI Food Recommendations
      </h1>
      <p className="text-gray-600 mb-8">Personalized meal ideas based on your health profile and weight goals.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transform hover:scale-[1.02] transition-transform">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">{rec.mealType}</h2>
            <ul className="space-y-3">
              {rec.options.map((opt, i) => (
                <li key={i} className="text-gray-600 flex items-center bg-gray-50 p-3 rounded-lg">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3 flex-shrink-0"></span>
                  <span className="capitalize">{opt}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FoodRecommendations;
