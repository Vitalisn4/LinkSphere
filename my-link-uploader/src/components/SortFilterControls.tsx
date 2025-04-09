"use client"

import { ArrowDown, ArrowUp, Filter } from "lucide-react"
import { useState } from "react"

interface SortFilterControlsProps {
  sortBy: "date" | "topic" | "uploader"
  sortDirection: "asc" | "desc"
  filterTopic: string
  filterUploader: string
  onSortChange: (sortBy: "date" | "topic" | "uploader") => void
  onFilterChange: (filterType: "topic" | "uploader", value: string) => void
}

const SortFilterControls = ({
  sortBy,
  sortDirection,
  filterTopic,
  filterUploader,
  onSortChange,
  onFilterChange,
}: SortFilterControlsProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Sort by:</span>
          <div className="flex space-x-1">
            <button
              onClick={() => onSortChange("date")}
              className={`px-3 py-1 text-sm rounded-md flex items-center ${
                sortBy === "date"
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Date
              {sortBy === "date" &&
                (sortDirection === "asc" ? (
                  <ArrowUp className="ml-1 h-3 w-3" />
                ) : (
                  <ArrowDown className="ml-1 h-3 w-3" />
                ))}
            </button>
            <button
              onClick={() => onSortChange("topic")}
              className={`px-3 py-1 text-sm rounded-md flex items-center ${
                sortBy === "topic"
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Topic
              {sortBy === "topic" &&
                (sortDirection === "asc" ? (
                  <ArrowUp className="ml-1 h-3 w-3" />
                ) : (
                  <ArrowDown className="ml-1 h-3 w-3" />
                ))}
            </button>
            <button
              onClick={() => onSortChange("uploader")}
              className={`px-3 py-1 text-sm rounded-md flex items-center ${
                sortBy === "uploader"
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Uploader
              {sortBy === "uploader" &&
                (sortDirection === "asc" ? (
                  <ArrowUp className="ml-1 h-3 w-3" />
                ) : (
                  <ArrowDown className="ml-1 h-3 w-3" />
                ))}
            </button>
          </div>
        </div>

        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center px-3 py-1 text-sm rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <Filter className="h-4 w-4 mr-1" />
          Filters
          {(filterTopic || filterUploader) && <span className="ml-1 w-2 h-2 rounded-full bg-primary"></span>}
        </button>
      </div>

      {isFilterOpen && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="topic-filter" className="block text-sm font-medium mb-1">
                Filter by Topic
              </label>
              <input
                id="topic-filter"
                type="text"
                value={filterTopic}
                onChange={(e) => onFilterChange("topic", e.target.value)}
                placeholder="Enter topic..."
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="uploader-filter" className="block text-sm font-medium mb-1">
                Filter by Uploader
              </label>
              <input
                id="uploader-filter"
                type="text"
                value={filterUploader}
                onChange={(e) => onFilterChange("uploader", e.target.value)}
                placeholder="Enter uploader name..."
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {(filterTopic || filterUploader) && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => {
                  onFilterChange("topic", "")
                  onFilterChange("uploader", "")
                }}
                className="text-sm text-primary hover:text-primary/80"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SortFilterControls
