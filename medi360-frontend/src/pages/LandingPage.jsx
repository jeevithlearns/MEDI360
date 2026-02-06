/**
 * Enhanced Landing Page with Modern UI
 * Features: Animations, Gradients, Glassmorphism, Parallax Effects
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaStethoscope, 
  FaUserMd, 
  FaChartLine, 
  FaShieldAlt,
  FaRobot,
  FaClock,
  FaBrain,
  FaHeartbeat,
  FaCheckCircle,
  FaStar,
  FaArrowRight
} from 'react-icons/fa';

function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: FaRobot,
      title: 'AI-Powered Diagnosis',
      description: 'Advanced machine learning analyzes your symptoms with 85% accuracy for instant medical guidance',
      color: 'from-blue-500 to-cyan-500',
      gradient: 'bg-gradient-to-br from-blue-50 to-cyan-50'
    },
    {
      icon: FaBrain,
      title: 'Smart Health Predictions',
      description: 'LSTM neural networks forecast your health trends up to 7 days in advance',
      color: 'from-purple-500 to-indigo-500',
      gradient: 'bg-gradient-to-br from-purple-50 to-indigo-50'
    },
    {
      icon: FaUserMd,
      title: 'Personalized Care',
      description: 'Tailored recommendations based on your unique health profile and medical history',
      color: 'from-green-500 to-emerald-500',
      gradient: 'bg-gradient-to-br from-green-50 to-emerald-50'
    },
    {
      icon: FaClock,
      title: '24/7 Availability',
      description: 'Access your personal medical assistant anytime, anywhere, at your convenience',
      color: 'from-orange-500 to-amber-500',
      gradient: 'bg-gradient-to-br from-orange-50 to-amber-50'
    },
    {
      icon: FaChartLine,
      title: 'Health Analytics',
      description: 'Track your health trends with interactive charts and comprehensive insights',
      color: 'from-pink-500 to-rose-500',
      gradient: 'bg-gradient-to-br from-pink-50 to-rose-50'
    },
    {
      icon: FaShieldAlt,
      title: 'Secure & Private',
      description: 'Your medical data is encrypted and protected with bank-level security',
      color: 'from-red-500 to-pink-500',
      gradient: 'bg-gradient-to-br from-red-50 to-pink-50'
    }
  ];

  const stats = [
    { value: '85%', label: 'AI Accuracy', icon: FaBrain },
    { value: '24/7', label: 'Availability', icon: FaClock },
    { value: '7-Day', label: 'Forecasting', icon: FaChartLine },
    { value: '100%', label: 'Secure', icon: FaShieldAlt }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo with animation */}
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                <FaStethoscope className="text-primary-600 text-3xl transform group-hover:rotate-12 transition-transform duration-300" />
                <div className="absolute inset-0 bg-primary-400 blur-xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                MEDI-360
              </span>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-primary-600 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-primary-500/50 transform hover:scale-105 transition-all duration-300"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Parallax */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute w-96 h-96 bg-primary-400 rounded-full blur-3xl opacity-20 -top-48 -left-48"
            style={{ transform: `translateY(${scrollY * 0.5}px)` }}
          ></div>
          <div 
            className="absolute w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20 -bottom-48 -right-48"
            style={{ transform: `translateY(${-scrollY * 0.3}px)` }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-50 to-blue-50 px-4 py-2 rounded-full border border-primary-200">
                <FaStar className="text-primary-600" />
                <span className="text-sm font-medium text-primary-700">
                  Powered by Advanced AI
                </span>
              </div>

              {/* Main Heading with gradient animation */}
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-primary-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
                  Your Personal Medical Assistant
                </span>
              </h1>

              {/* Description */}
              <p className="text-xl text-gray-600 leading-relaxed">
                AI-powered healthcare at your fingertips. Get instant medical guidance, 
                track your health, and make informed decisions about your well-being.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/register" 
                  className="group relative px-8 py-4 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-xl font-semibold text-lg shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/50 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                >
                  <span>Start Free Today</span>
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link 
                  to="/login" 
                  className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-primary-600 hover:text-primary-600 transform hover:scale-105 transition-all duration-300"
                >
                  Login
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 pt-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Icon className="text-primary-600 mr-2" />
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <p className="text-xs text-gray-600">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Disclaimer */}
              <p className="text-sm text-gray-500 flex items-start space-x-2">
                <span className="text-yellow-600">⚠️</span>
                <span>For informational purposes only. Not a substitute for professional medical advice.</span>
              </p>
            </div>

            {/* Right: Animated Card */}
            <div className="relative">
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-500">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-blue-400 rounded-2xl blur-2xl opacity-20 animate-pulse"></div>
                
                <div className="relative z-10">
                  {/* Stethoscope Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <FaStethoscope className="text-primary-600 text-9xl" />
                      {/* Pulse animation */}
                      <div className="absolute inset-0 bg-primary-400 rounded-full blur-2xl opacity-30 animate-ping"></div>
                    </div>
                  </div>

                  {/* Status Indicators with stagger animation */}
                  <div className="space-y-4">
                    {[
                      { icon: '🤖', text: 'AI Medical Assistant Active', color: 'green' },
                      { icon: '📊', text: 'Health Analytics Available', color: 'blue' },
                      { icon: '🔒', text: '24/7 Support Ready', color: 'purple' }
                    ].map((item, index) => (
                      <div 
                        key={index}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        style={{ 
                          animation: `slideInRight 0.5s ease-out ${index * 0.1}s both` 
                        }}
                      >
                        <div className={`w-3 h-3 bg-${item.color}-500 rounded-full animate-pulse`}></div>
                        <span className="text-gray-700 font-medium">{item.icon} {item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Healthcare Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your health in one intelligent platform
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = activeFeature === index;
              
              return (
                <div
                  key={index}
                  className={`group relative rounded-2xl p-8 transition-all duration-500 cursor-pointer ${
                    isActive ? 'scale-105 shadow-2xl' : 'hover:scale-105 hover:shadow-xl'
                  } ${feature.gradient}`}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  {/* Gradient border on hover */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                  
                  <div className="relative z-10">
                    {/* Icon with gradient */}
                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.color} mb-6 transform group-hover:rotate-6 transition-transform`}>
                      <Icon className="text-4xl text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Active indicator */}
                    {isActive && (
                      <div className="mt-4 flex items-center text-primary-600 font-medium">
                        <FaCheckCircle className="mr-2" />
                        <span className="text-sm">Featured</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How MEDI-360 Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to better health management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: '1', title: 'Create Account', desc: 'Sign up in seconds', icon: '👤' },
              { num: '2', title: 'Complete Profile', desc: 'Add your health info', icon: '📋' },
              { num: '3', title: 'Chat with AI', desc: 'Get instant guidance', icon: '💬' },
              { num: '4', title: 'Track Progress', desc: 'Monitor your health', icon: '📈' }
            ].map((step, index) => (
              <div 
                key={index} 
                className="text-center group"
                style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}
              >
                {/* Number Badge */}
                <div className="relative inline-flex mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary-600 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                    {step.num}
                  </div>
                  {/* Connecting line (except last) */}
                  {index < 3 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary-600 to-blue-600 opacity-20"></div>
                  )}
                </div>

                {/* Icon */}
                <div className="text-4xl mb-4">{step.icon}</div>

                {/* Title */}
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with gradient */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-4">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users managing their health with MEDI-360's AI-powered platform
          </p>
          
          <Link 
            to="/register" 
            className="inline-flex items-center space-x-3 bg-white text-primary-600 px-10 py-5 rounded-xl text-lg font-bold shadow-2xl hover:shadow-white/30 transform hover:scale-105 transition-all duration-300"
          >
            <span>Get Started Free</span>
            <FaArrowRight />
          </Link>

          {/* Social Proof */}
          <div className="mt-12 flex justify-center items-center space-x-8 text-white/80">
            <div>
              <FaCheckCircle className="inline mr-2" />
              <span>No Credit Card</span>
            </div>
            <div>
              <FaCheckCircle className="inline mr-2" />
              <span>Instant Access</span>
            </div>
            <div>
              <FaCheckCircle className="inline mr-2" />
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center mb-4">
                <FaStethoscope className="text-3xl mr-2 text-primary-400" />
                <span className="text-2xl font-bold">MEDI-360</span>
              </div>
              <p className="text-gray-400">
                Your trusted AI-powered personal medical assistant
              </p>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
              </ul>
            </div>

            {/* Academic Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Academic Project</h3>
              <p className="text-gray-400 text-sm">
                CMR University<br />
                School of Engineering and Technology<br />
                CSE Department | 2025-26
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© 2026 MEDI-360. Academic Capstone Project.</p>
            <p className="mt-2">
              ⚠️ This system provides general medical guidance and is not a substitute for 
              professional medical advice, diagnosis, or treatment.
            </p>
          </div>
        </div>
      </footer>

      {/* Add keyframes for animations */}
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}

export default LandingPage;
