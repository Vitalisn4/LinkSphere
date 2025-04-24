"use client"

import { createContext, useState, useEffect, type ReactNode } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Export ThemeContext so the hook can import it
export { ThemeContext };

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Check for user preference or stored preference
  const getInitialTheme = (): Theme => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme") as Theme | null

      if (storedTheme) {
        return storedTheme
      }

      const userPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      return userPrefersDark ? "dark" : "light"
    }

    return "light"
  }

  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")
    root.classList.add(theme)

    localStorage.setItem("theme", theme)
  }, [theme])

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleChange = () => {
      if (!localStorage.getItem("theme")) {
        setTheme(mediaQuery.matches ? "dark" : "light")
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}
