"use client"

import { formatInTimeZone } from 'date-fns-tz';
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import ApiService, { Link } from "../../services/api";
import LinkCard from '../../components/LinkCard';

export default function DashboardPage() {
  const [query, setQuery] = useState<string>("")
  const [links, setLinks] = useState<Link[]>([])
  const [filteredLinks, setFilteredLinks] = useState<Link[]>([])
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [, setError] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const auth = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const fetchLinks = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await ApiService.getAllLinks();
      setLinks(data);
      setFilteredLinks(data);
      setError(null);
    } catch (error) {
      if (error instanceof Error && error.message.includes('unauthorized')) {
        navigate('/login');
      } else {
        setError(error instanceof Error ? error.message : 'Failed to fetch links');
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // Handle search
  useEffect(() => {
    if (!links) return; // Guard against null links
    
    const timer = setTimeout(() => {
      if (query) {
        const results = links.filter(
          (link) =>
            link.title.toLowerCase().includes(query.toLowerCase()) ||
            link.description.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredLinks(results);
      } else {
        setFilteredLinks(links);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, links]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  const handleDeleteLink = async (id: string) => {
    try {
      await ApiService.deleteLink(id);
      setLinks((prev) => prev.filter((l) => l.id !== id));
      setFilteredLinks((prev) => prev.filter((l) => l.id !== id));
    } catch (error) {
      console.error('Failed to delete link:', error);
      // Optionally show a toast or error message here
    }
  };

  return (
    <div className="w-full min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className={`text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent`}>
            Welcome back, {auth?.user?.username}!
          </h1>
          <p className={`text-xl ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            Your personal link management dashboard
          </p>
        </motion.div>

        {/* Search Bar */}
        <div className="mb-10">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search links by title or description..."
              className={`
                w-full px-6 py-4 rounded-2xl transition-all duration-300
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

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              Loading links...
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              {query ? "No matching links found" : "No links found"}
            </div>
          ) : (
            filteredLinks.map((link, index) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl ${
                  isDark
                    ? "bg-gray-800/50 border-gray-700 hover:border-purple-500/30"
                    : "bg-gray-100/60 border-gray-200/60 hover:border-purple-400/20"
                }`}
              >
                <LinkCard
                  link={link}
                  currentUser={auth?.user ? { id: auth.user.id, username: auth.user.username } : null}
                  onDelete={handleDeleteLink}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 