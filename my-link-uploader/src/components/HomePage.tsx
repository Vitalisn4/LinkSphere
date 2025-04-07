import React, { useState } from "react";
import "./HomePage.css"; // import the styles

// Sample data (this can be replaced with real data from an API or database)
const sampleData: string[] = [
  "Traits",
  "Threads",
  "Pattern",
  "Enum",
  "Options",
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
        <h1>Welcome to My Website!</h1>
        <p>
          Your go-to place for everything you need. Explore, search, and enjoy!
        </p>
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
