import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import RealTimeChat from './RealTimeChat';
import TenantChatList from './TenantChatList';
import io from 'socket.io-client';
import { 
  Building2, 
  Users, 
  CreditCard, 
  TrendingUp,
  Calendar,
  Bell,
  LogOut
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  
  const [stats, setStats] = useState({
    properties: 0,
    tenants: 0,
    monthlyRevenue: 0,
    pendingPayments: 0
  });

  useEffect(() => {
    if (user?.role === 'landlord') {
      fetchLandlordStats();
    } else if (user?.role === 'tenant') {
      setStats({
        rentDue: 20000,
        nextPaymentDate: '2024-02-01',
        messagesUnread: 2,
        maintenanceRequests: 1
      });
    }
  }, [user]);

  const fetchLandlordStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        logout();
        return;
      }
      
      const [countResponse, paymentsResponse] = await Promise.all([
        fetch('http://localhost:5000/api/users/count', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/payments', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      if (countResponse.status === 401 || paymentsResponse.status === 401) {
        logout();
        window.location.href = '/login';
        return;
      }
      
      const countData = await countResponse.json();
      const paymentsData = await paymentsResponse.json();
      
      const completedPayments = paymentsData.payments?.filter(p => p.status === 'completed') || [];
      const monthlyRevenue = completedPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      setStats(prev => ({
        ...prev,
        properties: 5,
        tenants: countData.count || 0,
        monthlyRevenue: monthlyRevenue,
        pendingPayments: 3
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const LandlordDashboard = () => {
    const [notifications, setNotifications] = useState([]);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [showTenantsModal, setShowTenantsModal] = useState(false);
    const [tenants, setTenants] = useState([]);
    const [tenantPayments, setTenantPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetchPayments();
      fetchTenants();
    }, []);

    const fetchTenants = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('http://localhost:5000/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setTenants(data.users || []);
        }
      } catch (error) {
        console.error('Error fetching tenants:', error);
      }
    };

    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        const response = await fetch('http://localhost:5000/api/payments', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.status === 401) {
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        
        if (data.payments) {
          const formattedPayments = data.payments.map(payment => ({
            id: payment.id,
            name: payment.tenant ? `${payment.tenant.first_name} ${payment.tenant.last_name}` : 'Unknown',
            houseNumber: payment.tenant ? payment.tenant.house_number : 'N/A',
            property: payment.property ? payment.property.name : 'N/A',
            amount: payment.amount,
            status: payment.status,
            paidDate: payment.status === 'completed' ? payment.payment_date : null,
            dueDate: payment.payment_date,
            daysOverdue: payment.status === 'failed' ? Math.floor((new Date() - new Date(payment.payment_date)) / (1000 * 60 * 60 * 24)) : 0
          }));
          setTenantPayments(formattedPayments);
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Socket.IO disabled - using polling for updates instead
    // useEffect(() => {
    //   Real-time notifications disabled
    // }, []);
    
    useEffect(() => {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }, []);
    
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-navy-800 to-navy-900 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.first_name} {user?.last_name}!
          </h1>
          <p className="text-navy-100">
            Here's an overview of your property portfolio
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            className="bg-white p-6 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setShowTenantsModal(true)}
          >
            <div className="flex items-center">
              <Users className="h-8 w-8 text-navy-700" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tenants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tenants}/15</p>
                <p className="text-xs text-gray-500 mt-1">Click to view details</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-navy-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.monthlyRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white p-6 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setShowPendingModal(true)}
          >
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-red-600">{tenantPayments.filter(t => t.status === 'pending' || t.status === 'failed').length}</p>
                <p className="text-xs text-gray-500 mt-1">Click to view details</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h2>
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <CreditCard className="h-5 w-5 text-green-700 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Payment Received</p>
                    <p className="text-xs text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-500">Transaction: {notification.transaction_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-700">KSh {notification.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Just now</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No recent payments</p>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tenant Payment Status</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading payments...</p>
            </div>
          ) : tenantPayments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No payment records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">House No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tenantPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">{payment.houseNumber || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{payment.property}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(payment.amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.status === 'completed' && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Paid
                        </span>
                      )}
                      {payment.status === 'pending' && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                      {payment.status === 'failed' && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Failed {payment.daysOverdue > 0 ? `(${payment.daysOverdue}d ago)` : ''}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {payment.status === 'completed' ? `Paid: ${new Date(payment.paidDate).toLocaleDateString()}` : new Date(payment.dueDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tenant Communications</h2>
          <TenantChatList userRole="landlord" />
        </div>

        {showTenantsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">All Tenants ({tenants.length}/15)</h3>
                <button
                  onClick={() => setShowTenantsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
              
              {tenants.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No tenants registered yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tenants.map((tenant) => (
                    <div key={tenant.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded">
                              {tenant.house_number}
                            </span>
                            <h4 className="font-semibold text-gray-900">
                              {tenant.first_name} {tenant.last_name}
                            </h4>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-600">
                              <span className="font-medium">Email:</span> {tenant.email}
                            </p>
                            {tenant.phone_number && (
                              <p className="text-gray-600">
                                <span className="font-medium">Phone:</span> {tenant.phone_number}
                              </p>
                            )}
                            <p className="text-gray-600">
                              <span className="font-medium">Rent:</span> KES 20,000/month
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {showPendingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Outstanding Payments</h3>
                <button
                  onClick={() => setShowPendingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {tenantPayments.filter(t => t.status === 'pending' || t.status === 'failed').length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No outstanding payments</p>
                  </div>
                ) : tenantPayments.filter(t => t.status === 'pending' || t.status === 'failed').map((payment) => (
                  <div key={payment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">{payment.houseNumber}</span>
                          <h4 className="font-semibold text-gray-900 text-lg">{payment.name}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{payment.property}</p>
                        <div className="mt-2 flex items-center space-x-4">
                          <span className="text-sm text-gray-500">Date: {new Date(payment.dueDate).toLocaleDateString()}</span>
                          {payment.status === 'failed' && payment.daysOverdue > 0 && (
                            <span className="text-sm font-semibold text-red-600">
                              {payment.daysOverdue} days ago
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(payment.amount)}</p>
                        <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${
                          payment.status === 'failed' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status === 'failed' ? 'Failed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Outstanding:</span>
                  <span className="text-2xl font-bold text-red-600">
                    {formatCurrency(tenantPayments.filter(t => t.status === 'pending' || t.status === 'failed').reduce((sum, p) => sum + p.amount, 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const TenantDashboard = () => {
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    
    const handlePayRent = () => {
      setShowPaymentModal(true);
    };
    
    const handlePaymentSubmit = async (e) => {
      e.preventDefault();
      if (!phoneNumber) {
        alert('Please enter your phone number');
        return;
      }
      
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          alert('Please log in again');
          return;
        }
        
        const response = await fetch('http://localhost:5000/api/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            property_id: 1,
            amount: 20000,
            phone_number: phoneNumber,
            payment_method: 'mpesa'
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          alert('STK Push sent! Please check your phone and enter your M-Pesa PIN.');
          setShowPaymentModal(false);
          setPhoneNumber('');
        } else {
          alert(data.error || 'Payment failed. Please try again.');
        }
      } catch (error) {
        console.error('Payment error:', error);
        alert('Payment failed. Please check your connection and try again.');
      }
    };
    
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-navy-700 to-navy-900 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.first_name} {user?.last_name}!
          </h1>
          <p className="text-navy-100">
            Manage your tenancy and payments easily
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Rent Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-navy-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-navy-800" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Amount Due</p>
                  <p className="text-2xl font-bold text-navy-800">
                    {formatCurrency(20000)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-navy-100 p-4 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-navy-700" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Due Date</p>
                  <p className="text-2xl font-bold text-navy-700">Feb 1, 2024</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button 
              onClick={handlePayRent}
              className="w-full bg-navy-800 hover:bg-navy-900 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Pay Rent via M-Pesa
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-navy-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">January 2024</p>
                <p className="text-xs text-gray-600">Paid on Jan 1, 2024</p>
              </div>
              <span className="text-sm font-semibold text-navy-700">
                {formatCurrency(20000)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-navy-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">December 2023</p>
                <p className="text-xs text-gray-600">Paid on Dec 1, 2023</p>
              </div>
              <span className="text-sm font-semibold text-navy-700">
                {formatCurrency(20000)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Chat with Landlord</h2>
          <RealTimeChat propertyId={1} receiverId={1} />
        </div>
        
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Enter Phone Number</h3>
              <form onSubmit={handlePaymentSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    M-Pesa Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0712345678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your Safaricom number to receive payment prompt
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-navy-800 text-white py-2 px-4 rounded-lg hover:bg-navy-900 transition-colors"
                  >
                    Send STK Push
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-navy-800" />
              <span className="ml-2 text-xl font-bold text-gray-900">PropManager</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {user?.role === 'landlord' ? <LandlordDashboard /> : <TenantDashboard />}
      </main>
    </div>
  );
};

export default Dashboard;