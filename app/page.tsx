'use client';

import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { AppProvider } from '@/contexts/AppProvider';
import { useScan } from '@/contexts/ScanContext';
import { useAppState } from '@/contexts/AppStateContext';
import { useFilter } from '@/contexts/FilterContext';
import { useComparison } from '@/contexts/ComparisonContext';
import { useUrlState, updateUrl } from '@/hooks/useUrlState';
import { exportToCSV, exportToJSON, downloadFile, type ExportMetadata } from '@/lib/utils';
import DirectorySelector from '@/components/DirectorySelector';
import Loading from '@/components/Loading';
import Header from '@/components/Header';
import MainContent from '@/components/MainContent';
import ComparisonView from '@/components/ComparisonView';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent } from '@/components/ui/card';

function HomeContent() {
  const {
    isDarkMode,
    toggleDarkMode,
    isSidebarOpen,
    setIsSidebarOpen,
    viewMode,
    autoRefreshInterval,
    setAutoRefreshInterval,
  } = useAppState();
  const {
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
  } = useScan();
  const {
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
  } = useFilter();
  const {
    isComparisonMode,
    comparisonDir,
    comparisonScanResult,
    isLoadingComparison,
    handleEnterComparisonMode,
    handleExitComparisonMode,
    scanComparisonDirectory,
  } = useComparison();

  const { getShareableUrl } = useUrlState();

  // Sync URL with state changes
  useEffect(() => {
    if (selectedDirectory) {
      updateUrl({
        dirId: selectedDirectory.id,
        path: navigationPath,
        viewMode,
        searchQuery,
        extensionFilter,
        typeFilter,
        advancedFilters,
      });
    }
  }, [
    selectedDirectory,
    navigationPath,
    viewMode,
    searchQuery,
    extensionFilter,
    typeFilter,
    advancedFilters,
  ]);

  // Export handler
  function handleExport(format: 'csv' | 'json') {
    if (!scanResult || !selectedDirectory) {
      toast.error('No data to export', {
        description: 'Please scan a directory first.',
      });
      return;
    }

    try {
      const metadata: ExportMetadata = {
        version: '1.1.0',
        exportedAt: new Date().toISOString(),
        directoryPath: selectedDirectory.path,
        directoryName: selectedDirectory.name,
        totalSize: scanResult.root.size,
        scannedAt: scanResult.scannedAt,
      };

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const dirName = selectedDirectory.name.replace(/[^a-zA-Z0-9]/g, '_');

      if (format === 'csv') {
        const csv = exportToCSV(scanResult.root, metadata);
        const filename = `storyscan_${dirName}_${timestamp}.csv`;
        downloadFile(csv, filename, 'text/csv');

        toast.success('Export successful!', {
          description: `Exported as ${filename}`,
        });
      } else {
        const json = exportToJSON(scanResult.root, metadata);
        const filename = `storyscan_${dirName}_${timestamp}.json`;
        downloadFile(json, filename, 'application/json');

        toast.success('Export successful!', {
          description: `Exported as ${filename}`,
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed', {
        description: 'An error occurred while exporting the data.',
      });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-secondary/10">
      {/* Header */}
      <Header
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        lastScanTime={lastScanTime}
        isLoading={isLoading}
        hasSelectedDirectory={!!selectedDirectory}
        hasScanResult={!!scanResult}
        isComparisonMode={isComparisonMode}
        autoRefreshInterval={autoRefreshInterval}
        onAutoRefreshChange={setAutoRefreshInterval}
        onRefresh={handleRefresh}
        onExport={handleExport}
        onEnterComparisonMode={handleEnterComparisonMode}
        onExitComparisonMode={handleExitComparisonMode}
        getShareableUrl={getShareableUrl}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Directory Selector */}
        <div className="mb-6">
          <DirectorySelector
            directories={directories}
            selected={selectedDirectory}
            onSelect={handleDirectorySelect}
          />
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="p-4">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Content Area */}
        {isLoading ? (
          <Loading message="Scanning directory..." />
        ) : isComparisonMode ? (
          <ComparisonView />
        ) : currentNode && scanResult ? (
          <MainContent />
        ) : (
          !error && (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Select a directory to start scanning</p>
              </CardContent>
            </Card>
          )
        )}
      </main>

      {/* Sidebar */}
      {scanResult && !isComparisonMode && currentNode && <Sidebar />}
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <HomeContent />
    </AppProvider>
  );
}
