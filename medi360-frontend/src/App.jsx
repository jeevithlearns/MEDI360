/**
 * Main App Component
 * Handles routing and global state
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import HealthProfile from './pages/HealthProfile';
import Chat from './pages/Chat';
import ChatHistory from './pages/ChatHistory';
import Analytics from './pages/Analytics';
import FoodTracking from './pages/FoodTracking';
import ExerciseTracking from './pages/ExerciseTracking';
import NutritionDashboard from './pages/NutritionDashboard';
import HealthDashboard from './pages/HealthDashboard';
import NotFound from './pages/NotFound';

import FoodRecommendations from './pages/FoodRecommendations';
import ExerciseInsights from './pages/ExerciseInsights';
import WeightGoalDashboard from './pages/WeightGoalDashboard';
import NutritionAnalytics from './pages/NutritionAnalytics';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/health-profile"
            element={
              <PrivateRoute>
                <Layout>
                  <HealthProfile />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <Layout>
                  <Chat />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/chat-history"
            element={
              <PrivateRoute>
                <Layout>
                  <ChatHistory />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <Layout>
                  <Analytics />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/food-tracking"
            element={
              <PrivateRoute>
                <Layout>
                  <FoodTracking />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/exercise-tracking"
            element={
              <PrivateRoute>
                <Layout>
                  <ExerciseTracking />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/nutrition-dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <NutritionDashboard />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/health-dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <HealthDashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/food-recommendations"
            element={
              <PrivateRoute>
                <Layout>
                  <FoodRecommendations />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/exercise-insights"
            element={
              <PrivateRoute>
                <Layout>
                  <ExerciseInsights />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/weight-goal"
            element={
              <PrivateRoute>
                <Layout>
                  <WeightGoalDashboard />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/nutrition-analytics-dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <NutritionAnalytics />
                </Layout>
              </PrivateRoute>
            }
          />
          
          {/* 404 */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
