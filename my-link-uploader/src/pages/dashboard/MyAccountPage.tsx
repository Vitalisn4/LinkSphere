"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link as LinkIcon, ExternalLink, Trash2, Edit, Clock, TrendingUp } from "lucide-react"
import DashboardLayout from "../../components/DashboardLayout"
import ApiService, { Link } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"

export default function MyAccountPage() {
  const [links, setLinks] = useState<Link[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const { user } = useAuth()

  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      const fetchedLinks = await ApiService.getAllLinks()
      // Filter links to show only the user's links
      const userLinks = fetchedLinks.filter((link) => link.user_id === user?.id)
      setLinks(userLinks)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch links")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await ApiService.deleteLink(id)
      setLinks(links.filter((link) => link.id !== id))
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete link")
    }
  }

  const handleClick = async (id: string) => {
    try {
      await ApiService.incrementLinkClick(id)
      setLinks(
        links.map((link) => (link.id === id ? { ...link, click_count: link.click_count + 1 } : link))
      )
    } catch (error) {
      console.error("Failed to track click:", error)
    }
  }

  // Sort links by creation date (newest first)
  const sortedLinks = [...links].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // Calculate total clicks
  const totalClicks = links.reduce((sum, link) => sum + link.click_count, 0)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Links</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage all your shared links in one place
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-100 dark:border-gray-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">Total Links</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{links.length}</p>
          </motion.div>

          <motion.div
            className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-100 dark:border-gray-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">Total Clicks</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalClicks}</p>
          </motion.div>

          <motion.div
            className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-100 dark:border-gray-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
              Average Clicks
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {links.length > 0 ? Math.round(totalClicks / links.length) : 0}
            </p>
          </motion.div>
        </div>

        {error && (
          <motion.div
            className="p-4 rounded-lg bg-red-500/10 text-red-500"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sortedLinks.length === 0 ? (
          <div className="text-center py-12">
            <LinkIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No links yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start by sharing your first link
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedLinks.map((link) => (
              <motion.div
                key={link.id}
                className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-100 dark:border-gray-700/50 relative group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate flex-1">
                    {link.title}
                  </h3>
                  <div className="flex items-center space-x-2 ml-2">
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete link"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                  {link.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    <span>
                      {new Date(link.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp size={14} className="mr-1" />
                    <span>{link.click_count} clicks</span>
                  </div>
                </div>

                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleClick(link.id)}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/40 transition-all duration-300"
                >
                  <span>Visit Link</span>
                  <ExternalLink size={16} />
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 