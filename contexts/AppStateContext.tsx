'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { ViewMode } from '@/types';

interface AppStateContextType {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  toggleDarkMode: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (value: ViewMode) => void;
  autoRefreshInterval: number;
  setAutoRefreshInterval: (value: number) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  // Use system preference for initial dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true; // Default to dark for SSR
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('treemap');
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(0);

  // Apply dark mode class to document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;

      if (isDarkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  // Helper function to toggle dark mode - memoized to prevent unnecessary re-renders
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const value = {
    isDarkMode,
    setIsDarkMode,
    toggleDarkMode,
    isSidebarOpen,
    setIsSidebarOpen,
    viewMode,
    setViewMode,
    autoRefreshInterval,
    setAutoRefreshInterval,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
