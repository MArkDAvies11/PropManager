/**
 * Landing Page Component - Property Management System
 * 
 * This is the main landing page that showcases our property management features.
 * It includes role selection, feature highlights, and navigation to login/register.
 * 
 * Features Demonstrated:
 * - Role selection (Landlord/Tenant)
 * - Feature showcase (M-Pesa Integration, Property Management, Real-time Chat)
 * - Responsive design with Tailwind CSS
 * - React Router navigation
 * 
 * Learning Goals:
 * - Component composition and structure
 * - Tailwind CSS for styling
 * - React Router for navigation
 * - Props and state management
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MessageSquare, 
  CreditCard, 
  Users, 
  Shield, 
  Smartphone,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const LandingPage = () => {
  // State for selected user role
  const [selectedRole, setSelectedRole] = useState('');
  const navigate = useNavigate();

  /**
   * Handle role selection and navigation
   * @param {string} role - Selected user role (landlord/tenant)
   */
  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    // Navigate to registration with role pre-selected
    navigate('/register', { state: { role } });
  };

  /**
   * Feature data for the showcase section
   */
  const features = [
    {
      icon: <Building2 className="h-8 w-8 text-navy-800" />,
      title: "Property Management",
      description: "Easily manage multiple properties, track rent payments, and maintain tenant records.",
      benefits: ["Add/Edit Properties", "Tenant Management", "Maintenance Tracking"]
    },
    {
      icon: <CreditCard className="h-8 w-8 text-navy-600" />,
      title: "M-Pesa Integration",
      description: "Seamless rent payments through M-Pesa STK Push for convenient transactions.",
      benefits: ["STK Push Payments", "Payment History", "Automated Receipts"]
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-navy-700" />,
      title: "Real-time Chat",
      description: "Direct communication between landlords and tenants for quick issue resolution.",
      benefits: ["Instant Messaging", "File Sharing", "Notification System"]
    }
  ];

  /**
   * User role options for selection
   */
  const userRoles = [
    {
      role: 'landlord',
      title: 'I am a Landlord',
      description: 'Manage properties, collect rent, and communicate with tenants',
      icon: <Building2 className="h-12 w-12 text-navy-800" />,
      color: 'border-navy-600 hover:bg-navy-50'
    },
    {
      role: 'tenant',
      title: 'I am a Tenant',
      description: 'Pay rent, communicate with landlord, and manage your tenancy',
      icon: <Users className="h-12 w-12 text-navy-700" />,
      color: 'border-navy-500 hover:bg-navy-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-navy-100">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-navy-800" />
              <span className="ml-2 text-xl font-bold text-gray-900">PropManager</span>
            </div>
            
            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-navy-800 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="bg-navy-800 hover:bg-navy-900 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Modern Property
            <span className="text-navy-800"> Management</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your property management with our comprehensive platform. 
            Handle rent collection, tenant communication, and property maintenance all in one place.
          </p>
          
          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            {userRoles.map((roleOption) => (
              <div
                key={roleOption.role}
                onClick={() => handleRoleSelection(roleOption.role)}
                className={`
                  p-8 bg-white rounded-xl border-2 cursor-pointer transition-all duration-200 
                  ${roleOption.color} ${selectedRole === roleOption.role ? 'ring-2 ring-navy-800 ring-offset-2' : ''}
                `}
              >
                <div className="flex flex-col items-center text-center">
                  {roleOption.icon}
                  <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
                    {roleOption.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {roleOption.description}
                  </p>
                  <button className="flex items-center text-navy-800 font-medium hover:text-navy-900">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools you need for efficient property management
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {feature.description}
                </p>
                
                {/* Feature Benefits */}
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-navy-600 mr-2" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Built with Modern Technology
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Technology badges */}
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg shadow-sm mb-2">
                <span className="text-2xl">⚛️</span>
              </div>
              <span className="text-sm font-medium text-gray-700">React</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg shadow-sm mb-2">
                <span className="text-2xl">🐍</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Flask</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg shadow-sm mb-2">
                <span className="text-2xl">💳</span>
              </div>
              <span className="text-sm font-medium text-gray-700">M-Pesa</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg shadow-sm mb-2">
                <Shield className="h-8 w-8 text-navy-700" />
              </div>
              <span className="text-sm font-medium text-gray-700">Secure</span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-navy-100 mb-8 max-w-2xl mx-auto">
            Join thousands of landlords and tenants who trust PropManager for their property management needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-navy-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-navy-800 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Building2 className="h-8 w-8 text-navy-400" />
              <span className="ml-2 text-xl font-bold">PropManager</span>
            </div>
            
            <div className="text-gray-400 text-sm">
              © 2024 PropManager. Built for Moringa School Capstone Project.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;