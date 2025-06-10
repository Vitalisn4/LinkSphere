"use client"

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Link as LinkIcon, Trash2, ExternalLink, Plus, Clock, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import ApiService, { Link as LinkType } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

// Categories for quick filtering
const categories = ["Programming", "Web Development", "Design", "AI", "Data Science"];

export default function HomePage() {
  const [links, setLinks] = useState<LinkType[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<LinkType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const data = await ApiService.getAllLinks();
      setLinks(data);
      setFilteredLinks(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch links");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (searchQuery) {
      const results = links.filter(
        (link) =>
          link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          link.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLinks(results);
    } else {
      setFilteredLinks(links);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await ApiService.deleteLink(id);
      setLinks(links.filter(link => link.id !== id));
      setFilteredLinks(filteredLinks.filter(link => link.id !== id));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete link");
    }
  };

  const handleClick = async (id: string, url: string) => {
    try {
      await ApiService.incrementLinkClick(id);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Failed to increment click count:", error);
      window.open(url, "_blank");
    }
  };

  // Get user's links
  const userLinks = links.filter(link => link.user_id === user?.id);
  
  // Get most clicked links
  const popularLinks = [...links].sort((a, b) => b.click_count - a.click_count).slice(0, 5);
  
  // Get recently added links
  const recentLinks = [...links].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 5);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-purple-100 dark:border-purple-900/30"
        >
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Your Links</h2>
          <p className="text-3xl font-bold text-purple-600">{userLinks.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-purple-100 dark:border-purple-900/30"
        >
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Total Clicks</h2>
          <p className="text-3xl font-bold text-purple-600">
            {userLinks.reduce((sum, link) => sum + link.click_count, 0)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-purple-100 dark:border-purple-900/30 md:col-span-2 lg:col-span-1"
        >
          <Link
            to="/upload"
            className="h-full flex items-center justify-center group"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300 mx-auto mb-3 group-hover:scale-110">
                <Plus size={24} className="text-white" />
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Share New Link
              </p>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-purple-100 dark:border-purple-900/30 mb-8"
      >
        <div className="relative">
          <Search
            size={20}
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
              isSearchFocused ? "text-purple-500" : "text-gray-400"
            }`}
          />
          <input
            ref={searchInputRef}
            type="text"
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search your links..."
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((category, index) => (
            <button
              key={category}
              onClick={() => handleSearch(category)}
              className="px-3 py-1.5 text-sm rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/40 transition-colors duration-300"
            >
              {category}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-purple-100 dark:border-purple-900/30"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center text-gray-900 dark:text-white">
              <Clock size={20} className="mr-2 text-purple-500" />
              Recent Links
            </h2>
          </div>
          <div className="space-y-4">
            {recentLinks.map((link) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="group block p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700/50 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400">
                      {link.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(link.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    <button
                      onClick={() => handleClick(link.id, link.url)}
                      className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                    >
                      <ExternalLink size={18} className="text-purple-500" />
                    </button>
                    {user?.id === link.user_id && (
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Popular Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-purple-100 dark:border-purple-900/30"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center text-gray-900 dark:text-white">
              <TrendingUp size={20} className="mr-2 text-purple-500" />
              Popular Links
            </h2>
          </div>
          <div className="space-y-4">
            {popularLinks.map((link) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="group block p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700/50 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400">
                      {link.title}
                    </h3>
                    <p className="text-sm text-purple-500 mt-1">
                      {link.click_count} clicks
                    </p>
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    <button
                      onClick={() => handleClick(link.id, link.url)}
                      className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                    >
                      <ExternalLink size={18} className="text-purple-500" />
                    </button>
                    {user?.id === link.user_id && (
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Search Results */}
      {query && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-purple-100 dark:border-purple-900/30"
        >
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
            Search Results
          </h2>
          {filteredLinks.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No results found for "{query}"
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredLinks.map((link) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group block p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700/50 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400">
                        {link.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {link.description}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                      <button
                        onClick={() => handleClick(link.id, link.url)}
                        className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                      >
                        <ExternalLink size={18} className="text-purple-500" />
                      </button>
                      {user?.id === link.user_id && (
                        <button
                          onClick={() => handleDelete(link.id)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} className="text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {error && (
        <motion.div
          className="mt-8 p-4 rounded-lg bg-red-500/10 text-red-500 text-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}
    </div>
  );
} 