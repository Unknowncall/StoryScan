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
  Menu,
  Share2,
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          {/* Logo and Title */}
          <a
            href="/"
            className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-lg sm:text-xl">S</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                StoryScan
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Beautiful Disk Usage Visualizer
              </p>
            </div>
          </a>

          {/* Desktop Controls */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Last scanned time */}
            {lastScanTime && !isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                    <span>Compare</span>
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
                    <span>Exit Compare</span>
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
            <Button variant="outline" size="icon" onClick={onToggleDarkMode} title="Toggle theme">
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>

          {/* Mobile Controls (Tablet and below) */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Always visible: Refresh button on mobile when applicable */}
            {hasSelectedDirectory && !isLoading && (
              <Button
                variant="outline"
                size="icon"
                onClick={onRefresh}
                title="Refresh scan"
                className="flex-shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}

            {/* Dark mode toggle - always visible */}
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleDarkMode}
              title="Toggle theme"
              className="flex-shrink-0"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* Mobile Menu Sheet */}
            {(hasSelectedDirectory || hasScanResult) && !isLoading && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" title="Open menu" className="flex-shrink-0">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 mt-6">
                    {/* Last scanned time */}
                    {lastScanTime && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground px-2">
                        <Clock className="w-4 h-4" />
                        <span>Last scan: {getTimeAgo(lastScanTime)}</span>
                      </div>
                    )}

                    {/* Auto-refresh selector */}
                    {hasSelectedDirectory && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium px-2">Auto-refresh</label>
                        <Select
                          value={autoRefreshInterval.toString()}
                          onValueChange={(value) => onAutoRefreshChange(Number(value))}
                        >
                          <SelectTrigger className="w-full">
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
                      </div>
                    )}

                    {/* Export options */}
                    {hasScanResult && !isComparisonMode && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium px-2">Export</label>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            onClick={() => onExport('csv')}
                            className="w-full justify-start gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Export as CSV
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => onExport('json')}
                            className="w-full justify-start gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Export as JSON
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Comparison mode */}
                    {hasScanResult && (
                      <div className="space-y-2">
                        {!isComparisonMode ? (
                          <Button
                            variant="outline"
                            onClick={onEnterComparisonMode}
                            className="w-full justify-start gap-2"
                          >
                            <GitCompare className="w-4 h-4" />
                            Enter Comparison Mode
                          </Button>
                        ) : (
                          <Button
                            variant="destructive"
                            onClick={onExitComparisonMode}
                            className="w-full justify-start gap-2"
                          >
                            <X className="w-4 h-4" />
                            Exit Comparison Mode
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Share */}
                    {hasScanResult && !isComparisonMode && (
                      <div className="space-y-2">
                        <ShareButton getShareableUrl={getShareableUrl} />
                      </div>
                    )}

                    {/* Sidebar toggle */}
                    {hasScanResult && !isComparisonMode && (
                      <Button
                        variant="outline"
                        onClick={onToggleSidebar}
                        className="w-full justify-start gap-2"
                      >
                        {isSidebarOpen ? (
                          <>
                            <PanelRightClose className="w-4 h-4" />
                            Close Top Items Panel
                          </>
                        ) : (
                          <>
                            <PanelRight className="w-4 h-4" />
                            Open Top Items Panel
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
