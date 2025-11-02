import React from 'react';
import { DollarSign, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const PaymentCard = ({ payment }) => {
  const getStatusIcon = () => {
    switch (payment.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (payment.status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <DollarSign className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              ${payment.amount}
            </h3>
            <p className="text-sm text-gray-600">
              {payment.property?.title || 'Property Payment'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {payment.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          <span>Due: {new Date(payment.due_date).toLocaleDateString()}</span>
        </div>
        {payment.paid_date && (
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span>Paid: {new Date(payment.paid_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {payment.payment_method && (
        <div className="mt-3 text-sm text-gray-600">
          <span className="font-medium">Method:</span> {payment.payment_method.replace('_', ' ')}
        </div>
      )}

      {payment.notes && (
        <div className="mt-3 text-sm text-gray-600">
          <span className="font-medium">Notes:</span> {payment.notes}
        </div>
      )}
    </div>
  );
};

export default PaymentCard;