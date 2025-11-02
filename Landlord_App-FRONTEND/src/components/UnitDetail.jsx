import React from 'react';
import { ArrowLeft, User, Home, CreditCard } from 'lucide-react';

const UnitDetail = ({ unit, property, onBack }) => {
  const billBreakdown = {
    rent: property.monthlyRent,
    water: 1500,
    electricity: 2000,
    maintenance: 500,
    total: property.monthlyRent + 1500 + 2000 + 500
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Home className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Unit {unit.number}</h1>
              <p className="text-sm text-gray-600">{property.name}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Unit Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Unit Information</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Tenant</p>
                  <p className="font-medium text-gray-900">{unit.tenant}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Home className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Unit Number</p>
                  <p className="font-medium text-gray-900">{unit.number}</p>
                </div>
              </div>
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <p className={`font-medium capitalize ${
                    unit.paymentStatus === 'paid' ? 'text-green-600' :
                    unit.paymentStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {unit.paymentStatus}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bill Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Bill Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Rent</span>
                <span className="font-medium">KSh {billBreakdown.rent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Water Bill</span>
                <span className="font-medium">KSh {billBreakdown.water.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Electricity</span>
                <span className="font-medium">KSh {billBreakdown.electricity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Maintenance Fee</span>
                <span className="font-medium">KSh {billBreakdown.maintenance.toLocaleString()}</span>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Amount</span>
                <span className="text-blue-600">KSh {billBreakdown.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitDetail;