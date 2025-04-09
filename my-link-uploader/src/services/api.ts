import type { Link } from "../types/Link"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"

export const fetchLinks = async (): Promise<Link[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/links`)

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching links:", error)
    throw error
  }
}

// Add more API functions as needed
