"use client"

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { User } from 'lucide-react';

export default function MyAccountPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className={`rounded-lg p-6 ${
        isDark ? "bg-gray-800" : "bg-white"
      } shadow-lg`}>
        <div className="flex items-center space-x-4 mb-6">
          <User size={48} className={isDark ? "text-gray-300" : "text-gray-700"} />
          <div>
            <h1 className={`text-2xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}>
              My Account
            </h1>
            <p className={`${
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
            <p className={`${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}>
              {user?.username}
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium ${
              isDark ? "text-gray-300" : "text-gray-700"
            } mb-2`}>
              Email
            </label>
            <p className={`${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}>
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 