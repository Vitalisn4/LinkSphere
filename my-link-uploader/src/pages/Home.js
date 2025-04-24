import React from 'react';

function Home() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome to LinkSphere</h1>
      <p className="text-lg mb-6">Your link management solution</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Upload Links</h2>
          <p className="text-gray-600 dark:text-gray-300">Easily upload and manage your links in one place.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">View Links</h2>
          <p className="text-gray-600 dark:text-gray-300">Access all your uploaded links anytime, anywhere.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Admin Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-300">Manage your links and settings with ease.</p>
        </div>
      </div>
    </div>
  );
}

export default Home; 