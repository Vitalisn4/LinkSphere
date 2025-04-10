import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

// Mock data type
interface Link {
  id: number;
  url: string;
  topic: string;
  description: string;
  uploader: string;
  dateUploaded: string;
}

// Mock data
const mockLinks: Link[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  url: `https://example.com/link${i + 1}`,
  topic: ['React', 'TypeScript', 'JavaScript', 'CSS'][Math.floor(Math.random() * 4)],
  description: `This is a sample link description ${i + 1}`,
  uploader: `user${Math.floor(Math.random() * 5) + 1}`,
  dateUploaded: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0],
}));

const ITEMS_PER_PAGE = 10;

export const LinksList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Link>('dateUploaded');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterUploader, setFilterUploader] = useState('');

  // Filter and sort links
  const filteredLinks = mockLinks.filter(link => {
    const matchTopic = !filterTopic || link.topic.toLowerCase().includes(filterTopic.toLowerCase());
    const matchUploader = !filterUploader || link.uploader.toLowerCase().includes(filterUploader.toLowerCase());
    return matchTopic && matchUploader;
  });

  const sortedLinks = [...filteredLinks].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    return sortDirection === 'asc' 
      ? aValue > bValue ? 1 : -1
      : aValue < bValue ? 1 : -1;
  });

  // Pagination
  const totalPages = Math.ceil(sortedLinks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLinks = sortedLinks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSort = (field: keyof Link) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Filter by topic..."
          className="px-4 py-2 border rounded-lg"
          value={filterTopic}
          onChange={(e) => setFilterTopic(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by uploader..."
          className="px-4 py-2 border rounded-lg"
          value={filterUploader}
          onChange={(e) => setFilterUploader(e.target.value)}
        />
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  className="flex items-center gap-1"
                  onClick={() => handleSort('url')}
                >
                  URL <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  className="flex items-center gap-1"
                  onClick={() => handleSort('topic')}
                >
                  Topic <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  className="flex items-center gap-1"
                  onClick={() => handleSort('uploader')}
                >
                  Uploader <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  className="flex items-center gap-1"
                  onClick={() => handleSort('dateUploaded')}
                >
                  Date <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedLinks.map((link) => (
              <tr key={link.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <a href={link.url} className="text-blue-600 hover:text-blue-800" target="_blank" rel="noopener noreferrer">
                    {link.url}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{link.topic}</td>
                <td className="px-6 py-4 whitespace-nowrap">{link.uploader}</td>
                <td className="px-6 py-4 whitespace-nowrap">{link.dateUploaded}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, sortedLinks.length)} of {sortedLinks.length} results
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="px-4 py-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
