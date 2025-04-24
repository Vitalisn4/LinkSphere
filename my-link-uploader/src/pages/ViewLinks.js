import React from 'react';

function ViewLinks() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">View Links</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b-2 border-gray-200 dark:border-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Link
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-200 dark:border-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-200 dark:border-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">
                    example.com
                  </a>
                </td>
                <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  Sample link description
                </td>
                <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ViewLinks; 