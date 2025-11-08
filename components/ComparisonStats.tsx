'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileNode, DirectoryConfig } from '@/types';
import { formatBytes, formatNumber } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus, TrendingUp, TrendingDown } from 'lucide-react';

interface ComparisonStatsProps {
  leftDir: DirectoryConfig;
  rightDir: DirectoryConfig;
  leftData: FileNode;
  rightData: FileNode;
}

export default function ComparisonStats({
  leftDir,
  rightDir,
  leftData,
  rightData,
}: ComparisonStatsProps) {
  const sizeDiff = rightData.size - leftData.size;
  const sizePercent = leftData.size > 0 ? (sizeDiff / leftData.size) * 100 : 0;

  // Count files in each tree
  function countFiles(node: FileNode): { files: number; folders: number } {
    let files = 0;
    let folders = 0;

    if (node.type === 'file') {
      files = 1;
    } else if (node.type === 'directory') {
      folders = 1;
      if (node.children) {
        for (const child of node.children) {
          const counts = countFiles(child);
          files += counts.files;
          folders += counts.folders;
        }
      }
    }

    return { files, folders };
  }

  const leftCounts = countFiles(leftData);
  const rightCounts = countFiles(rightData);

  const filesDiff = rightCounts.files - leftCounts.files;
  const foldersDiff = rightCounts.folders - leftCounts.folders;

  function DiffIndicator({ value, showIcon = true }: { value: number; showIcon?: boolean }) {
    if (value === 0) {
      return (
        <span className="flex items-center gap-1 text-muted-foreground">
          {showIcon && <Minus className="w-4 h-4" />}
          <span>No change</span>
        </span>
      );
    }

    const isIncrease = value > 0;
    const color = isIncrease
      ? 'text-orange-600 dark:text-orange-400'
      : 'text-green-600 dark:text-green-400';
    const Icon = isIncrease ? ArrowUp : ArrowDown;

    return (
      <span className={`flex items-center gap-1 font-semibold ${color}`}>
        {showIcon && <Icon className="w-4 h-4" />}
        <span>
          {isIncrease ? '+' : ''}
          {value > 0 ? formatNumber(value) : value}
        </span>
      </span>
    );
  }

  function PercentDiff({ value }: { value: number }) {
    if (Math.abs(value) < 0.01) return null;

    const isIncrease = value > 0;
    const color = isIncrease
      ? 'text-orange-600 dark:text-orange-400'
      : 'text-green-600 dark:text-green-400';
    const Icon = isIncrease ? TrendingUp : TrendingDown;

    return (
      <span className={`flex items-center gap-1 text-sm ${color}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{Math.abs(value).toFixed(1)}%</span>
      </span>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Comparison Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Directory Names */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-primary/5 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Directory A</div>
            <div className="font-semibold text-sm truncate" title={leftDir.path}>
              {leftDir.name}
            </div>
          </div>
          <div className="text-center p-3 bg-secondary/20 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Directory B</div>
            <div className="font-semibold text-sm truncate" title={rightDir.path}>
              {rightDir.name}
            </div>
          </div>
        </div>

        {/* Size Comparison */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Size</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold">{formatBytes(leftData.size)}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{formatBytes(rightData.size)}</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2 border-t">
            <span className="text-xs text-muted-foreground">Difference:</span>
            <span
              className={`font-semibold ${sizeDiff > 0 ? 'text-orange-600 dark:text-orange-400' : sizeDiff < 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
            >
              {sizeDiff > 0 ? '+' : ''}
              {formatBytes(Math.abs(sizeDiff))}
            </span>
            <PercentDiff value={sizePercent} />
          </div>
        </div>

        {/* File Count Comparison */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Files</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-base font-semibold">{formatNumber(leftCounts.files)}</div>
            </div>
            <div className="text-center">
              <div className="text-base font-semibold">{formatNumber(rightCounts.files)}</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1 border-t">
            <span className="text-xs text-muted-foreground">Difference:</span>
            <DiffIndicator value={filesDiff} showIcon={false} />
          </div>
        </div>

        {/* Folder Count Comparison */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Folders</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-base font-semibold">{formatNumber(leftCounts.folders)}</div>
            </div>
            <div className="text-center">
              <div className="text-base font-semibold">{formatNumber(rightCounts.folders)}</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1 border-t">
            <span className="text-xs text-muted-foreground">Difference:</span>
            <DiffIndicator value={foldersDiff} showIcon={false} />
          </div>
        </div>

        {/* Winner Summary */}
        <div className="pt-3 border-t">
          {sizeDiff === 0 ? (
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">
                Both directories are the same size
              </div>
            </div>
          ) : (
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Larger Directory</div>
              <div className="text-sm font-bold">{sizeDiff > 0 ? rightDir.name : leftDir.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                by {formatBytes(Math.abs(sizeDiff))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
