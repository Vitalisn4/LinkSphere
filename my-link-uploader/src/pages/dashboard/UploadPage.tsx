"use client"

import * as React from 'react'
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Check, 
  AlertCircle
} from "lucide-react"
import { useTheme } from "../../contexts/ThemeContext"
import { useAuth } from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import ApiService from "../../services/api"

interface FormData {
  title: string
  url: string
  description: string
}

interface FormErrors {
  title?: string
  url?: string
  description?: string
}

export default function UploadPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isDark } = useTheme()

  // Redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!user || !token) {
      navigate('/login')
    }
  }, [user, navigate])

  const [formData, setFormData] = useState<FormData>({
    title: "",
    url: "",
    description: ""
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const dropZoneRef = useRef<HTMLDivElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const text = e.dataTransfer.getData('text')
    if (text.match(/^https?:\/\//)) {
      setFormData(prev => ({ ...prev, url: text }))
    }
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.url) {
      newErrors.url = "URL is required"
    } else if (!/^https?:\/\/\S+$/.test(formData.url)) {
      newErrors.url = "Enter a valid URL starting with http:// or https://"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    } else if (formData.description.length < 10) {
      newErrors.description = "Description should be at least 10 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submission started")

    if (!user) {
      setErrors({ url: "Please log in to submit links" })
      navigate('/login')
      return
    }

    if (!validate()) {
      console.log("Validation failed:", errors)
      return
    }

    setIsSubmitting(true)
    console.log("Submitting form data:", formData)

    try {
      // Check if token exists
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      const response = await ApiService.createLink(formData)
      console.log("Link created successfully:", response)
      setSuccessMessage("Link shared successfully!")
      setFormData({ title: "", url: "", description: "" })
    } catch (error) {
      console.error("Error submitting:", error)
      if (error instanceof Error) {
        if (error.message.includes("foreign key constraint")) {
          // Handle authentication error
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          setErrors({ url: "Your session has expired. Please log in again." })
          navigate('/login')
        } else {
          setErrors({ url: error.message })
        }
      } else {
        setErrors({ url: "Failed to submit link. Please try again." })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (successMessage) {
    return (
      <div className="w-full min-h-screen p-6 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center shadow-xl border ${
            isDark
              ? "bg-gray-800/50 border-gray-700 text-white"
              : "bg-white/50 border-gray-200 text-gray-900"
          }`}
        >
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-4">{successMessage}</h2>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            Your link has been successfully added to LinkSphere!
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setSuccessMessage(null)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                isDark
                  ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                  : "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20"
              }`}
            >
              Share Another Link
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 shadow-md hover:shadow-lg shadow-purple-500/20"
            >
              View All Links
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen p-6">
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.p
            className={`text-xl md:text-2xl ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Add a valuable resource to the collection
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`backdrop-blur-sm rounded-2xl p-8 shadow-xl border max-w-lg mx-auto ${
            isDark
              ? "bg-gray-800/50 border-gray-700"
              : "bg-white/50 border-gray-200"
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Link Input with Drop Zone */}
            <div>
              <label className={`block text-lg font-medium mb-3 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}>
                URL
              </label>
              <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-xl p-5 transition-colors
                  ${isDragging 
                    ? 'border-purple-400 bg-purple-500/10' 
                    : isDark
                      ? 'border-gray-600 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }
                  ${errors.url ? 'border-red-400' : ''}
                `}
              >
                <input
                  type="url"
                  value={formData.url}
                  onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="Paste or drop a link here..."
                  className={`w-full outline-none transition-colors text-lg ${
                    isDark
                      ? "bg-transparent text-white placeholder-gray-500"
                      : "bg-transparent text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>
              {errors.url && (
                <p className="mt-2 text-base text-red-400 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {errors.url}
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className={`block text-lg font-medium mb-3 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}>
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Give your link a title..."
                className={`
                  w-full rounded-xl p-4 outline-none transition-colors text-lg
                  ${isDark
                    ? "bg-gray-700/50 text-white placeholder-gray-500 focus:bg-gray-700"
                    : "bg-white/50 text-gray-900 placeholder-gray-400 focus:bg-white"
                  }
                  ${errors.title ? 'border-2 border-red-400' : ''}
                `}
              />
              {errors.title && (
                <p className="mt-2 text-base text-red-400 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className={`block text-lg font-medium mb-3 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What makes this link valuable?"
                className={`
                  w-full h-36 rounded-xl p-4 outline-none transition-colors resize-none text-lg
                  ${isDark
                    ? "bg-gray-700/50 text-white placeholder-gray-500 focus:bg-gray-700"
                    : "bg-white/50 text-gray-900 placeholder-gray-400 focus:bg-white"
                  }
                  ${errors.description ? 'border-2 border-red-400' : ''}
                `}
              />
              {errors.description && (
                <p className="mt-2 text-base text-red-400 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {errors.description}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center text-lg
                ${isSubmitting
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600'
                }
                text-white shadow-sm hover:shadow-md hover:shadow-purple-500/20
              `}
            >
              {isSubmitting ? 'Uploading...' : 'Upload'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
} 