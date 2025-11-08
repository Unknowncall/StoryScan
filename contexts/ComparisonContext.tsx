'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { toast } from 'sonner';
import { DirectoryConfig, ScanResult } from '@/types';
import { useComparisonMode } from '@/hooks/useComparisonMode';
import { useScan } from './ScanContext';

interface ComparisonContextType {
  isComparisonMode: boolean;
  comparisonDir: DirectoryConfig | null;
  comparisonScanResult: ScanResult | null;
  isLoadingComparison: boolean;
  handleEnterComparisonMode: () => void;
  handleExitComparisonMode: () => void;
  scanComparisonDirectory: (dir: DirectoryConfig) => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const { selectedDirectory, scanResult } = useScan();

  const {
    isComparisonMode,
    comparisonDir,
    comparisonScanResult,
    isLoadingComparison,
    handleEnterComparisonMode,
    handleExitComparisonMode,
    scanComparisonDirectory,
  } = useComparisonMode(selectedDirectory, scanResult, (title, description) => {
    toast.error(title, { description });
  });

  const value = {
    isComparisonMode,
    comparisonDir,
    comparisonScanResult,
    isLoadingComparison,
    handleEnterComparisonMode,
    handleExitComparisonMode,
    scanComparisonDirectory,
  };

  return <ComparisonContext.Provider value={value}>{children}</ComparisonContext.Provider>;
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}
