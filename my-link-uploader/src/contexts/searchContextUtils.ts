import { createContext } from 'react';

export interface SearchContextType {
  query: string;
  setQuery: (q: string) => void;
}

export const SearchContext = createContext<SearchContextType | undefined>(undefined); 