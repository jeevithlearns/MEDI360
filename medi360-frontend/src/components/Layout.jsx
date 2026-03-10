/**
 * Layout Component
 * Main application layout with navigation
 */

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, 
  FaUser, 
  FaComments, 
  FaHistory, 
  FaChartLine, 
  FaSignOutAlt,
  FaStethoscope,
  FaUtensils,
  FaRunning,
  FaChartPie,
  FaHeartbeat,
  FaAppleAlt,
  FaWeight,
  FaChartArea,
  FaFileMedical,
  FaCapsules,
  FaInbox
} from 'react-icons/fa';

function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/overall-analysis', icon: FaChartArea, label: 'Overall Analysis' },
    { path: '/chat', icon: FaComments, label: 'AI Health Coach' },
    { path: '/food-tracking', icon: FaUtensils, label: 'Food & Nutrition' },
    { path: '/exercise-tracking', icon: FaRunning, label: 'Exercise & Activity' },
    { path: '/weight-goal', icon: FaWeight, label: 'Weight Goal' },
    { path: '/prescriptions', icon: FaFileMedical, label: 'Medical History' },
    { path: '/reminders', icon: FaCapsules, label: 'Medicine Reminders' },
    { path: '/health-profile', icon: FaUser, label: 'Health Profile' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-800 font-sans selection:bg-blue-200">
      {/* Top Navigation Bar Drop Shadow adjustments */}
      <nav className="bg-white/80 backdrop-blur-lg shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-600/20">
                <FaStethoscope className="text-white text-2xl" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent tracking-tight">MEDI-360</span>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center space-x-6">
              
              <Link to="/prescription-upload" className="hidden lg:flex items-center space-x-2 bg-indigo-50 border border-indigo-100 text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                 <FaInbox className="text-lg" />
                 <span>Upload Prescription</span>
              </Link>
              <div className="h-8 w-px bg-gray-200 hidden lg:block" />

              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900">{user?.fullName}</p>
                <p className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-0.5 inline-block">{user?.email}</p>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <FaSignOutAlt className="text-lg" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex w-full max-w-[1600px] mx-auto">
        {/* Sidebar Navigation */}
        <aside className="w-[260px] xl:w-[280px] shrink-0 bg-transparent min-h-[calc(100vh-5rem)] sticky top-20 hidden lg:block overflow-y-auto custom-scrollbar">
          <nav className="p-6 space-y-1.5 list-none">
            <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Main Menu</p>
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <li key={idx}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                      active
                        ? 'bg-blue-600 shadow-md shadow-blue-600/20 text-white font-bold'
                        : 'text-slate-600 font-semibold hover:bg-white hover:shadow-sm hover:text-blue-700'
                    }`}
                  >
                    <Icon className={`text-xl transition-transform duration-300 ${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-8 lg:p-10">
          <div className="w-full max-w-5xl xl:max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
