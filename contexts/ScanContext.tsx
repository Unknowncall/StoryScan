'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { DirectoryConfig, ScanResult, FileNode } from '@/types';
import { useDirectoryScan } from '@/hooks/useDirectoryScan';
import { useNavigation } from '@/hooks/useNavigation';
import { useAppState } from './AppStateContext';

interface ScanContextType {
  directories: DirectoryConfig[];
  selectedDirectory: DirectoryConfig | null;
  scanResult: ScanResult | null;
  isLoading: boolean;
  error: string | null;
  lastScanTime: Date | null;
  currentNode: FileNode | null;
  navigationPath: string[];
  handleDirectorySelect: (dir: DirectoryConfig) => void;
  handleRefresh: () => void;
  handleNodeClick: (node: FileNode) => void;
  handleBreadcrumbNavigate: (index: number) => void;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export function ScanProvider({ children }: { children: ReactNode }) {
  const { autoRefreshInterval } = useAppState();

  const {
    directories,
    selectedDirectory,
    scanResult,
    isLoading,
    error,
    lastScanTime,
    handleDirectorySelect,
    handleRefresh,
  } = useDirectoryScan(autoRefreshInterval);

  const { currentNode, navigationPath, handleNodeClick, handleBreadcrumbNavigate } =
    useNavigation(scanResult);

  const value = {
    directories,
    selectedDirectory,
    scanResult,
    isLoading,
    error,
    lastScanTime,
    currentNode,
    navigationPath,
    handleDirectorySelect,
    handleRefresh,
    handleNodeClick,
    handleBreadcrumbNavigate,
  };

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export function useScan() {
  const context = useContext(ScanContext);
  if (context === undefined) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
}
