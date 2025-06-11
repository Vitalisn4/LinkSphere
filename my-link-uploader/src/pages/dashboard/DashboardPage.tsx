"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Search, ArrowRight, LinkIcon } from "lucide-react"
import { Link } from "react-router-dom"
import DashboardLayout from "../../components/DashboardLayout"
import ApiService, { Link as LinkType } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { useTheme } from "../../hooks/useTheme"

// Sample data for demonstration
const sampleData = [
  { id: 1, name: "Traits in Rust", url: "https://example.com/rust-traits", category: "Programming" },
  { id: 2, name: "Threads in Java", url: "https://example.com/java-threads", category: "Programming" },
  { id: 3, name: "Pattern matching in Python", url: "https://example.com/python-patterns", category: "Programming" },
  { id: 4, name: "Enums in TypeScript", url: "https://example.com/typescript-enums", category: "Programming" },
  { id: 5, name: "Options in Swift", url: "https://example.com/swift-options", category: "Programming" },
  { id: 6, name: "React Hooks Guide", url: "https://example.com/react-hooks", category: "Web Development" },
  { id: 7, name: "CSS Grid Layout", url: "https://example.com/css-grid", category: "Web Development" },
  { id: 8, name: "JavaScript Promises", url: "https://example.com/js-promises", category: "Web Development" },
]

// Type for search result item
interface ResultItem {
  id: number
  name: string
  url: string
  category: string
}

export default function DashboardPage() {
  const [query, setQuery] = useState<string>("")
  const [filteredResults, setFilteredResults] = useState<ResultItem[]>([])
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const { theme } = useTheme()

  // Function to handle real-time search filtering
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)

    if (searchQuery) {
      const results = sampleData.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredResults(results)
    } else {
      setFilteredResults([])
    }
  }

  // Focus search input on page load
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  return (
    <DashboardLayout>
      <div className="w-full">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Welcome to LinkSphere
          </motion.h1>
          <motion.p
            className={`text-xl md:text-2xl mb-2 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Discover and share valuable resources
          </motion.p>
          <motion.p
            className={`text-lg ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Let's make your search easier than ever!
          </motion.p>
        </motion.div>

        <motion.div
          className="relative w-full max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div
            className={`relative transition-all duration-300 ${
              isSearchFocused ? "ring-2 ring-purple-500 ring-opacity-50 shadow-lg" : "shadow"
            }`}
          >
            <Search
              size={20}
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                isSearchFocused 
                  ? theme === "dark" ? "text-purple-400" : "text-purple-600"
                  : "text-gray-400"
              }`}
            />
            <input
              ref={searchInputRef}
              type="text"
              className={`w-full pl-12 pr-4 py-4 rounded-full border focus:outline-none transition-all duration-300 ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
              }`}
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search for links, topics, or categories..."
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>

          {/* Quick categories */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {["Programming", "Web Development", "Design", "AI", "Data Science"].map((category, index) => (
              <motion.button
                key={category}
                className={`px-4 py-2 text-sm rounded-full transition-colors duration-300 ${
                  theme === "dark"
                    ? "bg-gray-800 text-purple-400 hover:bg-gray-700"
                    : "bg-gray-100 text-purple-600 hover:bg-gray-200"
                }`}
                onClick={() => handleSearch(category)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.3 }}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Search Results */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`w-full max-w-6xl mx-auto backdrop-blur-sm rounded-2xl p-6 shadow-xl border ${
            theme === "dark"
              ? "bg-gray-800/50 border-gray-700"
              : "bg-white/50 border-gray-200"
          }`}
        >
          <h2 className={`text-xl font-semibold mb-4 flex items-center ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>
            <LinkIcon size={20} className={`mr-2 ${
              theme === "dark" ? "text-purple-400" : "text-purple-600"
            }`} />
            {query ? "Search Results" : "Popular Links"}
          </h2>

          {filteredResults.length === 0 && query ? (
            <motion.div className="text-center py-12" variants={itemVariants}>
              <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                No results found for "{query}"
              </p>
              <Link
                to="/dashboard/upload"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-300 mt-4"
              >
                <span>Add this resource</span>
                <ArrowRight size={16} className="ml-2" />
              </Link>
            </motion.div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(query ? filteredResults : sampleData.slice(0, 6)).map((result) => (
                <motion.a
                  key={result.id}
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group block p-4 rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-700 hover:border-purple-500/50"
                      : "bg-white border-gray-200 hover:border-purple-300"
                  }`}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300 mr-3 flex-shrink-0">
                      <LinkIcon size={18} className="text-white" />
                    </div>
                    <div>
                      <h3 className={`font-medium transition-colors duration-300 ${
                        theme === "dark"
                          ? "text-white group-hover:text-purple-400"
                          : "text-gray-900 group-hover:text-purple-600"
                      }`}>
                        {result.name}
                      </h3>
                      <p className={`text-sm mt-1 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}>
                        {result.category}
                      </p>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          )}

          {!query && (
            <motion.div className="mt-6 text-center" variants={itemVariants}>
              <Link
                to="/dashboard/upload"
                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <span>Share a new link</span>
                <ArrowRight size={16} className="ml-2" />
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  )
} 