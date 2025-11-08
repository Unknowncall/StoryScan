'use client';

import React from 'react';
import {
  Moon,
  Sun,
  RefreshCw,
  Clock,
  Download,
  GitCompare,
  X,
  PanelRight,
  PanelRightClose,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ShareButton from '@/components/ShareButton';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  lastScanTime: Date | null;
  isLoading: boolean;
  hasSelectedDirectory: boolean;
  hasScanResult: boolean;
  isComparisonMode: boolean;
  autoRefreshInterval: number;
  onAutoRefreshChange: (interval: number) => void;
  onRefresh: () => void;
  onExport: (format: 'csv' | 'json') => void;
  onEnterComparisonMode: () => void;
  onExitComparisonMode: () => void;
  getShareableUrl: () => string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function Header({
  isDarkMode,
  onToggleDarkMode,
  lastScanTime,
  isLoading,
  hasSelectedDirectory,
  hasScanResult,
  isComparisonMode,
  autoRefreshInterval,
  onAutoRefreshChange,
  onRefresh,
  onExport,
  onEnterComparisonMode,
  onExitComparisonMode,
  getShareableUrl,
  isSidebarOpen,
  onToggleSidebar,
}: HeaderProps) {
  // Format time ago
  function getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  return (
    <header className="border-b bg-card/50 backdrop-blur-lg sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">S</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                StoryScan
              </h1>
              <p className="text-xs text-muted-foreground">Beautiful Disk Usage Visualizer</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Last scanned time */}
            {lastScanTime && !isLoading && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{getTimeAgo(lastScanTime)}</span>
              </div>
            )}

            {/* Auto-refresh selector */}
            {hasSelectedDirectory && !isLoading && (
              <Select
                value={autoRefreshInterval.toString()}
                onValueChange={(value) => onAutoRefreshChange(Number(value))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Auto-refresh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Off</SelectItem>
                  <SelectItem value="300000">5 minutes</SelectItem>
                  <SelectItem value="900000">15 minutes</SelectItem>
                  <SelectItem value="1800000">30 minutes</SelectItem>
                  <SelectItem value="3600000">1 hour</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Refresh button */}
            {hasSelectedDirectory && !isLoading && (
              <Button variant="outline" size="icon" onClick={onRefresh} title="Refresh scan">
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}

            {/* Export button */}
            {hasScanResult && !isLoading && !isComparisonMode && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" title="Export data">
                    <Download className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onExport('csv')}>Export as CSV</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport('json')}>
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Comparison mode button */}
            {hasScanResult && !isLoading && (
              <>
                {!isComparisonMode ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEnterComparisonMode}
                    className="gap-2"
                    title="Enter comparison mode"
                  >
                    <GitCompare className="w-4 h-4" />
                    <span className="hidden sm:inline">Compare</span>
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={onExitComparisonMode}
                    className="gap-2"
                    title="Exit comparison mode"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Exit Compare</span>
                  </Button>
                )}
              </>
            )}

            {/* Share button */}
            {hasScanResult && !isLoading && !isComparisonMode && (
              <ShareButton getShareableUrl={getShareableUrl} />
            )}

            {/* Sidebar toggle */}
            {hasScanResult && !isLoading && !isComparisonMode && (
              <Button
                variant="outline"
                size="icon"
                onClick={onToggleSidebar}
                title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              >
                {isSidebarOpen ? (
                  <PanelRightClose className="w-4 h-4" />
                ) : (
                  <PanelRight className="w-4 h-4" />
                )}
              </Button>
            )}

            {/* Dark mode toggle */}
            <Button variant="outline" size="icon" onClick={onToggleDarkMode}>
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
