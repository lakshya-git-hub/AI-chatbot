import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to login: An unknown error occurred.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-800 to-blue-900 animate-gradient-shift">
      <div className="relative max-w-md w-full p-10 bg-white rounded-xl shadow-2xl space-y-8 transform transition-all duration-300 ease-in-out hover:scale-105 animate-fade-in">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900 tracking-tight">
            Welcome Back!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to continue your conversation
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative text-sm" role="alert">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-t-md relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-base transition-all duration-200"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-b-md relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-base transition-all duration-200"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-transform duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 