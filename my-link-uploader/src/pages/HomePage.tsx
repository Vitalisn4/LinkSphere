"use client"

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            Welcome to LinkSphere
          </h1>
          <p className={`text-xl mb-8 ${
            isDark ? "text-gray-300" : "text-gray-600"
          }`}>
            Your personal link management platform
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 