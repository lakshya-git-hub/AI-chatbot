'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import ChatInterface from '../components/ChatInterface';

export default function Home() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-md mx-auto pt-8">
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => setShowLogin(true)}
              className={`px-4 py-2 rounded-lg ${
                showLogin
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setShowLogin(false)}
              className={`px-4 py-2 rounded-lg ${
                !showLogin
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              Register
            </button>
          </div>
          {showLogin ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    );
  }

  return <ChatInterface />;
} 