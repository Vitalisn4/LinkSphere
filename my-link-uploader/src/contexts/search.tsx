import React, { ReactNode } from 'react';
import { SearchContext } from './searchContextUtils';

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = React.useState("");
  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = React.useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within a SearchProvider');
  return ctx;
} 