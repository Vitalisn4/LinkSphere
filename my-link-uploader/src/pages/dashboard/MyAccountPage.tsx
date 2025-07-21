"use client"

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export default function MyAccountPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className={`rounded-lg p-6 ${
        isDark ? "bg-gray-800" : "bg-white"
      } shadow-lg`}>
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-500 shadow-lg">
            <span className="text-4xl font-bold text-white">
              {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              My Account
            </h1>
            <p className={`text-lg font-bold ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}>
              Manage your account settings
            </p>
          </div>
        </div>

          <div className="space-y-6">
            <div>
            <label className={`block text-sm font-medium ${
              isDark ? "text-gray-300" : "text-gray-700"
            } mb-2`}>
              Username
            </label>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {user?.username}
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium ${
              isDark ? "text-gray-300" : "text-gray-700"
            } mb-2`}>
              Email
            </label>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 