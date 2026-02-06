'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useHistoryData } from '@/hooks/useHistoryData';
import { TrackedPath, TrackedPathHistory, HistoryTimeRange } from '@/types';

interface HistoryContextType {
  trackedPaths: TrackedPath[];
  historyData: TrackedPathHistory[];
  timeRange: HistoryTimeRange;
  setTimeRange: (range: HistoryTimeRange) => void;
  isLoading: boolean;
  error: string | null;
  addTrackedPath: (path: string, label: string, dirConfigId?: string) => Promise<void>;
  removeTrackedPath: (id: number) => Promise<void>;
  toggleTrackedPath: (id: number, isActive: boolean) => Promise<void>;
  refreshHistory: () => Promise<void>;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const historyData = useHistoryData();

  return <HistoryContext.Provider value={historyData}>{children}</HistoryContext.Provider>;
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}
