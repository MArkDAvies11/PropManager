import React, { useState, useEffect } from 'react';
import { MessageCircle, User, Clock } from 'lucide-react';
import RealTimeChat from './RealTimeChat';

const TenantChatList = ({ userRole }) => {
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      // Fetch all users with tenant role
      const usersResponse = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        const tenantUsers = usersData.users?.filter(user => user.role === 'tenant') || [];
        
        // For each tenant, get their latest message
        const tenantsWithMessages = await Promise.all(
          tenantUsers.map(async (tenant) => {
            try {
              const messagesResponse = await fetch(`http://localhost:5000/api/messages/1`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (messagesResponse.ok) {
                const messagesData = await messagesResponse.json();
                const tenantMessages = messagesData.messages?.filter(
                  msg => msg.sender_id === tenant.id || msg.receiver_id === tenant.id
                ) || [];
                
                const lastMessage = tenantMessages[tenantMessages.length - 1];
                
                return {
                  id: tenant.id,
                  name: `${tenant.first_name} ${tenant.last_name}`,
                  email: tenant.email,
                  property: 'Property Unit', // You can enhance this with actual property data
                  lastMessage: lastMessage?.content || 'No messages yet',
                  lastMessageTime: lastMessage ? new Date(lastMessage.timestamp).toLocaleTimeString() : '',
                  unreadCount: 0, // You can implement unread logic
                  isOnline: Math.random() > 0.5 // Random for demo, implement real online status
                };
              }
              
              return {
                id: tenant.id,
                name: `${tenant.first_name} ${tenant.last_name}`,
                email: tenant.email,
                property: 'Property Unit',
                lastMessage: 'No messages yet',
                lastMessageTime: '',
                unreadCount: 0,
                isOnline: false
              };
            } catch (error) {
              console.error('Error fetching messages for tenant:', error);
              return {
                id: tenant.id,
                name: `${tenant.first_name} ${tenant.last_name}`,
                email: tenant.email,
                property: 'Property Unit',
                lastMessage: 'No messages yet',
                lastMessageTime: '',
                unreadCount: 0,
                isOnline: false
              };
            }
          })
        );
        
        setTenants(tenantsWithMessages);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  if (selectedTenant) {
    return (
      <div className="bg-white rounded-lg shadow">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedTenant(null)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Back to Tenant List
            </button>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{selectedTenant.name}</h3>
                <p className="text-xs text-gray-500">{selectedTenant.property}</p>
              </div>
              {selectedTenant.isOnline && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                  Online
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Real-time Chat */}
        <div className="h-96">
          <RealTimeChat 
            propertyId={selectedTenant.id} 
            receiverId={selectedTenant.id}
            tenantName={selectedTenant.name}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <MessageCircle className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="font-semibold text-gray-900">Tenant Messages</h3>
          <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
            {tenants.reduce((sum, tenant) => sum + tenant.unreadCount, 0)} unread
          </span>
        </div>
      </div>

      {/* Tenant List */}
      <div className="divide-y divide-gray-200">
        {tenants.map((tenant) => (
          <div
            key={tenant.id}
            onClick={() => setSelectedTenant(tenant)}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className="relative">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  {tenant.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                  )}
                </div>
                
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">{tenant.name}</h4>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">{tenant.lastMessageTime}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-1">{tenant.property}</p>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate flex-1 mr-2">
                      {tenant.lastMessage}
                    </p>
                    {tenant.unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {tenant.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading tenants...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && tenants.length === 0 && (
        <div className="p-8 text-center">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-gray-900 mb-2">No tenant messages</h3>
          <p className="text-sm text-gray-500">
            When tenants send you messages, they'll appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default TenantChatList;