export interface FileNode {
  name: string;
  path: string;
  size: number;
  type: 'file' | 'directory';
  children?: FileNode[];
  extension?: string;
  percentage?: number;
  modifiedTime?: number; // Unix timestamp in milliseconds
}

export interface DirectoryConfig {
  id: string;
  name: string;
  path: string;
}

export interface ScanProgress {
  current: number;
  total: number;
  currentPath: string;
}

export interface TreemapConfig {
  maxNodes: number;
  maxDepth: number;
  lightThreshold: number;
  moderateThreshold: number;
  aggressiveThreshold: number;
}

export interface ScanResult {
  directory: DirectoryConfig;
  root: FileNode;
  totalSize: number;
  scannedAt: string;
  treemapConfig?: TreemapConfig;
}

export interface TreemapNode {
  name: string;
  path: string;
  value: number;
  percentage: number;
  type: 'file' | 'directory';
  extension?: string;
  children?: TreemapNode[];
}

export interface SizeFilter {
  enabled: boolean;
  min?: number; // in bytes
  max?: number; // in bytes
}

export interface DateFilter {
  enabled: boolean;
  olderThan?: number; // in days
}

export interface AdvancedFilters {
  size: SizeFilter;
  date: DateFilter;
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: AdvancedFilters;
}

export type ViewMode = 'treemap' | 'tree' | 'history';

export interface TrackedPath {
  id: number;
  path: string;
  label: string;
  directoryConfigId?: string;
  createdAt: string;
  isActive: boolean;
}

export interface HistorySnapshot {
  id: number;
  trackedPathId: number;
  sizeBytes: number;
  fileCount: number;
  folderCount: number;
  recordedAt: string;
}

export interface HistoryDataPoint {
  date: Date;
  sizeBytes: number;
  fileCount: number;
  folderCount: number;
}

export interface TrackedPathHistory {
  trackedPath: TrackedPath;
  dataPoints: HistoryDataPoint[];
}

export type HistoryTimeRange = '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';
