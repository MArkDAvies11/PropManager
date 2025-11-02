import React, { useState } from 'react';
import { ArrowLeft, Users, CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react';

const UnitsView = ({ property, onBack, onViewUnit }) => {
  // Generate units for the property
  const generateUnits = (totalUnits, occupiedUnits) => {
    const units = [];
    for (let i = 1; i <= totalUnits; i++) {
      const unitNumber = `${String.fromCharCode(65 + Math.floor((i-1)/4))}${((i-1)%4)+1}`;
      const isOccupied = i <= occupiedUnits;
      units.push({
        id: i,
        number: unitNumber,
        tenant: isOccupied ? `Tenant ${i}` : null,
        status: isOccupied ? 'occupied' : 'vacant',
        rent: property.monthlyRent,
        paymentStatus: isOccupied ? (Math.random() > 0.3 ? 'paid' : Math.random() > 0.5 ? 'pending' : 'overdue') : null
      });
    }
    return units;
  };

  const [units] = useState(generateUnits(property.units, property.occupiedUnits));

  const getStatusColor = (status) => {
    switch (status) {
      case 'occupied': return 'bg-green-100 text-green-800';
      case 'vacant': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'overdue': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPaymentIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{property.name}</h1>
                <p className="text-sm text-gray-600">{property.address}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Units Overview</h2>
          <p className="text-gray-600">
            {property.occupiedUnits} of {property.units} units occupied
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {units.map(unit => (
            <div key={unit.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Unit {unit.number}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(unit.status)}`}>
                    {unit.status}
                  </span>
                </div>
                {unit.status === 'occupied' && (
                  <button
                    onClick={() => onViewUnit(unit)}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                )}
              </div>

              {unit.status === 'occupied' ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Tenant:</strong> {unit.tenant}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Rent:</strong> KSh {unit.rent.toLocaleString()}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className={`flex items-center space-x-1 text-sm ${getPaymentStatusColor(unit.paymentStatus)}`}>
                      {getPaymentIcon(unit.paymentStatus)}
                      <span className="capitalize">{unit.paymentStatus}</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">Available for rent</p>
                  <p className="text-lg font-semibold text-gray-900">KSh {unit.rent.toLocaleString()}/month</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UnitsView;