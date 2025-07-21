import React from 'react';
import { Bell } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
      <div className="w-full px-4 sm:px-6 py-3 flex items-center justify-end">
        {/* Right: Search, Notifications, Profile */}
        <div className="flex items-center flex-1 justify-end space-x-4">
          {/* Search Bar */}
          <div className="hidden md:block">
            <input
              type="text"
              placeholder="Search links..."
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all w-56"
            />
          </div>
          {/* Notifications Bell */}
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Bell size={22} className="text-gray-500 dark:text-gray-300" />
          </button>
          {/* Profile Dropdown */}
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}
