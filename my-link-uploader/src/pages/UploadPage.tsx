import { useState } from "react";
import { motion } from "framer-motion";
import { Link as LinkIcon, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ApiService from "../services/api";

export default function UploadPage() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      await ApiService.createLink({ url, title, description });
      navigate("/");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/90 via-white/90 to-pink-50/90 dark:from-gray-900/90 dark:via-gray-900/95 dark:to-gray-800/90 backdrop-blur-md">
      <div className="absolute inset-0 bg-white/40 dark:bg-gray-900/40 -z-10" />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 mb-8"
        >
          <ArrowLeft size={20} />
          <span>Back to Links</span>
        </Link>

        <motion.div
          className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100 dark:border-purple-900/30 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <motion.h1
              className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Share a Link
            </motion.h1>
            <motion.p
              className="text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Share interesting resources with the community
            </motion.p>
          </div>

          {error && (
            <motion.div
              className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Link URL"
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-sm hover:shadow-purple-200 dark:hover:shadow-purple-900/20"
              />
            </div>

            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                required
                className="w-full px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-sm hover:shadow-purple-200 dark:hover:shadow-purple-900/20"
              />
            </div>

            <div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                required
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-sm hover:shadow-purple-200 dark:hover:shadow-purple-900/20 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md hover:shadow-purple-500/20"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LinkIcon size={20} />
                  <span>Share Link</span>
                </>
              )}
            </button>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
} 