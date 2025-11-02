import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle } from 'lucide-react';

const Chat = ({ userRole }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: userRole === 'landlord' ? 'John Doe' : 'Sarah Wilson',
      senderRole: userRole === 'landlord' ? 'tenant' : 'landlord',
      message: 'Hello! I have a question about the rent payment.',
      timestamp: '2024-01-15 10:30',
      isOwn: false
    },
    {
      id: 2,
      sender: userRole === 'landlord' ? 'You' : 'You',
      senderRole: userRole,
      message: 'Hi! Sure, what would you like to know?',
      timestamp: '2024-01-15 10:32',
      isOwn: true
    },
    {
      id: 3,
      sender: userRole === 'landlord' ? 'John Doe' : 'Sarah Wilson',
      senderRole: userRole === 'landlord' ? 'tenant' : 'landlord',
      message: 'Is it possible to pay a few days late this month? I have a temporary cash flow issue.',
      timestamp: '2024-01-15 10:35',
      isOwn: false
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState(userRole === 'landlord' ? 'John Doe' : 'Sarah Wilson');
  const messagesEndRef = useRef(null);

  const contacts = userRole === 'landlord' 
    ? [
        { name: 'John Doe', property: 'Sunset Apartments', unit: 'A1', lastMessage: 'Is it possible to pay a few days late...', time: '10:35', unread: 1 },
        { name: 'Jane Smith', property: 'Garden View Complex', unit: 'B2', lastMessage: 'Thank you for fixing the water issue', time: '09:15', unread: 0 },
        { name: 'Mike Johnson', property: 'Sunset Apartments', unit: 'A3', lastMessage: 'When is the next inspection?', time: 'Yesterday', unread: 2 }
      ]
    : [
        { name: 'Sarah Wilson', role: 'Landlord', lastMessage: 'Hi! Sure, what would you like to know?', time: '10:32', unread: 0 }
      ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      sender: 'You',
      senderRole: userRole,
      message: newMessage,
      timestamp: new Date().toLocaleString(),
      isOwn: true
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Simulate response after 2 seconds
    setTimeout(() => {
      const response = {
        id: Date.now() + 1,
        sender: selectedContact,
        senderRole: userRole === 'landlord' ? 'tenant' : 'landlord',
        message: 'Thank you for your message. I\'ll get back to you soon.',
        timestamp: new Date().toLocaleString(),
        isOwn: false
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow h-96 flex">
      {/* Contacts Sidebar */}
      <div className="w-1/3 border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">
            {userRole === 'landlord' ? 'Tenants' : 'Landlord'}
          </h3>
        </div>
        <div className="overflow-y-auto h-80">
          {contacts.map((contact, index) => (
            <div
              key={index}
              onClick={() => setSelectedContact(contact.name)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedContact === contact.name ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-medium text-gray-900 text-sm">{contact.name}</h4>
                <span className="text-xs text-gray-500">{contact.time}</span>
              </div>
              {userRole === 'landlord' && (
                <p className="text-xs text-gray-500 mb-1">{contact.property} - {contact.unit}</p>
              )}
              {userRole === 'tenant' && contact.role && (
                <p className="text-xs text-gray-500 mb-1">{contact.role}</p>
              )}
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-600 truncate flex-1 mr-2">{contact.lastMessage}</p>
                {contact.unread > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {contact.unread}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <MessageCircle className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="font-semibold text-gray-900">{selectedContact}</h3>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isOwn
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-1 ${
                  message.isOwn ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;