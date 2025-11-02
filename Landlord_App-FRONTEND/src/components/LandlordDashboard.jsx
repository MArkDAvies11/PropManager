import React, { useState } from 'react';
import { Building2, Plus, DollarSign, Users, TrendingUp, ArrowLeft, MessageCircle, Edit, Trash2, Eye } from 'lucide-react';
import PropertyForm from './PropertyForm.jsx';
import Chat from './Chat.jsx';
import UnitsView from './UnitsView.jsx';
import UnitDetail from './UnitDetail.jsx';

const LandlordDashboard = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [viewingUnits, setViewingUnits] = useState(null);
  const [viewingUnit, setViewingUnit] = useState(null);
  const [properties, setProperties] = useState([
    {
      id: 1,
      name: 'Sunset Apartments',
      address: '123 Main St, Nairobi',
      units: 12,
      occupiedUnits: 10,
      monthlyRent: 25000,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'
    },
    {
      id: 2,
      name: 'Garden View Complex',
      address: '456 Oak Ave, Nairobi',
      units: 8,
      occupiedUnits: 7,
      monthlyRent: 30000,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'
    }
  ]);

  const [payments, setPayments] = useState([
    { id: 1, tenant: 'John Doe', property: 'Sunset Apartments', amount: 25000, status: 'paid', date: '2024-01-15', unit: 'A1' },
    { id: 2, tenant: 'Jane Smith', property: 'Garden View Complex', amount: 30000, status: 'pending', date: '2024-01-10', unit: 'B2' },
    { id: 3, tenant: 'Mike Johnson', property: 'Sunset Apartments', amount: 25000, status: 'overdue', date: '2024-01-05', unit: 'A3' }
  ]);

  const totalRevenue = properties.reduce((sum, prop) => sum + (prop.monthlyRent * prop.occupiedUnits), 0);
  const totalUnits = properties.reduce((sum, prop) => sum + prop.units, 0);
  const occupiedUnits = properties.reduce((sum, prop) => sum + prop.occupiedUnits, 0);
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'overdue').length;

  const handleAddProperty = (propertyData) => {
    const newProperty = {
      id: Date.now(),
      ...propertyData,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'
    };
    setProperties([...properties, newProperty]);
    setShowPropertyForm(false);
  };

  const handleEditProperty = (propertyData) => {
    setProperties(properties.map(p => p.id === editingProperty.id ? { ...editingProperty, ...propertyData } : p));
    setEditingProperty(null);
    setShowPropertyForm(false);
  };

  const handleDeleteProperty = (id) => {
    setProperties(properties.filter(p => p.id !== id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (showPropertyForm) {
    return (
      <PropertyForm
        property={editingProperty}
        onSubmit={editingProperty ? handleEditProperty : handleAddProperty}
        onCancel={() => {
          setShowPropertyForm(false);
          setEditingProperty(null);
        }}
      />
    );
  }

  if (viewingUnit) {
    return (
      <UnitDetail
        unit={viewingUnit}
        property={viewingUnits}
        onBack={() => setViewingUnit(null)}
      />
    );
  }

  if (viewingUnits) {
    return (
      <UnitsView
        property={viewingUnits}
        onBack={() => setViewingUnits(null)}
        onViewUnit={(unit) => setViewingUnit(unit)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Landlord Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPropertyForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-8 mb-8 border-b">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'properties', label: 'Properties' },
            { id: 'payments', label: 'Payments' },
            { id: 'chat', label: 'Messages' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Properties</p>
                    <p className="text-2xl font-semibold text-gray-900">{properties.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                    <p className="text-2xl font-semibold text-gray-900">{occupancyRate}%</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">KSh {totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                    <p className="text-2xl font-semibold text-gray-900">{pendingPayments}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Properties */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">Recent Properties</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.slice(0, 3).map(property => (
                    <div key={property.id} className="border rounded-lg overflow-hidden">
                      <img src={property.image} alt={property.name} className="w-full h-48 object-cover" />
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900">{property.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{property.address}</p>
                        <div className="flex justify-between text-sm">
                          <span>Units: {property.occupiedUnits}/{property.units}</span>
                          <span className="font-medium">KSh {property.monthlyRent.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">All Properties</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map(property => (
                  <div key={property.id} className="border rounded-lg overflow-hidden">
                    <img src={property.image} alt={property.name} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{property.name}</h4>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setViewingUnits(property)}
                            className="p-1 text-gray-400 hover:text-green-600"
                            title="View Units"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingProperty(property);
                              setShowPropertyForm(true);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProperty(property.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{property.address}</p>
                      <div className="flex justify-between text-sm">
                        <span>Units: {property.occupiedUnits}/{property.units}</span>
                        <span className="font-medium">KSh {property.monthlyRent.toLocaleString()}</span>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(property.occupiedUnits / property.units) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.round((property.occupiedUnits / property.units) * 100)}% occupied
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Payment History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map(payment => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.tenant}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.property}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.unit}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">KSh {payment.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <Chat userRole="landlord" />
        )}
      </div>
    </div>
  );
};

export default LandlordDashboard;