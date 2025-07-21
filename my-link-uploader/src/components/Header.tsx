import React, { useRef, useState } from 'react';
import { Bell, Search } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import { useTheme } from '../hooks/useTheme';
import { useSearch } from '../contexts/search';

export default function Header() {
  const { query, setQuery } = useSearch();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { isDark } = useTheme();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
      <div className="w-full px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Centered Wide Search Bar */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-3xl">
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search links by title or description..."
              className={`w-full px-6 py-4 rounded-2xl transition-all duration-300
                ${isDark
                  ? 'bg-gray-800/50 text-white placeholder-gray-500 focus:bg-gray-800'
                  : 'bg-gray-100/50 text-gray-900 placeholder-gray-400 focus:bg-white'
                }
                ${isSearchFocused
                  ? isDark
                    ? 'shadow-lg shadow-purple-500/10'
                    : 'shadow-lg shadow-purple-500/5'
                  : ''
                }
              `}
            />
            <Search
              className={`absolute right-6 top-1/2 transform -translate-y-1/2 ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}
              size={20}
            />
          </div>
        </div>
        {/* Right: Notifications, Profile */}
        <div className="flex items-center space-x-4 ml-4">
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Bell size={22} className="text-gray-500 dark:text-gray-300" />
          </button>
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}
