/**
 * API Service
 * Centralized API communication with backend
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Server responded with error
      if (error.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        success: false,
        message: 'No response from server. Please check your connection.',
      });
    } else {
      // Something else happened
      return Promise.reject({
        success: false,
        message: error.message || 'An error occurred',
      });
    }
  }
);

// ======================
// Authentication APIs
// ======================

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  updatePassword: (data) => api.put('/auth/password', data),
};

// ======================
// Health Profile APIs
// ======================

export const healthProfileAPI = {
  create: (data) => api.post('/health-profile', data),
  get: () => api.get('/health-profile'),
  update: (data) => api.put('/health-profile', data),
  delete: () => api.delete('/health-profile'),
  getRiskSummary: () => api.get('/health-profile/risk-summary'),
  addCondition: (data) => api.post('/health-profile/condition', data),
  addAllergy: (data) => api.post('/health-profile/allergy', data),
  addMedication: (data) => api.post('/health-profile/medication', data),
  checkMedication: (medicationName) => 
    api.post('/health-profile/check-medication', { medicationName }),
};

// ======================
// Chat APIs
// ======================

export const chatAPI = {
  createSession: (data) => api.post('/chat/session', data),
  getSessions: (params) => api.get('/chat/sessions', { params }),
  getSession: (sessionId) => api.get(`/chat/session/${sessionId}`),
  sendMessage: (sessionId, message) => 
    api.post(`/chat/session/${sessionId}/message`, { message }),
  completeSession: (sessionId) => api.put(`/chat/session/${sessionId}/complete`),
  deleteSession: (sessionId) => api.delete(`/chat/session/${sessionId}`),
};

// ======================
// Analytics APIs
// ======================

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getSymptomAnalysis: (timeframe) => 
    api.get('/analytics/symptoms', { params: { timeframe } }),
  getTrends: () => api.get('/analytics/trends'),
  getRecommendations: () => api.get('/analytics/recommendations'),
  exportData: () => api.get('/analytics/export'),
};

// ======================
// Food & Nutrition APIs
// ======================

export const foodAPI = {
  logFoodQuery: (data) => api.post('/food/analyze', data),
  addMeal: (data) => api.post('/food', data),
  getMealsByDate: (date) => api.get(`/food/date/${date}`),
  getDailyNutritionSummary: (date) => api.get(`/food/summary/daily/${date}`),
  getWeeklySummary: (date) => api.get(`/food/summary/weekly/${date}`),
  getRecentMeals: () => api.get('/food/recent'),
  getNutritionInsights: () => api.get('/food/insights'),
  getFoodRecommendations: () => api.get('/food/recommendations'),
  updateMeal: (mealId, data) => api.put(`/food/${mealId}`, data),
  deleteMeal: (mealId) => api.delete(`/food/${mealId}`),

  // AI Food Scanner endpoints
  analyzeImage: (formData) =>
    api.post('/food/image-analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    }),
  analyzeImageBase64: (base64) =>
    api.post('/food/image-analyze', { image: base64 }, { timeout: 30000 }),
  saveScanMeal: (data) => api.post('/food/image-save', data),
};

// ======================
// Exercise & Activity APIs
// ======================

export const exerciseAPI = {
  logWorkoutWithAI: (data) => api.post('/exercise/analyze', data),
  addExercise: (data) => api.post('/exercise', data),
  getExercisesByDate: (date) => api.get(`/exercise/date/${date}`),
  getDailyActivitySummary: (date) => api.get(`/exercise/summary/daily/${date}`),
  getWeeklyActivitySummary: (date) =>
    date ? api.get(`/exercise/summary/weekly/${date}`) : api.get('/exercise/summary/weekly'),
  getMonthlyOverview: (year, month) => api.get(`/exercise/summary/monthly/${year}/${month}`),
  getRecentExercises: () => api.get('/exercise/recent'),
  getExerciseInsights: () => api.get('/exercise/insights'),
  getRecommendations: () => api.get('/exercise/recommendations'),
  updateExercise: (exerciseId, data) => api.put(`/exercise/${exerciseId}`, data),
  deleteExercise: (exerciseId) => api.delete(`/exercise/${exerciseId}`),
};

// ======================
// Health Insights APIs
// ======================

export const healthInsightsAPI = {
  getDashboard: () => api.get('/health-insights/dashboard'),
  getWeeklySummary: () => api.get('/health-insights/weekly'),
  getPersonalizedRecommendations: () => api.get('/health-insights/recommendations'),
  getProgressTracking: (days) => api.get(`/health-insights/progress/${days}`),
};

// ======================
// Health Check
// ======================

export const weightGoalAPI = {
  get: () => api.get('/weight-goal'),
  set: (data) => api.post('/weight-goal', data),
};

// ======================
// Prescription API
// ======================

export const prescriptionAPI = {
  upload: (data) => api.post('/prescriptions/upload', data),
  getAll: () => api.get('/prescriptions'),
  getById: (id) => api.get(`/prescriptions/${id}`),
};

// ======================
// Medicine & Drug Safety API
// ======================

export const medicineAPI = {
  getAll: () => api.get('/medicine'),
  add: (data) => api.post('/medicine', data),
};

// ======================
// Reminders API
// ======================

export const reminderAPI = {
  getToday: () => api.get('/reminders/today'),
  markTaken: (medicineId, time) => api.post('/reminders/markTaken', { medicineId, time }),
};

// ======================
// Health Check
// ======================
export const healthCheck = () => api.get('/health');

export default api;
