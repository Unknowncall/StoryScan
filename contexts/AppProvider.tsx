'use client';

import React, { ReactNode } from 'react';
import { AppStateProvider } from './AppStateContext';
import { ScanProvider } from './ScanContext';
import { FilterProvider } from './FilterContext';
import { ComparisonProvider } from './ComparisonContext';
import { HistoryProvider } from './HistoryContext';

/**
 * AppProvider combines all context providers in the correct order.
 *
 * Provider hierarchy:
 * 1. AppStateProvider - UI state (dark mode, sidebar, view mode)
 * 2. ScanProvider - Directory scanning and navigation (depends on AppState)
 * 3. FilterProvider - Search and filtering (depends on Scan)
 * 4. ComparisonProvider - Comparison mode (depends on Scan)
 * 5. HistoryProvider - Historical scan tracking (independent)
 */
export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <AppStateProvider>
      <ScanProvider>
        <FilterProvider>
          <ComparisonProvider>
            <HistoryProvider>{children}</HistoryProvider>
          </ComparisonProvider>
        </FilterProvider>
      </ScanProvider>
    </AppStateProvider>
  );
}
