"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Search, ExternalLink, Calendar, User, Clock } from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "../../contexts/AuthContext"
import { useTheme } from "../../contexts/ThemeContext"
import ApiService, { Link } from "../../services/api"

export default function DashboardPage() {
  const [query, setQuery] = useState<string>("")
  const [links, setLinks] = useState<Link[]>([])
  const [filteredLinks, setFilteredLinks] = useState<Link[]>([])
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout>()
  const { user } = useAuth()
  const { isDark } = useTheme()

  const fetchLinks = useCallback(async (retryCount = 0) => {
    try {
      setError(null)
      const data = await ApiService.getAllLinks()
      setLinks(data)
      setFilteredLinks(data)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching links:', error)
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('pool timed out')) {
          setError('Database connection issue. Retrying...')
          // Retry with exponential backoff
          if (retryCount < 3) {
            const delay = Math.min(1000 * Math.pow(2, retryCount), 5000)
            retryTimeoutRef.current = setTimeout(() => {
              fetchLinks(retryCount + 1)
            }, delay)
          } else {
            setError('Unable to connect to the database. Please try again later.')
          }
        } else if (error.message.includes('Failed to fetch')) {
          setError('Unable to reach the server. Please check your connection.')
        } else {
          setError(error.message)
        }
      } else {
        setError('An unexpected error occurred')
      }
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLinks()
    
    // Cleanup function
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [fetchLinks])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        const results = links.filter(
          (link) =>
            link.title.toLowerCase().includes(query.toLowerCase()) ||
            link.description.toLowerCase().includes(query.toLowerCase())
        )
        setFilteredLinks(results)
      } else {
        setFilteredLinks(links)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, links])

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
  }

  const handleLinkClick = async (id: string, url: string) => {
    try {
      await ApiService.incrementLinkClick(id)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Error incrementing click count:', error)
      // Still open the link even if tracking fails
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="w-full min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Search Bar */}
        <motion.div
          className="relative w-full max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div
            className={`relative transition-all duration-300 ${
              isSearchFocused ? "ring-1 ring-purple-400 shadow-md" : "shadow-sm"
            }`}
          >
            <Search
              size={20}
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                isSearchFocused 
                  ? isDark ? "text-purple-300" : "text-purple-500"
                  : "text-gray-400"
              }`}
            />
            <input
              ref={searchInputRef}
              type="text"
              className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none transition-all duration-300 ${
                isDark
                  ? "bg-gray-800/30 border-gray-700/50 text-gray-100 placeholder-gray-500"
                  : "bg-gray-50/50 border-gray-200/70 text-gray-800 placeholder-gray-400"
              }`}
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search for links..."
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg text-center ${
              isDark
                ? "bg-red-900/20 text-red-400 border border-red-800"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}
          >
            {error}
            <button
              onClick={() => fetchLinks()}
              className={`ml-4 underline hover:no-underline ${
                isDark ? "text-purple-400" : "text-purple-600"
              }`}
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Links Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                className={`rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg ${
                  isDark
                    ? "bg-gray-800/30 border-gray-700/50 hover:border-purple-500/30"
                    : "bg-gray-50/50 border-gray-200/70 hover:border-purple-500/20"
                }`}
              >
                <div className="p-5">
                  {/* Link Title and Description in a row */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-2 ${
                        isDark ? "text-gray-100" : "text-gray-800"
                      }`}>
                        {link.title}
                      </h3>
                      <p className={`mb-3 line-clamp-2 ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}>
                        {link.description}
                      </p>
                    </div>

                    {/* Visit Link Button */}
                    <button
                      onClick={() => handleLinkClick(link.id, link.url)}
                      className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 ${
                        isDark
                          ? "bg-purple-500/5 text-purple-300 hover:bg-purple-500/10"
                          : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                      }`}
                    >
                      <ExternalLink size={18} />
                      <span>Visit Link</span>
                    </button>
                  </div>

                  {/* Link Metadata */}
                  <div className={`flex flex-wrap gap-4 mt-3 text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}>
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>{link.user?.username || user?.username || 'Unknown user'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{format(new Date(link.created_at), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{format(new Date(link.created_at), 'h:mm a')}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 