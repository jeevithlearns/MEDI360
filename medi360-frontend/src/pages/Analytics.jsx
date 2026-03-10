/**
 * Analytics Page
 * Health insights and trends
 */

import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  FaChartLine, 
  FaHeartbeat, 
  FaSpinner, 
  FaLightbulb,
  FaExclamationCircle 
} from 'react-icons/fa';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

function Analytics() {
  const [loading, setLoading] = useState(true);
  const [symptomData, setSymptomData] = useState(null);
  const [trends, setTrends] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [timeframe, setTimeframe] = useState('30d');

  useEffect(() => {
    fetchAllAnalytics();
  }, [timeframe]);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch symptom analysis
      const symptomRes = await analyticsAPI.getSymptomAnalysis(timeframe);
      if (symptomRes.success) {
        setSymptomData(symptomRes.data);
      }

      // Fetch trends
      const trendsRes = await analyticsAPI.getTrends();
      if (trendsRes.success) {
        setTrends(trendsRes.data);
      }

      // Fetch recommendations
      const recRes = await analyticsAPI.getRecommendations();
      if (recRes.success) {
        setRecommendations(recRes.data.recommendations || []);
      }

    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = {
    low: '#22c55e',
    moderate: '#eab308',
    high: '#f59e0b',
    emergency: '#ef4444'
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-600 bg-red-50 border-red-200',
      moderate: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-blue-600 bg-blue-50 border-blue-200'
    };
    return colors[priority] || colors.low;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Health Analytics</h1>
        <p className="text-gray-600 mt-2">Track your health trends and get personalized insights</p>
      </div>

      {/* Timeframe Filter */}
      <div className="mb-6 flex space-x-2">
        {[
          { value: '7d', label: 'Last 7 Days' },
          { value: '30d', label: 'Last 30 Days' },
          { value: '90d', label: 'Last 90 Days' }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setTimeframe(option.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeframe === option.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Symptom Frequency */}
      {symptomData && symptomData.topSymptoms && symptomData.topSymptoms.length > 0 && (
        <div className="card mb-6">
          <h3 className="card-header flex items-center">
            <FaChartLine className="mr-2" />
            Most Reported Symptoms ({symptomData.timeframe})
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={symptomData.topSymptoms}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="symptom" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                style={{ fontSize: '12px' }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#0ea5e9" name="Frequency" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 text-sm text-gray-600">
            <p>Total consultations in this period: <strong>{symptomData.totalSessions}</strong></p>
          </div>
        </div>
      )}

      {/* Severity Distribution */}
      {symptomData && symptomData.severityDistribution && (
        <div className="card mb-6">
          <h3 className="card-header flex items-center">
            <FaHeartbeat className="mr-2" />
            Symptom Severity Distribution
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(symptomData.severityDistribution).map(([key, value]) => ({
                    name: key,
                    value: value
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.keys(symptomData.severityDistribution).map((key, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[key]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Stats */}
            <div className="space-y-4">
              {Object.entries(symptomData.severityDistribution).map(([severity, count]) => (
                <div key={severity} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3" 
                      style={{ backgroundColor: COLORS[severity] }}
                    ></div>
                    <span className="font-medium capitalize">{severity}</span>
                  </div>
                  <span className="text-2xl font-bold" style={{ color: COLORS[severity] }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Health Trends Over Time */}
      {trends && trends.trends && trends.trends.length > 0 && (
        <div className="card mb-6">
          <h3 className="card-header flex items-center">
            <FaChartLine className="mr-2" />
            Health Trends (Last 6 Months)
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="consultations" 
                stroke="#0ea5e9" 
                strokeWidth={2}
                name="Consultations"
              />
              <Line 
                type="monotone" 
                dataKey="uniqueSymptoms" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Unique Symptoms"
              />
              <Line 
                type="monotone" 
                dataKey="emergencies" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Emergencies"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <div className="card">
          <h3 className="card-header flex items-center">
            <FaLightbulb className="mr-2 text-yellow-500" />
            Personalized Health Recommendations
          </h3>

          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div 
                key={index} 
                className={`p-4 border rounded-lg ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-start">
                  {rec.priority === 'high' && (
                    <FaExclamationCircle className="text-xl mr-3 mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{rec.category}</h4>
                      <span className="text-xs font-medium uppercase px-2 py-1 rounded">
                        {rec.priority} Priority
                      </span>
                    </div>
                    <p className="text-sm mb-2">{rec.suggestion}</p>
                    <p className="text-xs opacity-75">Reason: {rec.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!symptomData || symptomData.totalSessions === 0) && (
        <div className="card text-center py-12">
          <FaChartLine className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data Yet</h3>
          <p className="text-gray-600 mb-6">
            Start using the medical chat to generate health insights and trends
          </p>
          <a href="/chat" className="btn btn-primary">
            Start Consultation
          </a>
        </div>
      )}
    </div>
  );
}

export default Analytics;
