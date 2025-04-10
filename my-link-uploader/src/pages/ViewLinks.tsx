import React from 'react';
import { LinksList } from '../components/LinksList';

export const ViewLinks = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">View Links</h1>
        <LinksList />
      </div>
    </div>
  );
};

export default ViewLinks;
