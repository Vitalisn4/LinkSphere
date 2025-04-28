"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  // Settings,
  User,
  LinkIcon,
  LayoutDashboard,
  // Activity,
  ExternalLink,
  Search,
  Trash2,
  // Edit,
  Eye,
  X,
  // Plus,
} from "lucide-react"

// Define the ApiLink type (matching HomePage.tsx and backend response)
interface ApiLink {
    id: number;
    user_id: number;
    url: string;
    title: string;
    description: string;
    click_count: number;
    favicon_url?: string;
    created_at: string;
    uploader_username?: string;
}

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [links, setLinks] = useState<ApiLink[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [filteredLinks, setFilteredLinks] = useState<ApiLink[]>([])
  const [selectedLink, setSelectedLink] = useState<ApiLink | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Fetch links from backend
  const fetchLinks = useCallback(async () => {
      setLoading(true)
      setError(null)
      try {
          const response = await fetch('http://localhost:3000/api/links')
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
          }
          const data: ApiLink[] = await response.json()
          setLinks(data)
      } catch (e: any) {
          console.error("Error fetching links:", e)
          setError("Failed to load links.")
      } finally {
          setLoading(false)
      }
  }, [])

  // Fetch links on component mount
  useEffect(() => {
      fetchLinks()
  }, [fetchLinks])

  // Filter links based on search query
  useEffect(() => {
    let results = links

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase()
      results = results.filter(
        (link) =>
          link.title.toLowerCase().includes(lowerCaseQuery) ||
          (link.description && link.description.toLowerCase().includes(lowerCaseQuery)) ||
          link.url.toLowerCase().includes(lowerCaseQuery)
      )
    }
    setFilteredLinks(results)
  }, [searchQuery, links])

  // Delete functionality
  const handleDelete = async (id: number) => {
      if (!window.confirm("Are you sure you want to delete this link?")) {
          return
      }
      try {
          const response = await fetch(`http://localhost:3000/api/links/${id}`, {
              method: 'DELETE',
          })

          if (response.ok || response.status === 204) {
              setLinks(prevLinks => prevLinks.filter(link => link.id !== id))
              console.log(`Link ${id} deleted successfully.`)
              if (selectedLink?.id === id) {
                  closeDetailModal()
              }
          } else {
               const errorText = await response.text()
               throw new Error(`Failed to delete link ${id}. Status: ${response.status}. ${errorText}`)
          }
      } catch (e: any) {
          console.error("Error deleting link:", e)
          setError(`Failed to delete link: ${e.message || 'Unknown error'}`)
      }
  }

  // Modal open/close handlers
  const openDetailModal = (link: ApiLink) => { setSelectedLink(link); setIsDetailModalOpen(true); }
  const closeDetailModal = () => { setIsDetailModalOpen(false); setSelectedLink(null); }

  // Calculate total clicks
  const totalClicks = useMemo(() => links.reduce((sum, link) => sum + link.click_count, 0), [links]);

  // Animation variants
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl overflow-hidden border border-purple-100 dark:border-purple-900/30 shadow-xl">
      {/* Sidebar */}
      <motion.div
        className={`${isSidebarOpen ? "w-64" : "w-20"} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out z-20`}
        initial={false}
        animate={{ width: isSidebarOpen ? 256 : 80 }}
      >
        {/* Logo */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between h-16">
          <div className="flex items-center space-x-2 overflow-hidden">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
               <LinkIcon size={20} className="text-white" />
             </div>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent whitespace-nowrap">
                  LinkSphere
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Admin Dashboard</p>
              </motion.div>
            )}
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex-shrink-0"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* User profile */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/20 flex-shrink-0">
               <User size={20} className="text-white" />
             </div>
             {isSidebarOpen && (
               <motion.div className="flex-1 min-w-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                 <h3 className="font-medium text-gray-900 dark:text-white truncate">Admin User</h3>
                 <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Administrator</p>
               </motion.div>
             )}
             {isSidebarOpen && (
               <motion.button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200 flex-shrink-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                 <ChevronDown size={18} />
               </motion.button>
             )}
           </div>
         </div>

         {/* Navigation */}
         <nav className="flex-1 p-4 overflow-y-auto">
           {isSidebarOpen && (<motion.p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>Main Menu</motion.p>)}
           <ul className="space-y-2">
             <li>
               <button className={`w-full flex items-center ${isSidebarOpen ? "justify-start space-x-3 px-4" : "justify-center"} py-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border border-purple-200/30 dark:border-purple-800/30 shadow-sm hover:shadow-md transition-all duration-300`}>
                 <LayoutDashboard size={18} className="text-purple-600 dark:text-purple-400" />
                 {isSidebarOpen && (<motion.span className="font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>Dashboard</motion.span>)}
               </button>
             </li>
           </ul>
           {isSidebarOpen && (
             <motion.div className="mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, delay: 0.1 }}>
               <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">Account</p>
               <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/70 hover:text-gray-900 dark:hover:text-white transition-all duration-300">
                 <LogOut size={18} />
                 <span>Logout</span>
               </button>
             </motion.div>
           )}
         </nav>

         {isSidebarOpen && (
           <motion.div className="p-4 border-t border-gray-200 dark:border-gray-700" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
             <p className="text-xs text-gray-500 dark:text-gray-400">LinkSphere v2.0.4</p>
           </motion.div>
         )}
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 bg-white dark:bg-gray-800">
          <button className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
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
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <LayoutDashboard size={26} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">View and manage links</p>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
              variants={containerVariants} initial="hidden" animate="visible"
            >
              <motion.div
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group"
                variants={itemVariants} whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 dark:text-gray-400 font-medium">Total Links</h3>
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40 transition-colors duration-300">
                    <LinkIcon size={18} className="text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{loading ? '...' : links.length}</p>
              </motion.div>

              <motion.div
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group"
                variants={itemVariants} whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 dark:text-gray-400 font-medium">Total Clicks</h3>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/40 transition-colors duration-300">
                    <ExternalLink size={18} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{loading ? '...' : totalClicks.toLocaleString()}</p>
              </motion.div>
            </motion.div>

            {/* Links Management */}
            <motion.div
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Manage Links</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search title, desc, url..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {loading && <div className="text-center p-12 text-gray-500">Loading links...</div>}
              {error && <div className="text-center p-12 text-red-500">Error: {error}</div>}
              {!loading && !error && (
                 <div className="overflow-x-auto">
                   <table className="w-full">
                     <thead className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-sm">
                       <tr>
                         <th className="px-6 py-3 text-left font-medium">Link Details</th>
                         <th className="px-6 py-3 text-left font-medium">Added By</th>
                         <th className="px-6 py-3 text-left font-medium">Clicks</th>
                         <th className="px-6 py-3 text-left font-medium">Added</th>
                         <th className="px-6 py-3 text-left font-medium">Actions</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                       <AnimatePresence>
                         {filteredLinks.length === 0 ? (
                           <tr>
                             <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                               {links.length === 0 ? "No links in the database yet." : "No links found matching your search."}
                             </td>
                           </tr>
                         ) : (
                           filteredLinks.map((link) => (
                             <motion.tr
                               key={link.id}
                               className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} layout
                             >
                               <td className="px-6 py-4">
                                 <div className="flex items-center">
                                   <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mr-3 flex-shrink-0">
                                      <LinkIcon size={14} className="text-purple-600 dark:text-purple-400" />
                                   </div>
                                   <div className="truncate max-w-[300px] sm:max-w-[400px] md:max-w-[500px]">
                                     <a href={link.url} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-900 dark:text-white truncate hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{link.title}</a>
                                     <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={link.description}>{link.description || "No description"}</p>
                                     <p className="text-xs text-gray-400 dark:text-gray-500 truncate" title={link.url}>{link.url}</p>
                                   </div>
                                 </div>
                               </td>
                               <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                 {link.uploader_username || `User ID: ${link.user_id}`}
                               </td>
                               <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{link.click_count}</td>
                               <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                   {link.created_at ? new Date(link.created_at).toLocaleString() : 'N/A'}
                               </td>
                               <td className="px-6 py-4">
                                 <div className="flex items-center space-x-2">
                                   <button
                                     className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                     title="View Details"
                                     onClick={() => openDetailModal(link)}
                                   > <Eye size={16} /> </button>
                                   <button
                                     className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                     title="Delete Link"
                                     onClick={() => handleDelete(link.id)}
                                   > <Trash2 size={16} /> </button>
                                 </div>
                               </td>
                             </motion.tr>
                           ))
                         )}
                       </AnimatePresence>
                     </tbody>
                   </table>
                 </div>
              )}

              {!loading && !error && links.length > 0 && (
                 <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing <span className="font-medium text-gray-900 dark:text-white">{filteredLinks.length > 0 ? 1 : 0}</span> to{" "}
                      <span className="font-medium text-gray-900 dark:text-white">{filteredLinks.length}</span> of{" "}
                      <span className="font-medium text-gray-900 dark:text-white">{links.length}</span> links
                    </div>
                 </div>
              )}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Updated Link Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedLink && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeDetailModal}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Link Details</h3>
                <button className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={closeDetailModal}>
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-grow">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 mr-4 flex-shrink-0">
                    <LinkIcon size={24} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white truncate">{selectedLink.title}</h4>
                    <a href={selectedLink.url} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center break-all">
                      {selectedLink.url} <ExternalLink size={14} className="ml-1 flex-shrink-0" />
                    </a>
                  </div>
                </div>

                {/* Clicks/Date/User ID */} 
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                  <div><h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Clicks</h5><p className="text-gray-900 dark:text-white font-semibold">{selectedLink.click_count}</p></div>
                  <div><h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date Added</h5><p className="text-gray-900 dark:text-white">{selectedLink.created_at ? new Date(selectedLink.created_at).toLocaleString() : 'N/A'}</p></div>
                  {/* Changed to Added By (Username or ID) */}
                  <div>
                     <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Added By</h5>
                     <p className="text-gray-900 dark:text-white">
                        {selectedLink.uploader_username || `User ID: ${selectedLink.user_id}`}
                     </p>
                   </div>
                </div>
                {/* Description */} 
                {selectedLink.description && (<div className="mb-6"><h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h5><p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 whitespace-pre-wrap">{selectedLink.description}</p></div>)}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <button
                  onClick={closeDetailModal}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                > Close </button>
                <button
                   onClick={() => handleDelete(selectedLink.id)}
                   className="px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center space-x-1.5"
                >
                    <Trash2 size={16} />
                    <span>Delete Link</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
