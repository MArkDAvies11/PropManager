import React, { useState } from 'react';
import { ArrowLeft, Smartphone, CheckCircle, Loader } from 'lucide-react';

const STKPushPayment = ({ amount, billBreakdown, onSuccess, onCancel }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState('input'); // input, processing, success
  const [paymentReference, setPaymentReference] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentType, setPaymentType] = useState(amount ? 'full' : 'partial');
  
  const finalAmount = paymentType === 'partial' ? parseInt(customAmount) || 0 : amount || billBreakdown?.total || 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }
    if (paymentType === 'partial' && (!customAmount || customAmount <= 0)) {
      alert('Please enter a valid amount');
      return;
    }

    setStep('processing');
    
    // Simulate STK Push processing
    setTimeout(() => {
      const reference = `MP${Date.now()}`;
      setPaymentReference(reference);
      setStep('success');
      
      // Auto-complete after showing success
      setTimeout(() => {
        onSuccess({
          amount: finalAmount,
          phoneNumber,
          reference,
          timestamp: new Date().toISOString(),
          type: paymentType
        });
      }, 2000);
    }, 3000);
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as 254XXXXXXXXX or 07XXXXXXXX
    if (digits.startsWith('254')) {
      return digits.slice(0, 12);
    } else if (digits.startsWith('07') || digits.startsWith('01')) {
      return digits.slice(0, 10);
    }
    return digits.slice(0, 10);
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button onClick={onCancel} className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Smartphone className="h-8 w-8 text-green-600 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">M-Pesa Payment</h1>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          {step === 'input' && (
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Pay with M-Pesa</h2>
                <p className="text-gray-600">Enter your phone number to receive STK push</p>
              </div>

              {/* Bill Breakdown */}
              {billBreakdown && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Bill Breakdown</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Rent:</span>
                      <span>KSh {billBreakdown.rent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Water:</span>
                      <span>KSh {billBreakdown.water.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Electricity:</span>
                      <span>KSh {billBreakdown.electricity.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Maintenance:</span>
                      <span>KSh {billBreakdown.maintenance.toLocaleString()}</span>
                    </div>
                    <hr className="my-1" />
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>KSh {billBreakdown.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Type Selection */}
              {!amount && (
                <div className="mb-4">
                  <div className="flex space-x-4 mb-4">
                    <button
                      type="button"
                      onClick={() => setPaymentType('full')}
                      className={`flex-1 p-3 rounded-lg border-2 ${paymentType === 'full' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                    >
                      <div className="text-center">
                        <p className="font-semibold">Full Payment</p>
                        <p className="text-sm text-gray-600">KSh {billBreakdown?.total.toLocaleString()}</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentType('partial')}
                      className={`flex-1 p-3 rounded-lg border-2 ${paymentType === 'partial' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    >
                      <div className="text-center">
                        <p className="font-semibold">Partial Payment</p>
                        <p className="text-sm text-gray-600">Custom Amount</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Amount Display */}
              <div className="bg-green-50 p-4 rounded-lg mb-6 text-center">
                <p className="text-sm text-gray-600">Amount to Pay</p>
                {paymentType === 'partial' ? (
                  <div>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="text-2xl font-bold text-green-600 bg-transparent border-none text-center w-full focus:outline-none"
                      min="1"
                      max={billBreakdown?.total || amount}
                    />
                    <p className="text-xs text-gray-500">Max: KSh {(billBreakdown?.total || amount)?.toLocaleString()}</p>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-green-600">KSh {finalAmount.toLocaleString()}</p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="0712345678 or 254712345678"
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your Safaricom number to receive payment prompt
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Send STK Push
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  You will receive a payment prompt on your phone. Enter your M-Pesa PIN to complete the transaction.
                </p>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader className="h-8 w-8 text-yellow-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
              <p className="text-gray-600 mb-4">
                Please check your phone for the M-Pesa prompt
              </p>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Phone:</strong> {phoneNumber}
                </p>
                <p className="text-sm text-yellow-800">
                  <strong>Amount:</strong> KSh {finalAmount.toLocaleString()}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Enter your M-Pesa PIN on your phone to complete the payment
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-4">
                Your rent payment has been processed successfully
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Reference:</strong> {paymentReference}
                </p>
                <p className="text-sm text-green-800">
                  <strong>Amount:</strong> KSh {finalAmount.toLocaleString()}
                </p>
                <p className="text-sm text-green-800">
                  <strong>Type:</strong> {paymentType === 'full' ? 'Full Payment' : 'Partial Payment'}
                </p>
                <p className="text-sm text-green-800">
                  <strong>Phone:</strong> {phoneNumber}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                You will receive an SMS confirmation shortly
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default STKPushPayment;