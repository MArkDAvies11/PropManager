import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { propertyService } from '../services/propertyService';
import { paymentService } from '../services/paymentService';
import StatsCard from '../components/common/StatsCard';
import PropertyList from '../components/properties/PropertyList';
import { Home, DollarSign, TrendingUp, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [propertiesRes, paymentsRes] = await Promise.all([
        propertyService.getProperties(),
        paymentService.getPayments()
      ]);
      setProperties(propertiesRes.properties);
      setPayments(paymentsRes.payments);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const userProperties = properties.filter(property => 
    user.profile.role === 'landlord' 
      ? property.landlord_id === user.profile.id
      : property.tenant_id === user.profile.id
  );

  const recentPayments = payments.slice(0, 5);
  const totalRevenue = userProperties.reduce((sum, property) => sum + (property.monthly_rent || 0), 0);
  const pendingPayments = payments.filter(p => p.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.first_name}!
            </h1>
            <p className="mt-2 text-gray-600">
              {user.profile.role === 'landlord' 
                ? 'Manage your rental properties and tenants'
                : 'View your rental information and make payments'
              }
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatsCard
              title="Total Properties"
              value={userProperties.length}
              icon={Home}
            />
            <StatsCard
              title="Monthly Revenue"
              value={`$${totalRevenue.toLocaleString()}`}
              icon={DollarSign}
            />
            <StatsCard
              title="Pending Payments"
              value={pendingPayments}
              icon={Calendar}
            />
            <StatsCard
              title="Occupancy Rate"
              value={`${((userProperties.filter(p => p.status === 'occupied').length / userProperties.length) * 100 || 0).toFixed(1)}%`}
              icon={TrendingUp}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Properties */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Your Properties
                </h3>
                <PropertyList 
                  properties={userProperties.slice(0, 3)} 
                  loading={loading}
                />
                {userProperties.length > 3 && (
                  <div className="mt-4 text-center">
                    <Link
                      to="/properties"
                      className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                    >
                      View all properties
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Payments */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Recent Payments
                </h3>
                {recentPayments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No payments found</p>
                ) : (
                  <div className="space-y-3">
                    {recentPayments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">${payment.amount}</p>
                          <p className="text-sm text-gray-500">
                            {payment.property?.title || 'Property Payment'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {payment.status}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            Due {new Date(payment.due_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 text-center">
                  <Link
                    to="/payments"
                    className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                  >
                    View all payments
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;