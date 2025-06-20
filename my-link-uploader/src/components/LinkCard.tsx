import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LinkIcon } from 'lucide-react';
import './LinkCard.css';
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
  preview?: LinkPreview;
}

interface LinkCardProps {
  link: Link;
  onDelete?: (id: string) => void;
}

const LinkCard: React.FC<LinkCardProps> = ({ link }) => {
  const [imageError, setImageError] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  const handleClick = () => {
    window.open(link.url, '_blank');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatInTimeZone(date, 'Africa/Douala', 'MMM d, yyyy HH:mm');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const DefaultPreview = () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500">
      <LinkIcon size={48} className="text-white" />
    </div>
  );

  return (
    <div 
      className="link-card bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl cursor-pointer"
      onClick={handleClick}
    >
      <div className="link-card-image aspect-video">
        {link.preview?.image && !imageError ? (
          <img
            src={link.preview.image}
            alt={link.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <DefaultPreview />
        )}
        {link.preview?.favicon && !faviconError && (
          <img
            src={link.preview.favicon}
            alt="favicon"
            className="link-card-favicon absolute top-2 left-2 w-6 h-6 rounded-full bg-white"
            onError={() => setFaviconError(true)}
          />
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
          {link.title}
        </h3>
        <p className="mb-4 text-gray-600 dark:text-gray-400 line-clamp-2">
          {link.description}
        </p>
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{formatDate(link.created_at)}</span>
          <span>{link.click_count} clicks</span>
        </div>
      </div>
    </div>
  );
};

export default LinkCard; 