/**
 * Register Component - Property Management System
 * 
 * This component handles user registration for both landlords and tenants.
 * It includes comprehensive form validation and role selection.
 * 
 * Features:
 * - Multi-step form with role selection
 * - Form validation with React Hook Form
 * - Password confirmation matching
 * - Responsive design with Tailwind CSS
 * - Error handling and loading states
 * 
 * Learning Goals Demonstrated:
 * - React Hook Form for complex form management
 * - Form validation and error handling
 * - State management with useState
 * - Context API usage (useAuth)
 * - Conditional rendering based on user role
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Mail, 
  Lock, 
  User, 
  AlertCircle, 
  Building2, 
  Users,
  Eye,
  EyeOff,
  CheckCircle
} from 'lucide-react';

const Register = () => {
  // Authentication context
  const { register: registerUser, isAuthenticated, loading: authLoading } = useAuth();
  
  // Navigation and location
  const navigate = useNavigate();
  const location = useLocation();
  
  // Component state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState(location.state?.role || '');

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      role: location.state?.role || ''
    }
  });

  // Watch password field for confirmation validation
  const password = watch('password');

  // Redirect if already authenticated
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  /**
   * Handle form submission
   * @param {Object} data - Form data containing user registration information
   */
  const onSubmit = async (data) => {
    // Clear previous errors
    setError('');
    setLoading(true);

    try {
      // Add selected role to form data
      const formData = {
        ...data,
        role: selectedRole
      };
      
      // Attempt registration
      const result = await registerUser(formData);
      
      if (result.success) {
        // Redirect to dashboard on successful registration
        navigate('/dashboard');
      } else {
        // Display error message
        setError(result.error);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle role selection
   * @param {string} role - Selected user role
   */
  const handleRoleSelection = (role) => {
    setSelectedRole(role);
  };

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  /**
   * Toggle confirm password visibility
   */
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // User role options
  const roleOptions = [
    {
      value: 'landlord',
      title: 'Landlord',
      description: 'I want to manage properties and collect rent',
      icon: <Building2 className="h-8 w-8 text-blue-600" />,
      color: 'border-blue-500 bg-blue-50'
    },
    {
      value: 'tenant',
      title: 'Tenant',
      description: 'I want to pay rent and communicate with my landlord',
      icon: <Users className="h-8 w-8 text-green-600" />,
      color: 'border-green-500 bg-green-50'
    }
  ];

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <Building2 className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        {/* Registration Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Error Message Display */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I am a:
            </label>
            <div className="grid grid-cols-1 gap-3">
              {roleOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleRoleSelection(option.value)}
                  className={`
                    relative cursor-pointer rounded-lg border p-4 hover:shadow-md transition-all
                    ${selectedRole === option.value 
                      ? `${option.color} ring-2 ring-offset-2 ring-blue-500` 
                      : 'border-gray-300 bg-white'
                    }
                  `}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {option.icon}
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {option.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {option.description}
                      </p>
                    </div>
                    {selectedRole === option.value && (
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  
                  {/* Hidden radio input for form validation */}
                  <input
                    {...register('role', {
                      required: 'Please select your role'
                    })}
                    type="radio"
                    value={option.value}
                    checked={selectedRole === option.value}
                    onChange={() => handleRoleSelection(option.value)}
                    className="sr-only"
                  />
                </div>
              ))}
            </div>
            {/* Role Error Message */}
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">
                {errors.role.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* First Name Field */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('firstName', {
                    required: 'First name is required',
                    minLength: {
                      value: 2,
                      message: 'First name must be at least 2 characters'
                    }
                  })}
                  type="text"
                  autoComplete="given-name"
                  className={`
                    appearance-none block w-full px-3 py-2 pl-10 border rounded-md 
                    placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500
                    ${errors.firstName ? 'border-red-300' : 'border-gray-300'}
                  `}
                  placeholder="First name"
                />
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name Field */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('lastName', {
                    required: 'Last name is required',
                    minLength: {
                      value: 2,
                      message: 'Last name must be at least 2 characters'
                    }
                  })}
                  type="text"
                  autoComplete="family-name"
                  className={`
                    appearance-none block w-full px-3 py-2 pl-10 border rounded-md 
                    placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500
                    ${errors.lastName ? 'border-red-300' : 'border-gray-300'}
                  `}
                  placeholder="Last name"
                />
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* House Number Field (Tenants Only) */}
          {selectedRole === 'tenant' && (
            <div>
              <label htmlFor="houseNumber" className="block text-sm font-medium text-gray-700">
                House Number
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('houseNumber', {
                    required: selectedRole === 'tenant' ? 'House number is required' : false,
                    pattern: {
                      value: /^[A-Za-z0-9-]+$/,
                      message: 'House number can only contain letters, numbers, and hyphens'
                    }
                  })}
                  type="text"
                  className={`
                    appearance-none block w-full px-3 py-2 pl-10 border rounded-md 
                    placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500
                    ${errors.houseNumber ? 'border-red-300' : 'border-gray-300'}
                  `}
                  placeholder="e.g., A1, B12, 101"
                />
                <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              {errors.houseNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.houseNumber.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                This will be your unique identifier for payments
              </p>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1 relative">
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Please enter a valid email address'
                  }
                })}
                type="email"
                autoComplete="email"
                className={`
                  appearance-none block w-full px-3 py-2 pl-10 border rounded-md 
                  placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500
                  ${errors.email ? 'border-red-300' : 'border-gray-300'}
                `}
                placeholder="Enter your email"
              />
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative">
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                  }
                })}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`
                  appearance-none block w-full px-3 py-2 pl-10 pr-10 border rounded-md 
                  placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500
                  ${errors.password ? 'border-red-300' : 'border-gray-300'}
                `}
                placeholder="Create a password"
              />
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="mt-1 relative">
              <input
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match'
                })}
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`
                  appearance-none block w-full px-3 py-2 pl-10 pr-10 border rounded-md 
                  placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500
                  ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'}
                `}
                placeholder="Confirm your password"
              />
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center">
            <input
              {...register('acceptTerms', {
                required: 'You must accept the terms and conditions'
              })}
              id="accept-terms"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="mt-1 text-sm text-red-600">
              {errors.acceptTerms.message}
            </p>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`
                group relative w-full flex justify-center py-2 px-4 border border-transparent 
                text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-blue-500
                ${loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
                }
              `}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </div>

          {/* Additional Links */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>

        {/* Back to Home Link */}
        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;