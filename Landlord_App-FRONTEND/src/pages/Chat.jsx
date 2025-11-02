import React, { useState, useEffect } from 'react';
import { chatService } from '../services/chatService';
import ConversationList from '../components/chat/ConversationList';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';
import { MessageCircle } from 'lucide-react';

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      
      // Poll for new messages every 2 seconds
      const interval = setInterval(() => {
        loadMessages(selectedConversation.id);
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      const { conversations } = await chatService.getConversations();
      setConversations(conversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const { messages } = await chatService.getMessages(conversationId);
      setMessages(messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (content) => {
    if (!selectedConversation) return;

    try {
      await chatService.sendMessage(selectedConversation.id, { content });
      await loadMessages(selectedConversation.id);
      await loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <MessageCircle className="h-6 w-6 mr-2" />
                Messages
              </h1>
            </div>
            
            <div className="flex h-[600px]">
              {/* Conversations Sidebar */}
              <div className="w-1/3 border-r border-gray-200">
                <div className="p-4 h-full overflow-y-auto">
                  <ConversationList
                    conversations={conversations}
                    selectedConversation={selectedConversation}
                    onSelectConversation={setSelectedConversation}
                  />
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                  <>
                    <div className="border-b border-gray-200 p-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {selectedConversation.participant.first_name}{' '}
                        {selectedConversation.participant.last_name}
                      </h3>
                      {selectedConversation.property && (
                        <p className="text-sm text-gray-500">
                          About: {selectedConversation.property.title}
                        </p>
                      )}
                    </div>
                    
                    <MessageList messages={messages} />
                    <ChatInput onSendMessage={handleSendMessage} />
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No conversation selected</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Select a conversation from the list to start messaging
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;