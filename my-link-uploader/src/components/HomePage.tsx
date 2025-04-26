"use client"

import React, { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Search, ArrowRight, LinkIcon } from "lucide-react"

// Define the Link type based on backend struct (match case!)
interface Link {
    id: number;
    user_id: number;
    url: string;
    title: string;
    description: string;
    click_count: number;
    favicon_url?: string; // Optional
    created_at: string; // Date will be string from JSON
    // Ensure case matches backend JSON (or use mapping)
    // If backend sends createdAt, use: createdAt: string;
}

// Define the ApiLink type from backend
interface ApiLink {
    id: number;
    user_id: number; // Might not be used directly in UI
    url: string;
    title: string;
    description: string;
    click_count: number;
    favicon_url?: string; // Optional
    created_at: string; // Date will be string from JSON
}

const HomePage: React.FC = () => {
    const [query, setQuery] = useState<string>("")
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)

    const [links, setLinks] = useState<ApiLink[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = (searchQuery: string) => {
        setQuery(searchQuery)
        // Filtering logic based on `links` state would go here if re-enabled
    }

    const fetchLinks = async () => {
        setLoading(true);
        setError(null);
        try {
            // Assuming backend runs on port 3000
            const response = await fetch('http://localhost:3000/api/links');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: ApiLink[] = await response.json();
            setLinks(data);
        } catch (e: any) {
            console.error("Error fetching links:", e);
            setError("Failed to load links.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus()
        }
        fetchLinks();
    }, [])

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this link?")) {
            return;
        }
        try {
            const response = await fetch(`http://localhost:3000/api/links/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) { // Status 204 No Content is ok
                // Remove link from state to update UI immediately
                setLinks(prevLinks => prevLinks.filter(link => link.id !== id));
                console.log(`Link ${id} deleted successfully.`);
            } else {
                 const errorText = await response.text();
                 throw new Error(`Failed to delete link ${id}. Status: ${response.status}. ${errorText}`);
            }
        } catch (e: any) {
            console.error("Error deleting link:", e);
            setError(`Failed to delete link: ${e.message}`);
            // Optionally re-fetch links if delete failed mid-way
            // fetchLinks();
        }
    };

    // Function to handle link click and increment count
    const handleLinkClick = async (id: number) => {
        try {
            // Send request in the background, don't need to wait/handle response necessarily
            fetch(`http://localhost:3000/api/links/${id}/click`, {
                method: 'POST',
                headers: {
                    // Include headers if your backend requires them (e.g., Content-Type)
                    'Content-Type': 'application/json',
                },
                // No body needed for this specific request
            });
            console.log(`Sent click increment request for link ID: ${id}`);
            // Optional: Immediately increment count in local state for instant UI feedback
            // setLinks(prevLinks => prevLinks.map(link =>
            //     link.id === id ? { ...link, click_count: link.click_count + 1 } : link
            // ));
        } catch (error) {
            // Log error but don't block navigation
            console.error('Failed to send click count increment:', error);
        }
    };

    // Animation variants (unchanged)
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 },
        },
    }

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.h1
                    className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    Welcome to LinkSphere
                </motion.h1>
                <motion.p
                    className="text-xl md:text-2xl mb-2 text-gray-700 dark:text-gray-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    Discover and share valuable resources
                </motion.p>
                <motion.p
                    className="text-lg text-gray-600 dark:text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    Let's make your search easier than ever!
                </motion.p>
            </motion.div>

            <motion.div
                className="relative max-w-2xl mx-auto mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
            >
                <div
                    className={`relative transition-all duration-300 ${
                        isSearchFocused ? "ring-2 ring-purple-500 ring-opacity-50 shadow-lg" : "shadow"
                    }`}
                >
                    <Search
                        size={20}
                        className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                            isSearchFocused ? "text-purple-500" : "text-gray-400"
                        }`}
                    />
                    <input
                        ref={searchInputRef}
                        type="text"
                        className="w-full pl-12 pr-4 py-4 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none transition-all duration-300"
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search for links..."
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                    />
                </div>

                <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {["Programming", "Web Development", "Design", "AI", "Data Science"].map((category, index) => (
                        <motion.button
                            key={category}
                            className="px-4 py-2 text-sm rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/40 transition-colors duration-300"
                            onClick={() => handleSearch(category)}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.9 + index * 0.1, duration: 0.3 }}
                        >
                            {category}
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-purple-100 dark:border-purple-900/30"
            >
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <LinkIcon size={20} className="mr-2 text-purple-500" />
                    Available Links
                </h2>

                {loading && <div className="text-center py-12">Loading links...</div>}
                {error && <div className="text-center py-12 text-red-500">Error: {error}</div>}

                {!loading && !error && links.length === 0 && (
                    <motion.div className="text-center py-12" variants={itemVariants}>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">No links found in the database.</p>
                        <Link
                            to="/upload"
                            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-300"
                        >
                            <span>Add the first link!</span>
                            <ArrowRight size={16} className="ml-2" />
                        </Link>
                    </motion.div>
                )}

                {!loading && !error && links.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2">
                        {links.map((link) => (
                            <motion.div
                                key={link.id}
                                className="group relative p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700/50 shadow-sm hover:shadow-md transition-all duration-300"
                                variants={itemVariants}
                                whileHover={{ y: -4 }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start flex-grow mr-2">
                                        <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300 mr-3 flex-shrink-0"
                                        >
                                            <LinkIcon size={18} className="text-white" />
                                        </a>
                                        <div className="flex-grow">
                                            <a
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={() => handleLinkClick(link.id)}
                                                className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300"
                                            >
                                                {link.title}
                                            </a>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{link.description}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                                <span className="break-all">{link.url}</span>
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                Added: {link.created_at ? new Date(link.created_at).toLocaleString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(link.id)}
                                        className="px-2 py-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded text-xs transition-colors flex-shrink-0"
                                        aria-label={`Delete link ${link.title}`}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {!query && !loading && !error && (
                    <motion.div className="mt-6 text-center" variants={itemVariants}>
                        <Link
                            to="/upload"
                            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            <span>Share a new link</span>
                            <ArrowRight size={16} className="ml-2" />
                        </Link>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default HomePage;
