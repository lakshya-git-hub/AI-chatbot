import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import axios, { AxiosError } from 'axios';
import { useAuth } from './AuthContext';

interface Message {
  _id: string;
  content: string;
  isAI: boolean;
  rating?: number;
  createdAt: string;
}

interface ChatContextType {
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  rateMessage: (messageId: string, rating: number) => Promise<void>;
  loadMoreMessages: (page: number) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  isGenerating: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { token, user } = useAuth();

  // Initialize WebSocket connection
  useEffect(() => {
    if (token && user) {
      const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket');
      });

      newSocket.on('chat response', (data: { userMessage: Message; aiMessage: Message }) => {
        setMessages(prev => {
          const filteredPrev = prev.filter(msg => !msg._id.startsWith('temp-'));
          return [...filteredPrev, data.userMessage, data.aiMessage];
        });
        setIsGenerating(false);
      });

      newSocket.on('error', (err: unknown) => {
        console.error('WebSocket error:', err);
        if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
          setError(err.message);
        } else {
          setError('An unknown WebSocket error occurred.');
        }
        setIsGenerating(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [token, user]);

  // Fetch chat history
  useEffect(() => {
    const fetchHistory = async () => {
      if (token) {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          setMessages(response.data.messages);
        } catch (err: unknown) {
          console.error('Error fetching chat history:', err);
          if (axios.isAxiosError(err)) {
            setError(err.response?.data?.error || err.message || 'Failed to fetch chat history');
          } else if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('Failed to fetch chat history: An unknown error occurred.');
          }
        } finally {
          setLoading(false);
        }
      }
    };

    fetchHistory();
  }, [token]);

  const fetchMessages = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err: unknown) {
      console.error('Error fetching messages:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message || 'Error fetching messages');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error fetching messages: An unknown error occurred.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    console.log('Attempting to send message...');
    console.log('Socket:', socket);
    console.log('User:', user);
    if (!socket || !user) {
      console.error('Socket not connected or user not authenticated. Cannot send message.');
      setError('Socket not connected or user not authenticated');
      return;
    }
    try {
      setLoading(true);
      setIsGenerating(true);

      // Optimistically add user message to state
      const tempUserMessage = {
        _id: 'temp-' + Date.now(), // Temporary ID
        content,
        isAI: false,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, tempUserMessage]);

      // Emit message via Socket.io
      console.log('Emitting chat message via socket...');
      socket.emit('chat message', { userId: user._id, content });
      // Messages will be added to state by the 'chat response' listener (including the actual user message with real ID)
      console.log('Message emitted.');
    } catch (err: unknown) {
      console.error('Error sending message via socket:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message || 'Error sending message via socket');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error sending message via socket: An unknown error occurred.');
      }
      setIsGenerating(false);
    } finally {
      setLoading(false);
    }
  };

  const rateMessage = async (messageId: string, rating: number) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/rate`, { messageId, rating }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, rating } : msg
        )
      );
    } catch (err: unknown) {
      console.error('Error rating message:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message || 'Error rating message');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error rating message: An unknown error occurred.');
      }
    }
  };

  const loadMoreMessages = async (page: number): Promise<boolean> => {
    const data = await fetchMessages(page);
    if (data) {
      setMessages((prev) => [...data.messages, ...prev]);
      return data.pagination.hasMore;
    }
    return false;
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        rateMessage,
        loadMoreMessages,
        loading,
        error,
        isGenerating,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
} 