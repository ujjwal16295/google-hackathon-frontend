import React, { useRef, useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';

// 1. Chat History Panel Component
export const ChatHistoryPanel = ({ 
  chatSessions, 
  onClose, 
  onOpenChat, 
  onDeleteChat 
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Chat History</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {chatSessions.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">No chat history yet</p>
              <p className="text-gray-500 mt-2">Start asking questions about your contract</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chatSessions.slice().reverse().map((session) => (
                <div
                  key={session.id}
                  onClick={() => onOpenChat(session.id)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 mb-2">
                        {session.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {session.messages.length / 2} exchanges
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(session.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => onDeleteChat(session.id, e)}
                      className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};