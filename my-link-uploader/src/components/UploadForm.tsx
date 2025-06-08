"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, useAnimation } from "framer-motion"
import { Link2, Check, AlertCircle, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

interface FormData {
  url: string
  title: string
  description: string
}

interface FormErrors {
  url?: string
  title?: string
  description?: string
}

export default function UploadForm() {
  const [formData, setFormData] = useState<FormData>({
    url: "",
    title: "",
    description: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [focusedField, setFocusedField] = useState<keyof FormData | null>(null)

  const controls = useAnimation()
  const formRef = useRef<HTMLFormElement>(null)
  const linkInputRef = useRef<HTMLInputElement>(null)

  // Focus first input on mount
  useEffect(() => {
    if (linkInputRef.current) {
      linkInputRef.current.focus()
    }
  }, [])

  // Validate form data
  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.url) {
      newErrors.url = "Link is required"
    } else if (!/^https?:\/\/\S+$/.test(formData.url)) {
      newErrors.url = "Enter a valid URL starting with http:// or https://"
    }

    if (!formData.title) {
      newErrors.title = "Topic is required"
    }

    if (!formData.description) {
      newErrors.description = "Description is required"
    } else if (formData.description.length < 10) {
      newErrors.description = "Description should be at least 10 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear field error when typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      // Shake form on validation error
      controls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 },
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccessMessage("Link submitted successfully!")
        setFormData({ url: "", title: "", description: "" })
      } else {
        setSuccessMessage(null)
        alert("Error submitting the form. Please try again.")
      }
    } catch (error) {
      setSuccessMessage(null)
      alert("Error submitting the form. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center mb-6 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" />
        <span>Back to home</span>
      </Link>

      <motion.div
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-purple-100 dark:border-purple-900/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4">
            <Link2 size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Share a Valuable Link
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Submit a useful resource with its topic, description, and your name
          </p>
        </div>

        {successMessage ? (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto flex items-center justify-center mb-4">
              <Check size={32} className="text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{successMessage}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Thank you for contributing to our link collection!</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setSuccessMessage(null)}
                className="px-5 py-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/40 transition-colors"
              >
                Submit another link
              </button>
              <Link
                to="/"
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:from-purple-700 hover:to-pink-600 transition-colors"
              >
                Return to home
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.form
            ref={formRef}
            className="space-y-6"
            onSubmit={handleSubmit}
            variants={formVariants}
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <label
                className={`block mb-1.5 font-medium ${
                  errors.url ? "text-red-500" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                Link URL
              </label>
              <div className={`relative ${focusedField === "url" ? "ring-2 ring-purple-500 ring-opacity-50" : ""}`}>
                <input
                  ref={linkInputRef}
                  type="text"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("url")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border ${
                    errors.url
                      ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10"
                      : "border-gray-300 dark:border-gray-700"
                  } focus:outline-none transition-colors duration-200`}
                  placeholder="https://example.com"
                />
              </div>
              {errors.url && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.url}
                </p>
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label
                className={`block mb-1.5 font-medium ${
                  errors.title ? "text-red-500" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                Topic
              </label>
              <div className={`relative ${focusedField === "title" ? "ring-2 ring-purple-500 ring-opacity-50" : ""}`}>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("title")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border ${
                    errors.title
                      ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10"
                      : "border-gray-300 dark:border-gray-700"
                  } focus:outline-none transition-colors duration-200`}
                  placeholder="e.g., Programming, Design, Marketing"
                />
              </div>
              {errors.title && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.title}
                </p>
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label
                className={`block mb-1.5 font-medium ${
                  errors.description ? "text-red-500" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                Description
              </label>
              <div
                className={`relative ${focusedField === "description" ? "ring-2 ring-purple-500 ring-opacity-50" : ""}`}
              >
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("description")}
                  onBlur={() => setFocusedField(null)}
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border ${
                    errors.description
                      ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10"
                      : "border-gray-300 dark:border-gray-700"
                  } focus:outline-none transition-colors duration-200 resize-none`}
                  placeholder="Briefly describe what this resource is about and why it's valuable"
                />
              </div>
              {errors.description && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.description}
                </p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                  isSubmitting
                    ? "bg-purple-400 dark:bg-purple-700 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
                } transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Link"
                )}
              </button>
            </motion.div>
          </motion.form>
        )}
      </motion.div>
    </div>
  )
}
