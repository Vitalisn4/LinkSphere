"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Search, ExternalLink, Calendar, User, Clock } from "lucide-react"
import { useAuth } from "../../hooks/useAuth"
import { useTheme } from "../../hooks/useTheme"
import ApiService, { Link } from "../../services/api"
import { useNavigate } from "react-router-dom"
import { formatInTimeZone } from 'date-fns-tz'

export default function DashboardPage() {
  const [query, setQuery] = useState<string>("")
  const [links, setLinks] = useState<Link[]>([])
  const [filteredLinks, setFilteredLinks] = useState<Link[]>([])
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  const handleLinkClick = async (id: string, url: string) => {
    try {
      await ApiService.incrementLinkClick(id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error incrementing click count:', error);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      // Parse the date string directly, it's already in UTC format from the backend
      const date = new Date(dateString);
      return formatInTimeZone(date, 'Africa/Douala', 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const formatTime = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      // Parse the date string directly, it's already in UTC format from the backend
      const date = new Date(dateString);
      return formatInTimeZone(date, 'Africa/Douala', 'HH:mm');
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid time';
    }
  };

  return (
    <div className="w-full min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Search Bar */}
        <div className="mb-8">
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
                {/* Link Preview Image */}
                {link.preview?.image && (
                  <div className="relative aspect-[16/9] w-full overflow-hidden">
                    <img
                      src={link.preview.image}
                      alt={link.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                )}

                <div className="p-6">
                  {/* Link Title */}
                  <h3 className={`text-xl font-semibold mb-3 ${
                    isDark ? "text-gray-100" : "text-gray-600"
                  }`}>
                    {link.title}
                  </h3>

                  {/* Link Description */}
                  <p className={`mb-4 line-clamp-2 ${
                    isDark ? "text-gray-400" : "text-gray-500/90"
                  }`}>
                    {link.description}
                  </p>

                  {/* Link Metadata */}
                  <div className={`flex flex-wrap gap-4 mb-4 text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500/80"
                  }`}>
                    <div className="flex items-center gap-1">
                      <User size={16} />
                      <span>{auth?.user?.username || 'Unknown user'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>{formatDate(link.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{formatTime(link.created_at)}</span>
                    </div>
                  </div>

                  {/* Visit Link Button */}
                  <button
                    onClick={() => handleLinkClick(link.id, link.url)}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isDark
                        ? "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                        : "bg-purple-50/40 text-purple-500/80 hover:bg-purple-100/40"
                    }`}
                  >
                    <ExternalLink size={20} />
                    <span>Visit Link</span>
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 