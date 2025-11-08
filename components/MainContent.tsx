'use client';

import React from 'react';
import { Grid3x3, FolderTree } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import Stats from '@/components/Stats';
import SearchBar from '@/components/SearchBar';
import AdvancedFiltersPanel from '@/components/AdvancedFiltersPanel';
import Breadcrumb from '@/components/Breadcrumb';
import Treemap from '@/components/Treemap';
import TreeView from '@/components/TreeView';
import FileTypeBreakdown from '@/components/FileTypeBreakdown';
import { useScan } from '@/contexts/ScanContext';
import { useAppState } from '@/contexts/AppStateContext';
import { useFilter } from '@/contexts/FilterContext';

export default function MainContent() {
  const { currentNode, scanResult, navigationPath, handleNodeClick, handleBreadcrumbNavigate } =
    useScan();
  const { viewMode, setViewMode } = useAppState();
  const {
    searchQuery,
    extensionFilter,
    typeFilter,
    advancedFilters,
    filteredNode,
    matchCount,
    availableExtensions,
    setSearchQuery,
    setExtensionFilter,
    setTypeFilter,
    setAdvancedFilters,
  } = useFilter();

  if (!currentNode || !scanResult) {
    return null;
  }

  const hasActiveFilters =
    searchQuery ||
    extensionFilter ||
    typeFilter ||
    advancedFilters.size.enabled ||
    advancedFilters.date.enabled;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Stats */}
      <Stats data={currentNode} scannedAt={scanResult.scannedAt} />

      {/* Search and Filter Bar */}
      <SearchBar
        onSearchChange={setSearchQuery}
        onExtensionFilter={setExtensionFilter}
        availableExtensions={availableExtensions}
        matchCount={hasActiveFilters ? matchCount : undefined}
      />

      {/* Advanced Filters Panel */}
      <AdvancedFiltersPanel filters={advancedFilters} onFiltersChange={setAdvancedFilters} />

      {/* View Mode Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium text-muted-foreground">View:</Label>
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as 'treemap' | 'tree')}
            >
              <ToggleGroupItem value="treemap" aria-label="Treemap view" className="gap-2">
                <Grid3x3 className="w-4 h-4" />
                <span className="hidden sm:inline">Treemap</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="tree" aria-label="Tree view" className="gap-2">
                <FolderTree className="w-4 h-4" />
                <span className="hidden sm:inline">Tree</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>

      {/* Breadcrumb Navigation */}
      {navigationPath.length > 0 && (
        <Breadcrumb
          path={navigationPath}
          fullPath={currentNode.path}
          onNavigate={handleBreadcrumbNavigate}
        />
      )}

      {/* Visualization Area - Switches based on view mode */}
      <Card>
        <CardContent className="p-6">
          <div className="h-[600px]">
            {viewMode === 'treemap' && (
              <Treemap data={filteredNode || currentNode} onNodeClick={handleNodeClick} />
            )}
            {viewMode === 'tree' && (
              <TreeView data={filteredNode || currentNode} onItemClick={handleNodeClick} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Type Breakdown - Full Width */}
      <FileTypeBreakdown
        data={currentNode}
        onTypeClick={(category) => setTypeFilter(category || null)}
        selectedType={typeFilter}
      />
    </div>
  );
}
