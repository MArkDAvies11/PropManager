import React, { useState } from 'react';
import { Wrench, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

const MaintenanceRequest = ({ userRole }) => {
  const [requests, setRequests] = useState([
    {
      id: 1,
      title: 'Leaking Faucet',
      description: 'Kitchen faucet is dripping constantly',
      priority: 'medium',
      status: 'pending',
      property: 'Sunset Apartments - A1',
      tenant: 'John Doe',
      created_at: '2024-01-15T10:30:00'
    },
    {
      id: 2,
      title: 'Broken AC',
      description: 'Air conditioning unit not working',
      priority: 'high',
      status: 'in_progress',
      property: 'Garden View - B2',
      tenant: 'Jane Smith',
      created_at: '2024-01-14T14:20:00'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const request = {
      id: Date.now(),
      ...newRequest,
      status: 'pending',
      property: 'Your Property',
      tenant: 'You',
      created_at: new Date().toISOString()
    };
    setRequests([request, ...requests]);
    setNewRequest({ title: '', description: '', priority: 'medium' });
    setShowForm(false);
  };

  const updateStatus = (id, status) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status } : req
    ));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'in_progress': return <Wrench className="h-4 w-4 text-blue-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Maintenance Requests
        </h2>
        {userRole === 'tenant' && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            New Request
          </button>
        )}
      </div>

      {/* New Request Form */}
      {showForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-4">Create Maintenance Request</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={newRequest.title}
                onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newRequest.description}
                onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={newRequest.priority}
                onChange={(e) => setNewRequest({...newRequest, priority: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900">{request.title}</h3>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                  {request.priority.toUpperCase()}
                </span>
                {getStatusIcon(request.status)}
              </div>
            </div>
            <p className="text-gray-600 mb-2">{request.description}</p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{request.property} - {request.tenant}</span>
              <span>{new Date(request.created_at).toLocaleDateString()}</span>
            </div>
            {userRole === 'landlord' && request.status !== 'completed' && (
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => updateStatus(request.id, 'in_progress')}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Start Work
                </button>
                <button
                  onClick={() => updateStatus(request.id, 'completed')}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Mark Complete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaintenanceRequest;