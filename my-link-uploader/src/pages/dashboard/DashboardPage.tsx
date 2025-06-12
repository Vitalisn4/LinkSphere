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
    <div className="w-full min-h-screen p-6 bg-gray-100/40 dark:bg-gray-900/50">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className={`text-3xl font-bold mb-2 ${
            isDark ? "text-gray-100" : "text-gray-600"
          }`}>
            Welcome to Your Dashboard
          </h1>
          <p className={`text-lg ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}>
            Search and manage your links below
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="relative w-full max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div
            className={`relative transition-all duration-300 ${
              isSearchFocused 
                ? "ring-2 ring-purple-400/20 ring-opacity-50 shadow-lg" 
                : "shadow hover:shadow-md hover:ring-1 hover:ring-purple-400/10"
            }`}
          >
            <Search
              size={20}
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                isSearchFocused 
                  ? isDark ? "text-purple-400" : "text-purple-400/70"
                  : "text-gray-400"
              }`}
            />
            <input
              ref={searchInputRef}
              type="text"
              className={`w-full pl-12 pr-4 py-4 rounded-full border focus:outline-none transition-all duration-300 ${
                isDark
                  ? "bg-gray-800/80 border-gray-700 text-gray-100 placeholder-gray-500"
                  : "bg-gray-100/60 border-gray-200/60 text-gray-600 placeholder-gray-400"
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
                : "bg-red-50/30 text-red-500/80 border border-red-200/30"
            }`}
          >
            {error}
            <button
              onClick={() => fetchLinks()}
              className={`ml-4 underline hover:no-underline ${
                isDark ? "text-purple-400" : "text-purple-400/70"
              }`}
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                      <span>{link.user?.username || user?.username || 'Unknown user'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>{format(new Date(link.created_at), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{format(new Date(link.created_at), 'h:mm a')}</span>
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
  )
} 