'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';

interface SearchBarProps {
  onSearchChange: (query: string) => void;
  onExtensionFilter: (extension: string | null) => void;
  availableExtensions: string[];
  matchCount?: number;
}

export default function SearchBar({
  onSearchChange,
  onExtensionFilter,
  availableExtensions,
  matchCount,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExtension, setSelectedExtension] = useState<string | null>(null);

  useEffect(() => {
    const debounce = setTimeout(() => {
      onSearchChange(searchQuery);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, onSearchChange]);

  const handleClearSearch = () => {
    setSearchQuery('');
    onSearchChange('');
  };

  const handleExtensionChange = (value: string) => {
    if (value === 'all') {
      setSelectedExtension(null);
      onExtensionFilter(null);
    } else {
      setSelectedExtension(value);
      onExtensionFilter(value);
    }
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setSelectedExtension(null);
    onSearchChange('');
    onExtensionFilter(null);
  };

  const hasActiveFilters = searchQuery.length > 0 || selectedExtension !== null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Extension Filter */}
          <div className="flex gap-2">
            <Select value={selectedExtension || 'all'} onValueChange={handleExtensionChange}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="File type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {availableExtensions.sort().map((ext) => (
                  <SelectItem key={ext} value={ext}>
                    .{ext}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleClearAll}
                title="Clear all filters"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Results Count */}
        {(searchQuery || selectedExtension) && matchCount !== undefined && (
          <div className="mt-3 text-sm text-muted-foreground">
            {matchCount === 0 ? (
              <span className="text-destructive">No results found</span>
            ) : (
              <span>
                Found <span className="font-semibold text-foreground">{matchCount}</span>{' '}
                {matchCount === 1 ? 'match' : 'matches'}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
