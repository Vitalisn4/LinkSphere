"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Mail, ArrowRight, RefreshCw } from "lucide-react"
import { useAuth } from "../../hooks/useAuth"

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendDisabled, setResendDisabled] = useState(true)
  const [countdown, setCountdown] = useState(30)
  const navigate = useNavigate()
  const { verifyEmail, resendOtp } = useAuth()

  // Get email from session storage (stored during registration)
  const email = sessionStorage.getItem("pendingVerificationEmail")

  // Redirect if no email is found
  useEffect(() => {
  if (!email) {
    navigate("/register", { replace: true })
      return
  }
  }, [email, navigate])

  // Handle countdown for resend button
  useEffect(() => {
    if (countdown > 0 && resendDisabled) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      setResendDisabled(false)
    }
  }, [countdown, resendDisabled])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await verifyEmail(email!, otp)
      navigate("/login", { 
        replace: true,
        state: { 
          message: "Email verified successfully! You can now log in." 
        }
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to verify email")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setIsLoading(true)
    setError("")

    try {
      await resendOtp(email!)
      setResendDisabled(true)
      setCountdown(30)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to resend OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "")
    if (value.length <= 6) {
      setOtp(value)
    }
  }

  // Don't render anything if no email is found
  if (!email) {
    return null
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-purple-50/90 via-white/90 to-pink-50/90 dark:from-gray-900/90 dark:via-gray-900/95 dark:to-gray-800/90 backdrop-blur-md">
      <div className="absolute inset-0 bg-white/40 dark:bg-gray-900/40 -z-10" />
      <motion.div
        className="w-full max-w-xl mx-4 bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-purple-100 dark:border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center mb-6 sm:mb-8"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Verify Your Email
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-2">
            We've sent a verification code to
          </p>
          <p className="text-base sm:text-lg text-purple-600 dark:text-purple-400 font-medium break-all">
            {email}
          </p>
        </div>

        {error && (
          <motion.div
            className="mb-6 sm:mb-8 p-3 sm:p-4 rounded-lg bg-red-500/10 text-red-500 text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <div className="relative">
              <input
                type="text"
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter 6-digit code"
                required
                pattern="[0-9]{6}"
                className="w-full px-2 sm:px-4 py-4 sm:py-6 bg-white/50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-2xl sm:text-4xl text-center tracking-[0.5em] sm:tracking-[1em] font-mono text-gray-900 dark:text-white placeholder:text-sm placeholder:tracking-normal placeholder:font-sans placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all duration-300 hover:border-purple-500/50 letter-spacing-1"
                style={{ 
                  '-webkit-text-security': otp.length < 6 ? 'disc' : 'none'
                } as React.CSSProperties}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium hover:shadow-lg hover:shadow-purple-500/20"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Verify Email</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendDisabled || isLoading}
              className="inline-flex items-center space-x-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className={resendDisabled ? "animate-spin" : ""} />
              <span>
                {resendDisabled 
                  ? `Resend code in ${countdown}s` 
                  : "Resend code"}
              </span>
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>
            Didn't receive the code? Check your spam folder or{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors font-medium"
            >
              try another email
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
} 