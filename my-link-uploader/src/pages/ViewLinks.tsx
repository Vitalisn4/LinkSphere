"use client"

import { useState, useEffect } from "react"
import Pagination from "../components/Pagination"
import LinkCard from "../components/LinkCard"
import SortFilterControls from "../components/SortFilterControls"
import type { Link } from "../types/Link"
import { fetchLinks } from "../services/api"

const ViewLinks = () => {
  const [links, setLinks] = useState<Link[]>([])
  const [filteredLinks, setFilteredLinks] = useState<Link[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [linksPerPage] = useState(6)

  // Sorting and filtering state
  const [sortBy, setSortBy] = useState<"date" | "topic" | "uploader">("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [filterTopic, setFilterTopic] = useState<string>("")
  const [filterUploader, setFilterUploader] = useState<string>("")

  // Fetch links on component mount
  useEffect(() => {
    const getLinks = async () => {
      try {
        setIsLoading(true)
        const data = await fetchLinks()
        setLinks(data)
        setFilteredLinks(data)
      } catch (err) {
        setError("Failed to fetch links. Please try again later.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    getLinks()
  }, [])

  // Apply sorting and filtering
  useEffect(() => {
    let result = [...links]

    // Apply topic filter
    if (filterTopic) {
      result = result.filter((link) => link.topic.toLowerCase().includes(filterTopic.toLowerCase()))
    }

    // Apply uploader filter
    if (filterUploader) {
      result = result.filter((link) => link.uploader.toLowerCase().includes(filterUploader.toLowerCase()))
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === "date") {
        return sortDirection === "asc"
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else if (sortBy === "topic") {
        return sortDirection === "asc" ? a.topic.localeCompare(b.topic) : b.topic.localeCompare(a.topic)
      } else {
        return sortDirection === "asc" ? a.uploader.localeCompare(b.uploader) : b.uploader.localeCompare(a.uploader)
      }
    })

    setFilteredLinks(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [links, sortBy, sortDirection, filterTopic, filterUploader])

  // Get current links for pagination
  const indexOfLastLink = currentPage * linksPerPage
  const indexOfFirstLink = indexOfLastLink - linksPerPage
  const currentLinks = filteredLinks.slice(indexOfFirstLink, indexOfLastLink)
  const totalPages = Math.ceil(filteredLinks.length / linksPerPage)

  // Change page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Handle sort and filter changes
  const handleSortChange = (sortOption: "date" | "topic" | "uploader") => {
    if (sortBy === sortOption) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(sortOption)
      setSortDirection("desc")
    }
  }

  const handleFilterChange = (filterType: "topic" | "uploader", value: string) => {
    if (filterType === "topic") {
      setFilterTopic(value)
    } else {
      setFilterUploader(value)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Shared Links</h1>

      <SortFilterControls
        sortBy={sortBy}
        sortDirection={sortDirection}
        filterTopic={filterTopic}
        filterUploader={filterUploader}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
      />

      {filteredLinks.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">No links found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {currentLinks.map((link) => (
              <LinkCard key={link.id} link={link} />
            ))}
          </div>

          <div className="mt-8">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        </>
      )}
    </div>
  )
}

export default ViewLinks
