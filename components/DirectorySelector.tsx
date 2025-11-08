'use client';

import React from 'react';
import { HardDrive } from 'lucide-react';
import { DirectoryConfig } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DirectorySelectorProps {
  directories: DirectoryConfig[];
  selected: DirectoryConfig | null;
  onSelect: (dir: DirectoryConfig) => void;
}

export default function DirectorySelector({
  directories,
  selected,
  onSelect,
}: DirectorySelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <HardDrive className="w-5 h-5 text-primary flex-shrink-0" />
      <Select
        value={selected?.id || ''}
        onValueChange={(value) => {
          const dir = directories.find((d) => d.id === value);
          if (dir) onSelect(dir);
        }}
      >
        <SelectTrigger className="w-full max-w-md">
          <SelectValue placeholder="Select a directory">
            {selected && (
              <div className="flex flex-col items-start text-left overflow-hidden">
                <span className="font-medium truncate w-full">{selected.name}</span>
                <span className="text-xs text-muted-foreground truncate w-full">
                  {selected.path}
                </span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {directories.map((dir) => (
            <SelectItem key={dir.id} value={dir.id} title={dir.path}>
              <div className="flex flex-col items-start min-w-0">
                <span className="font-medium truncate w-full">{dir.name}</span>
                <span className="text-xs text-muted-foreground truncate w-full max-w-[350px]">
                  {dir.path}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
