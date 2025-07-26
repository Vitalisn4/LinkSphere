"use client"

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import ApiService, { Link } from "../../services/api";
import LinkCard from '../../components/LinkCard';
import { useSearch } from '../../contexts/useSearch';

export default function DashboardPage() {
  // Remove local search state
  // const [query, setQuery] = useState<string>("")
  const { query } = useSearch();
  const [links, setLinks] = useState<Link[]>([])
  const [filteredLinks, setFilteredLinks] = useState<Link[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [, setError] = useState<string | null>(null)
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

  // Handle search using context query
  useEffect(() => {
    if (!links) return;
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

  const handleLinkClick = async (id: string, url: string) => {
    try {
      await ApiService.incrementLinkClick(id);
      // Fetch updated link
      const updatedLink = await ApiService.getLinkById(id);
      setLinks((prev) => prev.map((l) => l.id === id ? updatedLink : l));
      setFilteredLinks((prev) => prev.map((l) => l.id === id ? updatedLink : l));
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error incrementing click count:', error);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
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
                  onClick={handleLinkClick}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 