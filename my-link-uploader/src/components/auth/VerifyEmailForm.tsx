import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { formatInTimeZone } from 'date-fns-tz';

export default function VerifyEmailForm() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const { verifyEmail, resendOtp } = useAuth();

  // Get email from session storage (stored during registration)
  const email = sessionStorage.getItem("pendingVerificationEmail");

  useEffect(() => {
    // If no email in session storage, redirect to register
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      await verifyEmail(email!, otp);
      // Clear the pending verification email
      sessionStorage.removeItem("pendingVerificationEmail");
      // Show success message and redirect to login
      navigate("/login", { 
        state: { 
          message: "Email verified successfully! You can now login to your account." 
        }
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    setError("");
    try {
      await resendOtp(email!);
      setCountdown(30); // Start 30 second countdown
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <motion.div
      className="max-w-md w-full mx-auto p-6 bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100 dark:border-purple-900/30 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-200 dark:hover:border-purple-800/50 transition-all duration-300 hover:-translate-y-1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <motion.div
          className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Mail className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </motion.div>
        <motion.h1
          className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Verify Your Email
        </motion.h1>
        <motion.p
          className="text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          We've sent a verification code to<br />
          <span className="font-medium text-gray-900 dark:text-white">{email}</span>
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
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Enter 6-digit code"
            required
            pattern="[0-9]{6}"
            className="w-full px-4 py-3 text-center text-2xl tracking-widest rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 letter-spacing-2 hover:bg-white hover:dark:bg-gray-800 hover:border-purple-200 dark:hover:border-purple-700"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || otp.length !== 6}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-0.5"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle size={20} />
              <span>Verify Email</span>
            </>
          )}
        </button>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={countdown > 0 || isResending}
            className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform duration-300"
          >
            <RefreshCw size={16} className={`mr-1 ${isResending ? "animate-spin" : ""}`} />
            {countdown > 0 ? `Resend in ${countdown}s` : "Resend verification code"}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
} 