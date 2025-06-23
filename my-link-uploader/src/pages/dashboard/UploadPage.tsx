"use client"

import * as React from 'react'
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Check, 
  AlertCircle,
  Link as LinkIcon
} from "lucide-react"
import { useTheme } from "../../hooks/useTheme"
import { useAuth } from "../../hooks/useAuth"
import { useNavigate } from "react-router-dom"
import ApiService from "../../services/api"

interface FormData {
  title: string
  url: string
  description: string
}

interface FormErrors {
  url?: string
  title?: string
  description?: string
  submit?: string
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
  const [isFormValid, setIsFormValid] = useState(false)

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
      handleInputChange('url', text)
    }
  }

  const validateUrl = (url: string): string | null => {
    if (!url) return "URL is required";
    if (!url.match(/^https?:\/\/.+/)) {
      return "Please enter a valid URL starting with http:// or https://";
    }
    try {
      new URL(url);
      return null;
    } catch {
      return "Please enter a valid URL";
    }
  }

  const validateTitle = (title: string): string | null => {
    if (!title) return "Title is required";
    if (title.length < 3) return "Title must be at least 3 characters";
    if (title.length > 255) return "Title must be less than 255 characters";
    return null;
  };

  const validateDescription = (description: string): string | null => {
    if (!description) return "Description is required";
    if (description.length < 10) return "Description must be at least 10 characters";
    if (description.length > 1000) return "Description must be less than 1000 characters";
    return null;
  };

  // Add real-time validation
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    setErrors(prev => ({ ...prev, [field]: undefined }));
    
    // Validate after a short delay
    const validationTimeout = setTimeout(() => {
      let error: string | null = null;
      
      switch (field) {
        case 'url':
          error = validateUrl(value);
          break;
        case 'title':
          error = validateTitle(value);
          break;
        case 'description':
          error = validateDescription(value);
          break;
      }
      
      if (error) {
        setErrors(prev => ({ ...prev, [field]: error }));
    }
    }, 500);

    return () => clearTimeout(validationTimeout);
  };

  // Check form validity whenever form data or errors change
  useEffect(() => {
    const isValid = 
      !errors.url && !errors.title && !errors.description &&
      formData.url.trim() !== "" &&
      formData.title.trim() !== "" &&
      formData.description.trim() !== "";
    
    setIsFormValid(isValid);
  }, [formData, errors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validate all fields
    const urlError = validateUrl(formData.url);
    const titleError = validateTitle(formData.title);
    const descError = validateDescription(formData.description);

    const validationErrors: FormErrors = {};
    if (urlError) validationErrors.url = urlError;
    if (titleError) validationErrors.title = titleError;
    if (descError) validationErrors.description = descError;

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Ensure URL has protocol
      let url = formData.url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      await ApiService.createLink({
        url,
        title: formData.title,
        description: formData.description
      });
      
      setSuccessMessage("Link shared successfully!");
      setFormData({ title: "", url: "", description: "" });
    } catch (error) {
      console.error('Error creating link:', error);
      if (error instanceof Error) {
        setErrors({ submit: error.message });
      } else {
        setErrors({ submit: "Failed to create link. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
            What would you like to do next?
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button
              onClick={() => {
                setSuccessMessage(null);
                setFormData({ title: "", url: "", description: "" });
              }}
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
    );
  }

  return (
    <div className="w-full min-h-screen p-6">
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Share a Link
          </h1>
          <motion.p
            className={`text-xl font-bold ${
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
            {/* URL Input with Drop Zone */}
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
                  relative border-2 border-dashed rounded-xl transition-colors
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
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  placeholder="https://example.com"
                  className={`
                    w-full px-4 py-3 bg-transparent rounded-xl focus:outline-none
                    ${isDark ? 'text-white' : 'text-gray-900'}
                    ${errors.url ? 'placeholder-red-300' : isDark ? 'placeholder-gray-500' : 'placeholder-gray-400'}
                  `}
                />
                {errors.url && (
                  <div className="mt-2 text-red-400 text-sm flex items-center gap-1">
                    <AlertCircle size={16} />
                    {errors.url}
                  </div>
                )}
              </div>
          </div>

            {/* Title Input */}
          <div>
              <label className={`block text-lg font-medium mb-3 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}>
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter a descriptive title"
                className={`
                  w-full px-4 py-3 rounded-xl border-2 transition-colors
                  ${isDark
                    ? 'bg-gray-800/30 border-gray-600 text-white' 
                    : 'bg-white/50 border-gray-200 text-gray-900'
                  }
                  ${errors.title ? 'border-red-400' : ''}
                  focus:outline-none focus:border-purple-500
                `}
              />
              {errors.title && (
                <div className="mt-2 text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.title}
                </div>
              )}
          </div>

            {/* Description Input */}
          <div>
              <label className={`block text-lg font-medium mb-3 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}>
              Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what this link is about"
                rows={4}
                className={`
                  w-full px-4 py-3 rounded-xl border-2 transition-colors
                  ${isDark
                    ? 'bg-gray-800/30 border-gray-600 text-white' 
                    : 'bg-white/50 border-gray-200 text-gray-900'
                  }
                  ${errors.description ? 'border-red-400' : ''}
                  focus:outline-none focus:border-purple-500
                `}
              />
              {errors.description && (
                <div className="mt-2 text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.description}
                </div>
              )}
          </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`
                w-full py-4 px-6 rounded-xl font-medium flex items-center justify-center gap-2
                transition-all duration-300 
                ${isFormValid && !isSubmitting
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white shadow-lg hover:shadow-xl shadow-purple-500/20'
                  : isDark
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              <LinkIcon size={20} />
              {isSubmitting ? 'Sharing Link...' : 'Share Link'}
          </button>

            {/* Error Message */}
            {errors.submit && (
              <div className={`p-4 rounded-lg text-center ${
                isDark
                  ? "bg-red-900/20 text-red-400 border border-red-800"
                  : "bg-red-50 text-red-500 border border-red-200"
              }`}>
                {errors.submit}
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
} 