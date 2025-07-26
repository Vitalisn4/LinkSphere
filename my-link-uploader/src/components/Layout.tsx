"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { useAuth } from "../hooks/useAuth"
import Sidebar from "./Sidebar"
import Header from "./Header" // We will create this new component
import { useLocation } from "react-router-dom"
import { SearchProvider } from "../contexts/search";

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { user } = useAuth()

  if (!user) {
    // Render a simple layout for logged-out users
  return (
       <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          key="logged-out"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    )
  }

  return (
    <SearchProvider>
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
    >
      {children}
            </motion.div>
          </main>
        </div>
      </div>
    </SearchProvider>
  )
}
