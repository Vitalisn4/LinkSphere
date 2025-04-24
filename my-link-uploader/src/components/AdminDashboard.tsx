"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  User,
  LinkIcon,
  LayoutDashboard,
  Activity,
  ExternalLink,
  Search,
  Trash2,
  Edit,
  Eye,
  X,
  Plus,
} from "lucide-react"

// Sample data for demonstration
const sampleLinks = [
  {
    id: 1,
    url: "https://example.com/react-hooks",
    title: "React Hooks Complete Guide",
    topic: "Web Development",
    description: "A comprehensive guide to React Hooks with examples and best practices",
    uploader: "Sarah Johnson",
    date: "2023-10-15",
    clicks: 342,
    status: "active",
  },
  {
    id: 2,
    url: "https://example.com/typescript-tips",
    title: "TypeScript Advanced Tips",
    topic: "Programming",
    description: "Advanced TypeScript techniques for better type safety and developer experience",
    uploader: "Michael Chen",
    date: "2023-09-28",
    clicks: 189,
    status: "active",
  },
  {
    id: 3,
    url: "https://example.com/css-grid",
    title: "CSS Grid Layout Mastery",
    topic: "Web Development",
    description: "Master CSS Grid Layout with practical examples and responsive design patterns",
    uploader: "Emma Wilson",
    date: "2023-10-02",
    clicks: 276,
    status: "active",
  },
  {
    id: 4,
    url: "https://example.com/python-data-science",
    title: "Python for Data Science",
    topic: "Data Science",
    description: "Learn how to use Python for data analysis, visualization, and machine learning",
    uploader: "David Kim",
    date: "2023-09-15",
    clicks: 421,
    status: "active",
  },
  {
    id: 5,
    url: "https://example.com/ui-design-principles",
    title: "UI Design Principles",
    topic: "Design",
    description: "Essential principles for creating intuitive and beautiful user interfaces",
    uploader: "Alex Rivera",
    date: "2023-10-10",
    clicks: 157,
    status: "inactive",
  },
]

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredLinks, setFilteredLinks] = useState(sampleLinks)
  const [selectedLink, setSelectedLink] = useState<(typeof sampleLinks)[0] | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  // Filter links based on search query and active tab
  useEffect(() => {
    let results = sampleLinks

    // Filter by search query
    if (searchQuery) {
      results = results.filter(
        (link) =>
          link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          link.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
          link.uploader.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by tab
    if (activeTab === "active") {
      results = results.filter((link) => link.status === "active")
    } else if (activeTab === "inactive") {
      results = results.filter((link) => link.status === "inactive")
    }

    setFilteredLinks(results)
  }, [searchQuery, activeTab])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl overflow-hidden border border-purple-100 dark:border-purple-900/30 shadow-xl">
      {/* Sidebar */}
      <motion.div
        className={`${isSidebarOpen ? "w-64" : "w-20"} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out z-20`}
        initial={false}
        animate={{ width: isSidebarOpen ? 256 : 80 }}
      >
        {/* Logo */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <LinkIcon size={20} className="text-white" />
            </div>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  LinkSphere
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin Dashboard</p>
              </motion.div>
            )}
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* User profile */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/20">
              <User size={20} className="text-white" />
            </div>
            {isSidebarOpen && (
              <motion.div
                className="flex-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="font-medium text-gray-900 dark:text-white">Admin User</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
              </motion.div>
            )}
            {isSidebarOpen && (
              <motion.button
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={18} />
              </motion.button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {isSidebarOpen && (
            <motion.p
              className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              Main Menu
            </motion.p>
          )}

          <ul className="space-y-2">
            <li>
              <button
                className={`w-full flex items-center ${isSidebarOpen ? "justify-start space-x-3 px-4" : "justify-center"} py-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border border-purple-200/30 dark:border-purple-800/30 shadow-sm hover:shadow-md transition-all duration-300`}
              >
                <LayoutDashboard size={18} className="text-purple-600 dark:text-purple-400" />
                {isSidebarOpen && (
                  <motion.span
                    className="font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    Dashboard
                  </motion.span>
                )}
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center ${isSidebarOpen ? "justify-start space-x-3 px-4" : "justify-center"} py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/70 hover:text-gray-900 dark:hover:text-white transition-all duration-300`}
              >
                <LinkIcon size={18} />
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    Manage Links
                  </motion.span>
                )}
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center ${isSidebarOpen ? "justify-start space-x-3 px-4" : "justify-center"} py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/70 hover:text-gray-900 dark:hover:text-white transition-all duration-300`}
              >
                <Settings size={18} />
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    Settings
                  </motion.span>
                )}
              </button>
            </li>
          </ul>

          {isSidebarOpen && (
            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">
                Account
              </p>
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/70 hover:text-gray-900 dark:hover:text-white transition-all duration-300">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </motion.div>
          )}
        </nav>

        {/* Footer */}
        {isSidebarOpen && (
          <motion.div
            className="p-4 border-t border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-xs text-gray-500 dark:text-gray-400">LinkSphere v2.0.4</p>
          </motion.div>
        )}
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 bg-white dark:bg-gray-800">
          <button
            className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center space-x-4">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500 ring-2 ring-white dark:ring-gray-800"></span>
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="flex items-center space-x-4 mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <LayoutDashboard size={26} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your links and monitor performance</p>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 dark:text-gray-400 font-medium">Total Links</h3>
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40 transition-colors duration-300">
                    <LinkIcon size={18} className="text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">1,257</p>
                <div className="flex items-center mt-2 text-xs text-green-600 dark:text-green-400">
                  <Activity size={14} className="mr-1" />
                  <span>↑ 12% from last month</span>
                </div>
              </motion.div>

              <motion.div
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 dark:text-gray-400 font-medium">Active Links</h3>
                  <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center group-hover:bg-pink-200 dark:group-hover:bg-pink-800/40 transition-colors duration-300">
                    <LinkIcon size={18} className="text-pink-600 dark:text-pink-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">1,180</p>
                <div className="flex items-center mt-2 text-xs text-green-600 dark:text-green-400">
                  <Activity size={14} className="mr-1" />
                  <span>↑ 8% from last month</span>
                </div>
              </motion.div>

              <motion.div
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 dark:text-gray-400 font-medium">Total Clicks</h3>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/40 transition-colors duration-300">
                    <ExternalLink size={18} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">24.3K</p>
                <div className="flex items-center mt-2 text-xs text-green-600 dark:text-green-400">
                  <Activity size={14} className="mr-1" />
                  <span>↑ 18% from last month</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Links Management */}
            <motion.div
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Manage Links</h2>

                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search links..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {/* Filter */}
                  <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <button
                      className={`px-3 py-2 text-sm font-medium ${
                        activeTab === "all"
                          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                          : "bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      } transition-colors duration-200`}
                      onClick={() => setActiveTab("all")}
                    >
                      All
                    </button>
                    <button
                      className={`px-3 py-2 text-sm font-medium ${
                        activeTab === "active"
                          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                          : "bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      } transition-colors duration-200`}
                      onClick={() => setActiveTab("active")}
                    >
                      Active
                    </button>
                    <button
                      className={`px-3 py-2 text-sm font-medium ${
                        activeTab === "inactive"
                          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                          : "bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      } transition-colors duration-200`}
                      onClick={() => setActiveTab("inactive")}
                    >
                      Inactive
                    </button>
                  </div>

                  {/* Add new button */}
                  <button className="px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 transition-colors duration-300 shadow-sm hover:shadow-md flex items-center justify-center">
                    <Plus size={16} className="mr-1" />
                    <span className="text-sm font-medium">Add New</span>
                  </button>
                </div>
              </div>

              {/* Links table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-sm">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium">Title</th>
                      <th className="px-6 py-3 text-left font-medium">Topic</th>
                      <th className="px-6 py-3 text-left font-medium">Uploader</th>
                      <th className="px-6 py-3 text-left font-medium">Date</th>
                      <th className="px-6 py-3 text-left font-medium">Clicks</th>
                      <th className="px-6 py-3 text-left font-medium">Status</th>
                      <th className="px-6 py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <AnimatePresence>
                      {filteredLinks.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                            No links found matching your criteria
                          </td>
                        </tr>
                      ) : (
                        filteredLinks.map((link) => (
                          <motion.tr
                            key={link.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            layout
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mr-3">
                                  <LinkIcon size={14} className="text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="truncate max-w-[200px]">
                                  <div className="font-medium text-gray-900 dark:text-white truncate">{link.title}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{link.url}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                                {link.topic}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{link.uploader}</td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{link.date}</td>
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{link.clicks}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2.5 py-1 text-xs rounded-full ${
                                  link.status === "active"
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400"
                                }`}
                              >
                                {link.status === "active" ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                  onClick={() => {
                                    setSelectedLink(link)
                                    setIsDetailModalOpen(true)
                                  }}
                                >
                                  <Eye size={16} />
                                </button>
                                <button className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                  <Edit size={16} />
                                </button>
                                <button className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing <span className="font-medium text-gray-900 dark:text-white">1</span> to{" "}
                  <span className="font-medium text-gray-900 dark:text-white">{filteredLinks.length}</span> of{" "}
                  <span className="font-medium text-gray-900 dark:text-white">{sampleLinks.length}</span> links
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
                    Previous
                  </button>
                  <button className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
                    Next
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      {/* Link Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedLink && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDetailModalOpen(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Link Details</h3>
                <button
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 mr-4">
                    <LinkIcon size={24} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedLink.title}</h4>
                    <a
                      href={selectedLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center"
                    >
                      {selectedLink.url}
                      <ExternalLink size={14} className="ml-1" />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Topic</h5>
                    <p className="text-gray-900 dark:text-white">{selectedLink.topic}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</h5>
                    <span
                      className={`px-2.5 py-1 text-xs rounded-full ${
                        selectedLink.status === "active"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {selectedLink.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Uploader</h5>
                    <p className="text-gray-900 dark:text-white">{selectedLink.uploader}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date Added</h5>
                    <p className="text-gray-900 dark:text-white">{selectedLink.date}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Clicks</h5>
                    <p className="text-gray-900 dark:text-white font-semibold">{selectedLink.clicks}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h5>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    {selectedLink.description}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <button className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Edit Link
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                    Delete Link
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 transition-colors">
                    Toggle Status
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
