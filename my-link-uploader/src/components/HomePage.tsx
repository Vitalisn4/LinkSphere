import React, { useState } from "react";
import "./HomePage.css"; 

const sampleData: string[] = [
  "Traits in Rust",
  "Threads",
  "Pattern matching",
  "Enums",
  "Options and their variants",
];

// Type for search result item
interface ResultItem {
  name: string;
}

const HomePage: React.FC = () => {
  // State for the search query and filtered results
  const [query, setQuery] = useState<string>("");
  const [filteredResults, setFilteredResults] = useState<ResultItem[]>([]);

  // Function to handle real-time search filtering
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value.toLowerCase();
    setQuery(searchQuery);

    if (searchQuery) {
      const results = sampleData
        .filter((item) => item.toLowerCase().includes(searchQuery))
        .map((name) => ({ name }));
      setFilteredResults(results);
    } else {
      setFilteredResults([]);
    }
  };

  return (
    <div className="home-container">
      {/* Intro Section */}
      <div className="intro-text">
        <h1>Welcome to LinkSphere!</h1>
        <p>Love Getting more Leads?</p>
        <p>Let's make your search easier than ever!</p>
      </div>

      {/* Search Bar */}
      <div className="search-bar-container">
        <input
          type="text"
          className="search-bar"
          value={query}
          onChange={handleSearch}
          placeholder="Search..."
        />
      </div>

      {/* Search Results */}
      <div className="search-results">
        {filteredResults.length === 0 && query ? (
          <div className="no-results">No results found</div>
        ) : (
          filteredResults.map((result, index) => (
            <div key={index} className="result-item">
              {result.name}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;
