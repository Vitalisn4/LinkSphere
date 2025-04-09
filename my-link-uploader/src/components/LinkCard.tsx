import type { Link as LinkType } from "../types/Link"
import { formatDate } from "../utils/dateUtils"

interface LinkCardProps {
  link: LinkType
}

const LinkCard = ({ link }: LinkCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-5">
        <div className="flex items-center mb-3">
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
            {link.topic}
          </span>
          <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">{formatDate(link.createdAt)}</span>
        </div>

        <h3 className="text-lg font-semibold mb-2 truncate">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary"
          >
            {link.title}
          </a>
        </h3>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{link.description}</p>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Shared by <span className="font-medium">{link.uploader}</span>
          </div>

          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            Visit Link →
          </a>
        </div>
      </div>
    </div>
  )
}

export default LinkCard
