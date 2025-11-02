import React from 'react';
import { MessageCircle, User } from 'lucide-react';

const ConversationList = ({ conversations, selectedConversation, onSelectConversation }) => {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No conversations</h3>
        <p className="mt-1 text-sm text-gray-500">Start a new conversation to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={`p-4 rounded-lg cursor-pointer transition-colors ${
            selectedConversation?.id === conversation.id
              ? 'bg-primary-100 border border-primary-300'
              : 'bg-white border border-gray-200 hover:bg-gray-50'
          }`}
          onClick={() => onSelectConversation(conversation)}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {conversation.participant.first_name} {conversation.participant.last_name}
                </p>
                {conversation.last_message_at && (
                  <span className="text-xs text-gray-500">
                    {new Date(conversation.last_message_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              {conversation.last_message && (
                <p className="text-sm text-gray-500 truncate mt-1">
                  {conversation.last_message}
                </p>
              )}
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {conversation.message_count} messages
                </span>
                {conversation.property && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {conversation.property.title}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationList;