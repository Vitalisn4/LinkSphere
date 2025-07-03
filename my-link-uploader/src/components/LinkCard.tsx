import React, { useState } from 'react';
import { LinkIcon } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';

interface LinkPreview {
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
}

interface Link {
  id: string;
  url: string;
  title: string;
  description: string;
  click_count: number;
  created_at: string;
  user_id: string;
  preview?: LinkPreview;
  user?: { username: string };
}

interface User {
  id: string;
  username: string;
}

interface LinkCardProps {
  link: Link;
  currentUser: User | null;
  onDelete?: (id: string) => void;
}

const LinkCard: React.FC<LinkCardProps> = ({ link, currentUser, onDelete }) => {
  const [imageError, setImageError] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  const isOwner = currentUser && link.user_id === currentUser.id;
  const hasImage = !!link.preview?.image && !imageError;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Deleting link: ${link.id}`);
    if (onDelete) onDelete(link.id);
  };

  const handleVisit = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Visiting link: ${link.url}`);
    // window.open(link.url, '_blank');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatInTimeZone(date, 'Africa/Douala', 'MMM d, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Layout for owned links with images
  if (isOwner && hasImage) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
        <div className="relative aspect-video">
          <img
            src={link.preview!.image}
            alt={link.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
          {link.preview?.favicon && !faviconError && (
            <img
              src={link.preview.favicon}
              alt="favicon"
              className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white"
              onError={() => setFaviconError(true)}
            />
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-xl font-semibold mb-1 text-gray-100">{link.title}</h3>
          <p className="mb-2 text-gray-400 line-clamp-2">{link.description}</p>
          <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
            <span>{formatDate(link.created_at)}</span>
            <span>{link.click_count} clicks</span>
          </div>
          <div className="mt-auto flex flex-col gap-2">
            <button
              className="ml-auto px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              onClick={handleDelete}
            >
              Delete
            </button>
            <button
              className="w-full px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 transition"
              onClick={handleVisit}
            >
              Visit Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Layout for owned links without images
  if (isOwner && !hasImage) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col relative">
        <button
          className="absolute top-2 right-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition z-10"
          onClick={handleDelete}
        >
          Delete
        </button>
        <div className="flex-1 flex flex-col p-4">
          <div className="w-full h-32 flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500 rounded mb-4">
            <LinkIcon size={48} className="text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-1 text-gray-100">{link.title}</h3>
          <p className="mb-2 text-gray-400 line-clamp-2">{link.description}</p>
          <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
            <span>{formatDate(link.created_at)}</span>
            <span>{link.click_count} clicks</span>
          </div>
          <button
            className="w-full mt-auto px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 transition"
            onClick={handleVisit}
          >
            Visit Link
          </button>
        </div>
      </div>
    );
  }

  // Layout for links not owned by the user
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
      <div className="relative aspect-video">
        {hasImage ? (
          <img
            src={link.preview!.image}
            alt={link.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500">
            <LinkIcon size={48} className="text-white" />
          </div>
        )}
        {link.preview?.favicon && !faviconError && (
          <img
            src={link.preview.favicon}
            alt="favicon"
            className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white"
            onError={() => setFaviconError(true)}
          />
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-xl font-semibold mb-1 text-gray-100">{link.title}</h3>
        <p className="mb-2 text-gray-400 line-clamp-2">{link.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <span>{formatDate(link.created_at)}</span>
          <span>{link.click_count} clicks</span>
        </div>
        <button
          className="w-full mt-auto px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 transition"
          onClick={handleVisit}
        >
          Visit Link
        </button>
      </div>
    </div>
  );
};

export default LinkCard; 