/**
 * Dashboard Page
 * Main user dashboard with health overview
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, chatAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  FaUser, 
  FaComments, 
  FaChartLine, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner 
} from 'react-icons/fa';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard analytics
      const analyticsRes = await analyticsAPI.getDashboard();
      setDashboardData(analyticsRes.data);

      // Fetch recent chat sessions
      const sessionsRes = await chatAPI.getSessions({ limit: 5 });
      setRecentSessions(sessionsRes.data.sessions || []);
      
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      low: 'badge-low',
      moderate: 'badge-moderate',
      high: 'badge-high',
      emergency: 'badge-emergency',
    };
    return badges[severity] || 'badge';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-4xl text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your health overview</p>
      </div>

      {/* Health Score Card */}
      <div className="card bg-gradient-to-r from-primary-500 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium opacity-90">Your Health Score</h3>
            <p className={`text-5xl font-bold mt-2 ${getHealthScoreColor(dashboardData?.healthScore || 0)}`}>
              {dashboardData?.healthScore || 0}
              <span className="text-2xl">/100</span>
            </p>
            <p className="text-sm opacity-75 mt-2">
              {dashboardData?.healthScore >= 80 && 'Excellent health status!'}
              {dashboardData?.healthScore >= 60 && dashboardData?.healthScore < 80 && 'Good, but room for improvement'}
              {dashboardData?.healthScore < 60 && 'Consider lifestyle improvements'}
            </p>
          </div>
          <FaCheckCircle className="text-6xl opacity-20" />
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Consultations */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Consultations</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {dashboardData?.statistics?.totalConsultations || 0}
              </p>
            </div>
            <FaComments className="text-3xl text-primary-600" />
          </div>
        </div>

        {/* Emergency Consultations */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Emergency Alerts</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {dashboardData?.statistics?.emergencyConsultations || 0}
              </p>
            </div>
            <FaExclamationTriangle className="text-3xl text-red-600" />
          </div>
        </div>

        {/* Active Conditions */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Conditions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {dashboardData?.statistics?.activeConditions || 0}
              </p>
            </div>
            <FaUser className="text-3xl text-orange-600" />
          </div>
        </div>

        {/* Current Medications */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Medications</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {dashboardData?.statistics?.currentMedications || 0}
              </p>
            </div>
            <FaChartLine className="text-3xl text-green-600" />
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/chat" className="card hover:shadow-lg transition-shadow">
          <FaComments className="text-4xl text-primary-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Consultation</h3>
          <p className="text-sm text-gray-600">Chat with AI medical assistant about your symptoms</p>
        </Link>

        <Link to="/health-profile" className="card hover:shadow-lg transition-shadow">
          <FaUser className="text-4xl text-green-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {dashboardData?.hasHealthProfile ? 'Update Profile' : 'Create Profile'}
          </h3>
          <p className="text-sm text-gray-600">
            {dashboardData?.hasHealthProfile 
              ? 'Update your medical history and information'
              : 'Complete your health profile for personalized care'}
          </p>
        </Link>

        <Link to="/analytics" className="card hover:shadow-lg transition-shadow">
          <FaChartLine className="text-4xl text-purple-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">View Analytics</h3>
          <p className="text-sm text-gray-600">Track your health trends and insights</p>
        </Link>
      </div>

      {/* Recent Consultations */}
      <div className="card">
        <h3 className="card-header">Recent Consultations</h3>
        
        {recentSessions.length === 0 ? (
          <div className="text-center py-8">
            <FaComments className="text-5xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No consultations yet</p>
            <Link to="/chat" className="btn btn-primary">
              Start Your First Consultation
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <Link
                key={session._id}
                to={`/chat-history`}
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{session.sessionTitle}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(session.lastMessageAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {session.summary?.overallSeverity && (
                      <span className={`badge ${getSeverityBadge(session.summary.overallSeverity)}`}>
                        {session.summary.overallSeverity}
                      </span>
                    )}
                    <span className={`text-xs ${
                      session.status === 'active' ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Profile Completion Alert */}
      {!dashboardData?.hasHealthProfile && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-yellow-600 text-xl mr-3 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-yellow-900 font-medium">Complete Your Health Profile</h4>
              <p className="text-yellow-700 text-sm mt-1">
                Create your health profile to receive personalized medical recommendations
              </p>
              <Link 
                to="/health-profile" 
                className="inline-block mt-3 text-sm font-medium text-yellow-900 hover:text-yellow-700"
              >
                Create Profile →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
