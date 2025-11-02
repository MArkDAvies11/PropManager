/**
 * Protected Route Component - Property Management System
 * 
 * This component implements route protection for authenticated users.
 * It demonstrates Role-Based Access Control (RBAC) as required by capstone project.
 * 
 * Features:
 * - Authentication checking
 * - Role-based access control
 * - Automatic redirection for unauthorized users
 * - Loading states
 * 
 * Learning Goals Demonstrated:
 * - Higher-order components (HOC) pattern
 * - Conditional rendering
 * - React Router navigation
 * - Context API usage
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute Component
 * 
 * Wraps components that require authentication
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to protect
 * @param {string} props.requiredRole - Optional role requirement
 * @param {string} props.redirectTo - Where to redirect unauthorized users
 */
const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  redirectTo = '/login' 
}) => {
  // Get authentication state and methods
  const { isAuthenticated, hasRole, loading, user } = useAuth();
  
  // Get current location for redirect after login
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Redirect to login with current location for redirect after login
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check role-based access if required
  if (requiredRole && !hasRole(requiredRole)) {
    // Show unauthorized access message
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
            <h2 className="font-bold text-lg mb-2">Access Denied</h2>
            <p className="mb-4">
              You don't have permission to access this page.
            </p>
            <p className="text-sm">
              Required role: <span className="font-semibold">{requiredRole}</span>
              <br />
              Your role: <span className="font-semibold">{user?.role}</span>
            </p>
            <button
              onClick={() => window.history.back()}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and has required role (if any)
  return children;
};

export default ProtectedRoute;