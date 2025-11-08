'use client';

import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { FileNode } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { formatBytes, copyToClipboard } from '@/lib/utils';
import { File, Folder, ChevronRight, Copy } from 'lucide-react';

interface TopItemsPanelProps {
  data: FileNode;
  onItemClick?: (node: FileNode) => void;
}

type ViewMode = 'all' | 'files' | 'folders';

export default function TopItemsPanel({ data, onItemClick }: TopItemsPanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all');

  const handleCopyPath = async (path: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent item click
    const success = await copyToClipboard(path);

    if (success) {
      toast.success('Path copied!', {
        description: path,
      });
    }
  };

  const topItems = useMemo(() => {
    const allItems: FileNode[] = [];

    // Recursive function to collect all items
    function collectItems(node: FileNode) {
      if (node.children) {
        for (const child of node.children) {
          allItems.push(child);
          if (child.type === 'directory') {
            collectItems(child);
          }
        }
      }
    }

    collectItems(data);

    // Filter based on view mode
    let filtered = allItems;
    if (viewMode === 'files') {
      filtered = allItems.filter((item) => item.type === 'file');
    } else if (viewMode === 'folders') {
      filtered = allItems.filter((item) => item.type === 'directory');
    }

    // Sort by size and take top 10
    return filtered.sort((a, b) => b.size - a.size).slice(0, 10);
  }, [data, viewMode]);

  const totalSize = useMemo(() => {
    return topItems.reduce((sum, item) => sum + item.size, 0);
  }, [topItems]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-lg font-semibold">Top 10 Largest Items</CardTitle>
        </div>
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => value && setViewMode(value as ViewMode)}
          className="grid grid-cols-3 gap-2"
        >
          <ToggleGroupItem value="all" className="flex-1">
            All
          </ToggleGroupItem>
          <ToggleGroupItem value="files" className="flex-1 gap-1">
            <File className="w-3 h-3" />
            <span>Files</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="folders" className="flex-1 gap-1">
            <Folder className="w-3 h-3" />
            <span>Folders</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <Separator />
      <CardContent className="p-4">
        {topItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">No items found</div>
        ) : (
          <>
            <div className="space-y-2 mb-4">
              {topItems.map((item, index) => {
                const percentage = data.size > 0 ? (item.size / data.size) * 100 : 0;

                return (
                  <div
                    key={item.path}
                    className="group relative w-full p-3 rounded-lg bg-accent/30 hover:bg-accent transition-all duration-200 hover:shadow-md cursor-pointer"
                    onClick={() => onItemClick?.(item)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {item.type === 'directory' ? (
                            <Folder className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          ) : (
                            <File className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          )}
                          <div className="font-medium text-sm truncate">{item.name}</div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <span className="font-semibold text-foreground">
                            {formatBytes(item.size)}
                          </span>
                          <span>•</span>
                          <span>{percentage.toFixed(1)}%</span>
                          {item.type === 'directory' && item.children && (
                            <>
                              <span>•</span>
                              <span>{item.children.length} items</span>
                            </>
                          )}
                          {item.extension && (
                            <>
                              <span>•</span>
                              <span className="text-blue-500">.{item.extension}</span>
                            </>
                          )}
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-primary to-primary/70 h-full rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.path}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleCopyPath(item.path, e)}
                          className="h-7 w-7"
                          title="Copy path"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Separator className="my-3" />

            <div className="flex items-center justify-between text-sm px-2">
              <span className="text-muted-foreground">Total (Top 10)</span>
              <span className="font-semibold">{formatBytes(totalSize)}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
