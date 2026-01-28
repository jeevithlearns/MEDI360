/**
 * Landing Page
 * Public homepage for MEDI-360
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaStethoscope, 
  FaUserMd, 
  FaChartLine, 
  FaShieldAlt,
  FaRobot,
  FaClock 
} from 'react-icons/fa';

function LandingPage() {
  const features = [
    {
      icon: FaRobot,
      title: 'AI-Powered Diagnosis',
      description: 'Advanced AI assistant analyzes your symptoms and provides instant medical guidance'
    },
    {
      icon: FaUserMd,
      title: 'Personalized Care',
      description: 'Get recommendations tailored to your health profile and medical history'
    },
    {
      icon: FaClock,
      title: '24/7 Availability',
      description: 'Access medical assistance anytime, anywhere, at your convenience'
    },
    {
      icon: FaChartLine,
      title: 'Health Analytics',
      description: 'Track your health trends and get insights into your well-being'
    },
    {
      icon: FaShieldAlt,
      title: 'Secure & Private',
      description: 'Your medical data is encrypted and protected with industry-standard security'
    },
    {
      icon: FaStethoscope,
      title: 'Emergency Detection',
      description: 'Automatic identification of critical symptoms with immediate guidance'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <FaStethoscope className="text-primary-600 text-3xl mr-2" />
              <span className="text-2xl font-bold text-gray-900">MEDI-360</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-blue-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Your Personal Medical Assistant
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                AI-powered healthcare at your fingertips. Get instant medical guidance, 
                track your health, and make informed decisions about your well-being.
              </p>
              <div className="flex space-x-4">
                <Link to="/register" className="btn btn-primary text-lg px-8 py-3">
                  Start Free Today
                </Link>
                <Link to="/login" className="btn btn-secondary text-lg px-8 py-3">
                  Login
                </Link>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                ⚠️ For informational purposes only. Not a substitute for professional medical advice.
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <FaStethoscope className="text-primary-600 text-9xl mx-auto mb-6" />
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-700">AI Medical Assistant Active</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-700">Health Analytics Available</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-700">24/7 Support Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Healthcare Features
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to manage your health in one platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card hover:shadow-lg transition-shadow">
                  <Icon className="text-5xl text-primary-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
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
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Account</h3>
              <p className="text-gray-600">Sign up in seconds with your email</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Complete Profile</h3>
              <p className="text-gray-600">Add your health information for personalized care</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Chat with AI</h3>
              <p className="text-gray-600">Describe symptoms and get instant guidance</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600">Monitor your health trends over time</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of users managing their health with MEDI-360
          </p>
          <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <FaStethoscope className="text-3xl mr-2" />
                <span className="text-2xl font-bold">MEDI-360</span>
              </div>
              <p className="text-gray-400">
                Your trusted AI-powered personal medical assistant
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/login" className="hover:text-white">Login</Link></li>
                <li><Link to="/register" className="hover:text-white">Register</Link></li>
              </ul>
            </div>

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
    </div>
  );
}

export default LandingPage;
