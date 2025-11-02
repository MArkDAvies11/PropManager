/**
 * Authentication Context - Property Management System
 * 
 * This context manages user authentication state for our Property Management Application.
 * It handles login, registration, and user session management.
 * 
 * Features Supported:
 * - JWT Authentication (as per capstone requirements)
 * - Role-Based Access Control (Landlord/Tenant roles)
 * - Persistent login sessions
 * - Error handling with user-friendly messages
 * 
 * Learning Goals Demonstrated:
 * - React Context API for global state management
 * - Local storage for data persistence
 * - Async/await for API calls
 * - Error handling and validation
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the authentication context
const AuthContext = createContext();

/**
 * Custom hook to use authentication context
 * This makes it easy to access auth state in any component
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * AuthProvider Component
 * Wraps the app and provides authentication functionality
 */
export const AuthProvider = ({ children }) => {
  // State management for authentication
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Initialize authentication state on app startup
   * Checks if user was previously logged in
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('auth_token');
        
        if (savedUser && token) {
          // Restore user session
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login Function
   * Authenticates user with email and password
   * 
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Object} - Success status and error message if any
   */
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('auth_token', data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
      
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Login failed. Please check your credentials.' 
      };
    }
  };

  /**
   * Register Function
   * Creates a new user account
   * 
   * @param {Object} userData - User registration data
   * @returns {Object} - Success status and error message if any
   */
  const register = async (userData) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('auth_token', data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: 'Registration failed. Please try again.' 
      };
    }
  };

  /**
   * Logout Function
   * Clears user session and authentication data
   */
  const logout = () => {
    try {
      // Clear local storage
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      
      // Clear application state
      setUser(null);
      
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  const isAuthenticated = () => {
    return user !== null && localStorage.getItem('auth_token') !== null;
  };

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} - Role check result
   */
  const hasRole = (role) => {
    return user && user.role === role;
  };

  /**
   * Get authentication token
   * @returns {string|null} - JWT token or null
   */
  const getToken = () => {
    return localStorage.getItem('auth_token');
  };

  // Context value object
  const value = {
    // State
    user,
    loading,
    
    // Authentication methods
    login,
    register,
    logout,
    
    // Utility methods
    isAuthenticated,
    hasRole,
    getToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};