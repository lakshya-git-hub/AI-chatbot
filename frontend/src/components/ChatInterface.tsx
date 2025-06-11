import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export default function ChatInterface() {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showChatbotNameModal, setShowChatbotNameModal] = useState(false);
  const [newChatbotName, setNewChatbotName] = useState('');
  const { messages, sendMessage, rateMessage, loading, error, loadMoreMessages, isGenerating } = useChat();
  const { user, logout, token, updateUserChatbotName } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user?.chatbotName) {
      setNewChatbotName(user.chatbotName);
    }
  }, [user?.chatbotName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
      setIsTyping(false);
    }
  };

  const handleRate = async (messageId: string, rating: number) => {
    await rateMessage(messageId, rating);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleLoadMore = async () => {
    if (hasMore && !loading) {
      const success = await loadMoreMessages(page + 1);
      if (success) {
        setPage(page + 1);
      }
    }
  };

  const handleSaveChatbotName = async () => {
    if (!newChatbotName.trim()) {
      alert('Chatbot name cannot be empty.');
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/settings/chatbot-name`,
        { chatbotName: newChatbotName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      updateUserChatbotName(response.data.chatbotName);
      setShowChatbotNameModal(false);
    } catch (err: any) {
      console.error('Error updating chatbot name:', err);
      alert(`Failed to update chatbot name: ${err.response?.data?.error || err.message}`);
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: 'var(--primary-accent)' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <div className="shadow-lg p-4 flex justify-between items-center" style={{ backgroundColor: 'var(--primary-accent)' }}>
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-lg font-bold" style={{ backgroundColor: 'var(--secondary-accent)' }}>
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold text-white text-lg cursor-pointer" onClick={() => setShowChatbotNameModal(true)}>
            {user?.chatbotName || 'AI Chatbot'}
          </span>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm text-white rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all hover:bg-white/30 focus:ring-white"
        >
          Logout
        </button>
      </div>

      {/* Chatbot Name Edit Modal */}
      {showChatbotNameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-6 rounded-lg shadow-xl w-80" style={{ backgroundColor: 'var(--background)' }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--foreground)' }}>Edit Chatbot Name</h2>
            <input
              type="text"
              value={newChatbotName}
              onChange={(e) => setNewChatbotName(e.target.value)}
              className="w-full p-2 mb-4 rounded-md focus:outline-none focus:ring-2"
              style={{ backgroundColor: 'var(--secondary-accent)', borderColor: 'var(--border-color)', color: 'var(--foreground)' }}
              placeholder="Enter new chatbot name"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowChatbotNameModal(false)}
                className="px-4 py-2 text-white rounded-md transition-colors hover:bg-[var(--primary-accent)]"
                style={{ backgroundColor: 'var(--foreground)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChatbotName}
                className="px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors hover:bg-[var(--foreground)] focus:ring-[var(--primary-accent)]"
                style={{ backgroundColor: 'var(--primary-accent)' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {hasMore && (
          <div className="flex justify-center mb-4">
            <button
              onClick={handleLoadMore}
              className="px-4 py-2 text-sm focus:outline-none transition-colors hover:text-[var(--foreground)]"
              style={{ color: 'var(--primary-accent)' }}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${msg.isAI ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[70%] rounded-xl p-4 shadow-md ${msg.isAI ? 'rounded-bl-none' : 'rounded-br-none'}`}
              style={{ backgroundColor: msg.isAI ? 'var(--secondary-accent)' : 'var(--primary-accent)', color: msg.isAI ? 'var(--foreground)' : 'white' }}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
              {msg.isAI && (
                <div className="flex items-center mt-2 space-x-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRate(msg._id, rating)}
                      className="focus:outline-none text-yellow-400 hover:text-yellow-500 transition-colors"
                    >
                      {msg.rating && msg.rating >= rating ? (
                        <StarIcon className="h-4 w-4" />
                      ) : (
                        <StarOutlineIcon className="h-4 w-4 opacity-50" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex justify-start">
            <div className="rounded-xl p-4 shadow-md" style={{ backgroundColor: 'var(--secondary-accent)' }}>
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--primary-accent)' }}></div>
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '0.2s', backgroundColor: 'var(--primary-accent)' }}></div>
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '0.4s', backgroundColor: 'var(--primary-accent)' }}></div>
              </div>
              <p className="text-sm mt-2" style={{ color: 'var(--foreground)' }}>AI is generating...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-color)' }}>
        <div className="relative flex items-center w-full">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white text-lg font-bold z-10" style={{ backgroundColor: 'var(--primary-accent)' }}>
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <input
            type="text"
            value={message}
            onChange={handleMessageChange}
            placeholder="Type your message..."
            className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 pl-14 pr-4"
            style={{ backgroundColor: 'var(--secondary-accent)', borderColor: 'var(--border-color)', color: 'var(--foreground)' }}
          />
          <button
            type="submit"
            className="ml-4 px-6 py-3 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all hover:bg-[var(--foreground)] focus:ring-[var(--primary-accent)]"
            style={{ backgroundColor: 'var(--primary-accent)' }}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
} 