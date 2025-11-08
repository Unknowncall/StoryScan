'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AdvancedFilters, FileNode } from '@/types';
import { useFileFiltering } from '@/hooks/useFileFiltering';
import { useScan } from './ScanContext';

interface FilterContextType {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  extensionFilter: string | null;
  setExtensionFilter: (value: string | null) => void;
  typeFilter: string | null;
  setTypeFilter: (value: string | null) => void;
  advancedFilters: AdvancedFilters;
  setAdvancedFilters: (value: AdvancedFilters) => void;
  filteredNode: FileNode | null;
  matchCount: number;
  availableExtensions: string[];
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const { currentNode } = useScan();
  const [searchQuery, setSearchQuery] = useState('');
  const [extensionFilter, setExtensionFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    size: { enabled: false },
    date: { enabled: false },
  });

  const { filteredNode, matchCount, availableExtensions } = useFileFiltering({
    currentNode,
    searchQuery,
    extensionFilter,
    typeFilter,
    advancedFilters,
  });

  const value = {
    searchQuery,
    setSearchQuery,
    extensionFilter,
    setExtensionFilter,
    typeFilter,
    setTypeFilter,
    advancedFilters,
    setAdvancedFilters,
    filteredNode,
    matchCount,
    availableExtensions,
  };

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}
