/**
 * Main App Component
 * 
 * This is the root component of our Property Management Application.
 * It handles routing between different pages and provides authentication context.
 * 
 * Learning Goals Demonstrated:
 * - React Router v6 for navigation
 * - Context API for state management
 * - Component composition
 * - Conditional rendering
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Import our page components
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    // Wrap entire app with Router for navigation
    <Router>
      {/* Wrap with AuthProvider to share authentication state */}
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Define all our application routes */}
          <Routes>
            {/* Public routes - accessible to everyone */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes - only for authenticated users */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;