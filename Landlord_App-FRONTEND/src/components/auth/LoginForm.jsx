/**
 * LoginForm Component
 * 
 * Handles user authentication for both landlords and tenants.
 * Features:
 * - Email and password validation
 * - JWT token authentication
 * - Error handling and loading states
 * - Responsive design with Tailwind CSS
 * 
 * Props:
 * @param {Function} onLogin - Callback function called after successful login
 * @param {string} userType - Type of user logging in ('Landlord' or 'Tenant')
 */

import React, { useState } from 'react'
import { auth } from '../../api'  // Import authentication API functions

const LoginForm = ({ onLogin, userType }) => {
  // Component state management
  const [email, setEmail] = useState('')  // User email input
  const [password, setPassword] = useState('')  // User password input
  const [loading, setLoading] = useState(false)  // Loading state during API call
  const [error, setError] = useState('')  // Error message display

  /**
   * Handle Login Form Submission
   * Authenticates user and stores JWT token in localStorage
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault()  // Prevent default form submission
    setLoading(true)  // Show loading state
    setError('')  // Clear previous errors
    
    try {
      // Call login API with email and password
      const result = await auth.login(email, password)
      
      if (result.access_token) {
        // Login successful - JWT token stored in localStorage by auth.login()
        onLogin(result.user)  // Notify parent component of successful login
      } else {
        setError('Login failed')  // No token received
      }
    } catch (err) {
      // Login failed - invalid credentials or network error
      setError('Invalid credentials')
    } finally {
      setLoading(false)  // Hide loading state
    }
  }

  // Render login form UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        {/* Login Header */}
        <div>
          <h2 className="text-3xl font-bold text-center">{userType} Login</h2>
        </div>
        
        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Error Message Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {/* Email Input Field */}
          <div>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}  // Update email state on change
            />
          </div>
          
          {/* Password Input Field */}
          <div>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}  // Update password state on change
            />
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}  // Disable button during API call
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}  {/* Show loading text during submission */}
          </button>
        </form>
        
        {/* Test Credentials Display */}
        <div className="text-sm text-gray-600 text-center">
          Test: landlord@example.com / password123
        </div>
      </div>
    </div>
  )
}

export default LoginForm

export default LoginForm