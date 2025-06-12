"use client"
import { createContext, useContext } from "react"
import { useState, useEffect } from "react"
import type { ReactNode } from "react"

type Theme = "light" | "dark"
type ThemeMode = "system" | "light" | "dark"

interface ThemeContextType {
  theme: Theme
  themeMode: ThemeMode
  toggleTheme: () => void
  setThemeMode: (mode: ThemeMode) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Apply theme with transition
const applyTheme = (theme: Theme) => {
  if (typeof window === "undefined") return

  const root = window.document.documentElement
  
  // Add transition class
  root.classList.add("transition-colors", "duration-200")
  
  // Remove existing themes
  root.classList.remove("light", "dark")
  
  // Add new theme
  root.classList.add(theme)
  
  // Remove transition after it completes
  setTimeout(() => {
    root.classList.remove("transition-colors", "duration-200")
  }, 200)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Get initial theme mode (system/light/dark)
  const [mounted, setMounted] = useState(false)
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system")
  const [theme, setTheme] = useState<Theme>("light")

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true)
    const storedMode = localStorage.getItem("themeMode") as ThemeMode | null
    const initialMode = storedMode || "system"
    setThemeModeState(initialMode)
    
    if (initialMode === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      setTheme(systemTheme)
      applyTheme(systemTheme)
    } else {
      setTheme(initialMode as Theme)
      applyTheme(initialMode as Theme)
    }
  }, [])

  // Update theme when mode changes
  const updateThemeFromMode = (mode: ThemeMode) => {
    if (mode === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      setTheme(systemTheme)
      applyTheme(systemTheme)
    } else {
      setTheme(mode as Theme)
      applyTheme(mode as Theme)
    }
  }

  // Handle theme mode changes
  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode)
    localStorage.setItem("themeMode", mode)
    updateThemeFromMode(mode)
  }

  // Listen for system preference changes
  useEffect(() => {
    if (!mounted) return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleChange = () => {
      if (themeMode === "system") {
        updateThemeFromMode("system")
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [themeMode, mounted])

  const toggleTheme = () => {
    const newMode = themeMode === "system" 
      ? theme === "light" ? "dark" : "light"
      : themeMode === "light" ? "dark" : "light"
    setThemeMode(newMode)
  }

  // Prevent flash of wrong theme
  if (!mounted) {
    return null
  }

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        themeMode,
        toggleTheme, 
        setThemeMode,
        isDark: theme === "dark"
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook for using theme
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
