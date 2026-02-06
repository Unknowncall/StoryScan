'use client';

import React, { useState, useMemo } from 'react';
import { Trash2, Plus, FolderOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useHistory } from '@/contexts/HistoryContext';
import { useScan } from '@/contexts/ScanContext';
import { FileNode } from '@/types';

function getSelectablePaths(root: FileNode | null): { path: string; label: string }[] {
  if (!root) return [];

  const paths: { path: string; label: string }[] = [{ path: root.path, label: root.name }];

  if (root.children) {
    for (const child of root.children) {
      if (child.type === 'directory') {
        paths.push({ path: child.path, label: child.name });
      }
    }
  }

  return paths;
}

export default function TrackedPathsManager() {
  const { trackedPaths, addTrackedPath, removeTrackedPath, toggleTrackedPath } = useHistory();
  const { scanResult, currentNode } = useScan();

  const [selectedPath, setSelectedPath] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const selectablePaths = useMemo(() => getSelectablePaths(scanResult?.root || null), [scanResult]);

  const handlePathSelect = (path: string) => {
    setSelectedPath(path);
    const match = selectablePaths.find((p) => p.path === path);
    if (match) {
      setCustomLabel(match.label);
    }
  };

  const handleAdd = async () => {
    if (!selectedPath || !customLabel.trim()) return;

    setIsAdding(true);
    try {
      await addTrackedPath(selectedPath, customLabel.trim(), scanResult?.directory?.id);
      toast.success(`Now tracking "${customLabel.trim()}"`);
      setSelectedPath('');
      setCustomLabel('');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (id: number, label: string) => {
    await removeTrackedPath(id);
    toast.success(`Stopped tracking "${label}"`);
  };

  const handleToggle = async (id: number, isActive: boolean) => {
    await toggleTrackedPath(id, isActive);
  };

  // Filter out already-tracked paths from the dropdown
  const trackedPathSet = new Set(trackedPaths.map((p) => p.path));
  const availablePaths = selectablePaths.filter((p) => !trackedPathSet.has(p.path));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FolderOpen className="w-5 h-5" />
          Tracked Paths
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Path */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Add a path to track</Label>
          <div className="flex gap-2">
            <Select value={selectedPath} onValueChange={handlePathSelect}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a directory..." />
              </SelectTrigger>
              <SelectContent>
                {availablePaths.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    {selectablePaths.length === 0
                      ? 'Scan a directory first'
                      : 'All paths already tracked'}
                  </SelectItem>
                ) : (
                  availablePaths.map((p) => (
                    <SelectItem key={p.path} value={p.path}>
                      {p.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          {selectedPath && (
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Label</Label>
                <Input
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="Custom label..."
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleAdd}
                disabled={isAdding || !customLabel.trim()}
                size="sm"
                className="gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
          )}
          {selectedPath && <p className="text-xs text-muted-foreground truncate">{selectedPath}</p>}
        </div>

        <Separator />

        {/* Tracked Paths List */}
        {trackedPaths.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No paths tracked yet. Add a path above to start recording history.
          </p>
        ) : (
          <div className="space-y-2">
            {trackedPaths.map((tp) => (
              <div
                key={tp.id}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 group"
              >
                <Checkbox
                  checked={tp.isActive}
                  onCheckedChange={(checked) => handleToggle(tp.id, checked === true)}
                  aria-label={`Toggle tracking for ${tp.label}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{tp.label}</span>
                    {!tp.isActive && (
                      <Badge variant="secondary" className="text-xs">
                        paused
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{tp.path}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                  onClick={() => handleRemove(tp.id, tp.label)}
                  aria-label={`Remove ${tp.label}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
