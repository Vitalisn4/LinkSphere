import React from 'react';
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

const LinkCard: React.FC<LinkCardProps> = ({ link, onDelete }) => {
  const handleClick = () => {
    window.open(link.url, '_blank');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(link.id);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      // Ensure the date string is in UTC format
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
        {link.preview?.image ? (
          <img
            src={link.preview.image}
            alt={link.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const defaultPreview = document.createElement('div');
              defaultPreview.className = "w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500";
              const icon = document.createElement('div');
              icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`;
              defaultPreview.appendChild(icon);
              target.parentElement?.appendChild(defaultPreview);
            }}
          />
        ) : (
          <DefaultPreview />
        )}
        {link.preview?.favicon && (
          <img
            src={link.preview.favicon}
            alt="favicon"
            className="link-card-favicon absolute top-2 left-2 w-6 h-6 rounded-full bg-white"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        )}
      </div>
      <div className="link-card-content p-4">
        <div className="flex items-start justify-between">
          <h3 className="link-card-title text-lg font-semibold text-gray-900 dark:text-white">
            {link.title}
          </h3>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="link-card-delete ml-2 p-1 text-gray-500 hover:text-red-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
        <p className="link-card-description mt-2 text-sm text-gray-600 dark:text-gray-300">
          {link.description}
        </p>
        <div className="link-card-stats mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <span>{formatDate(link.created_at)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>{link.click_count} clicks</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkCard; 