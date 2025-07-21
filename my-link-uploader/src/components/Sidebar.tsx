import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, LayoutDashboard, Upload, User, LinkIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = user ? [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/dashboard/upload', label: 'Upload', icon: <Upload size={20} /> },
    { path: '/dashboard/my-account', label: 'My Account', icon: <User size={20} /> },
  ] : [];

  return (
    <aside className={`h-screen sticky top-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col p-6 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo */}
      <div className="mb-4 flex flex-col items-center">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center justify-center group">
          <div className={`transition-all duration-300 ${collapsed ? 'w-10 h-10' : 'w-10 h-10 mr-0' } bg-gradient-to-br from-purple-500 to-pink-400 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20`}>
            <LinkIcon size={20} className="text-white" />
          </div>
          {!collapsed && (
            <h1 className="ml-3 text-xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              LinkSphere
            </h1>
          )}
        </Link>
        {/* Collapse Button */}
        <button
          className="mt-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col space-y-2 items-center">
        {navLinks.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center ${collapsed ? 'justify-center' : ''} space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
              isActive(link.path)
                ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {link.icon}
            {!collapsed && <span>{link.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
