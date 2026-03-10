/**
 * NotFound Page
 * 404 Error page
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaStethoscope } from 'react-icons/fa';

function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <FaStethoscope className="text-6xl text-primary-600 mx-auto mb-4" />
          <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-3">
          <Link to="/" className="btn btn-primary w-full flex items-center justify-center">
            <FaHome className="mr-2" />
            Go to Homepage
          </Link>
          
          <Link to="/dashboard" className="btn btn-secondary w-full">
            Go to Dashboard
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-600">
          <p>Need help? Contact support or return to safety.</p>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
