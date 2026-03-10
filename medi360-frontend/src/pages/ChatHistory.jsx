/**
 * Chat History Page
 * View past consultation sessions
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { chatAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  FaComments, 
  FaCalendar, 
  FaSpinner, 
  FaExclamationTriangle,
  FaChevronRight 
} from 'react-icons/fa';

function ChatHistory() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSessions();
  }, [filter]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await chatAPI.getSessions(params);
      
      if (response.success) {
        setSessions(response.data.sessions || []);
      }
    } catch (error) {
      console.error('Fetch sessions error:', error);
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session?')) {
      return;
    }

    try {
      await chatAPI.deleteSession(sessionId);
      toast.success('Session deleted');
      fetchSessions();
    } catch (error) {
      toast.error('Failed to delete session');
    }
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      low: { class: 'badge-low', icon: null },
      moderate: { class: 'badge-moderate', icon: null },
      high: { class: 'badge-high', icon: <FaExclamationTriangle className="mr-1" /> },
      emergency: { class: 'badge-emergency', icon: <FaExclamationTriangle className="mr-1" /> }
    };
    return badges[severity] || badges.low;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <FaSpinner className="animate-spin text-5xl text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chat History</h1>
        <p className="text-gray-600 mt-2">View and manage your past medical consultations</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex space-x-2">
        {['all', 'active', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="card text-center py-12">
          <FaComments className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No chat sessions found</h3>
          <p className="text-gray-600 mb-6">Start a new consultation to begin tracking your health</p>
          <Link to="/chat" className="btn btn-primary">
            Start New Chat
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Session Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {session.sessionTitle}
                      </h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center">
                          <FaCalendar className="mr-2" />
                          {formatDate(session.lastMessageAt)}
                        </span>
                        <span className="capitalize">
                          Type: {session.sessionType.replace('-', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      {/* Severity Badge */}
                      {session.summary?.overallSeverity && (
                        <span className={`badge ${getSeverityBadge(session.summary.overallSeverity).class} flex items-center`}>
                          {getSeverityBadge(session.summary.overallSeverity).icon}
                          {session.summary.overallSeverity.toUpperCase()}
                        </span>
                      )}

                      {/* Status */}
                      <span className={`text-xs font-medium ${
                        session.status === 'active' ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {session.status.toUpperCase()}
                      </span>

                      {/* Emergency Flag */}
                      {session.summary?.emergencyFlagged && (
                        <span className="badge badge-emergency flex items-center">
                          <FaExclamationTriangle className="mr-1" />
                          EMERGENCY
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Symptoms */}
                  {session.summary?.reportedSymptoms && session.summary.reportedSymptoms.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Reported Symptoms:</p>
                      <div className="flex flex-wrap gap-2">
                        {session.summary.reportedSymptoms.slice(0, 5).map((symptom, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                            {symptom.symptom}
                          </span>
                        ))}
                        {session.summary.reportedSymptoms.length > 5 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                            +{session.summary.reportedSymptoms.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-3 mt-4">
                    <Link
                      to="/chat"
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center"
                    >
                      Continue Chat
                      <FaChevronRight className="ml-1 text-xs" />
                    </Link>
                    <button
                      onClick={() => deleteSession(session._id)}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {sessions.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-sm text-gray-600">Total Sessions</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{sessions.length}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-gray-600">Emergency Alerts</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {sessions.filter(s => s.summary?.emergencyFlagged).length}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-gray-600">Active Sessions</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {sessions.filter(s => s.status === 'active').length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatHistory;
