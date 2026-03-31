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
import ExerciseTracking from './pages/ExerciseTracking';
import WeightGoalDashboard from './pages/WeightGoalDashboard';
import PrescriptionUpload from './pages/PrescriptionUpload';
import PrescriptionHistory from './pages/PrescriptionHistory';
import MedicineReminderDashboard from './pages/MedicineReminderDashboard';
import OverallAnalysis from './pages/OverallAnalysis';
import FoodImageAnalyzer from './pages/FoodImageAnalyzer';
import NotFound from './pages/NotFound';
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
            path="/overall-analysis"
            element={
              <PrivateRoute>
                <Layout>
                  <OverallAnalysis />
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
            path="/food-tracking"
            element={
              <PrivateRoute>
                <Layout>
                  <FoodImageAnalyzer />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/food-scanner"
            element={
              <PrivateRoute>
                <Layout>
                  <FoodImageAnalyzer />
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
            path="/prescription-upload"
            element={
              <PrivateRoute>
                <Layout>
                  <PrescriptionUpload />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/prescriptions"
            element={
              <PrivateRoute>
                <Layout>
                  <PrescriptionHistory />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/reminders"
            element={
              <PrivateRoute>
                <Layout>
                  <MedicineReminderDashboard />
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
