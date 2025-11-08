'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, X, Filter as FilterIcon } from 'lucide-react';
import { AdvancedFilters, FilterPreset } from '@/types';
import { formatBytes } from '@/lib/utils';

interface AdvancedFiltersPanelProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
}

const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'large-files',
    name: 'Large Files',
    description: 'Files larger than 1GB',
    filters: {
      size: { enabled: true, min: 1024 * 1024 * 1024 },
      date: { enabled: false },
    },
  },
  {
    id: 'old-files',
    name: 'Old Files',
    description: 'Files older than 1 year',
    filters: {
      size: { enabled: false },
      date: { enabled: true, olderThan: 365 },
    },
  },
  {
    id: 'large-old-files',
    name: 'Large Old Files',
    description: 'Files >500MB and older than 6 months',
    filters: {
      size: { enabled: true, min: 500 * 1024 * 1024 },
      date: { enabled: true, olderThan: 180 },
    },
  },
  {
    id: 'tiny-files',
    name: 'Tiny Files',
    description: 'Files smaller than 1MB',
    filters: {
      size: { enabled: true, max: 1024 * 1024 },
      date: { enabled: false },
    },
  },
];

export default function AdvancedFiltersPanel({
  filters,
  onFiltersChange,
}: AdvancedFiltersPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sizeMin, setSizeMin] = useState(
    filters.size.min ? (filters.size.min / (1024 * 1024)).toString() : ''
  );
  const [sizeMax, setSizeMax] = useState(
    filters.size.max ? (filters.size.max / (1024 * 1024)).toString() : ''
  );
  const [dateOlderThan, setDateOlderThan] = useState(filters.date.olderThan?.toString() || '');

  const hasActiveFilters = filters.size.enabled || filters.date.enabled;

  function handleSizeToggle(enabled: boolean) {
    onFiltersChange({
      ...filters,
      size: { ...filters.size, enabled },
    });
  }

  function handleDateToggle(enabled: boolean) {
    onFiltersChange({
      ...filters,
      date: { ...filters.date, enabled },
    });
  }

  function handleSizeMinChange(value: string) {
    setSizeMin(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onFiltersChange({
        ...filters,
        size: { ...filters.size, min: numValue * 1024 * 1024 },
      });
    } else if (value === '') {
      onFiltersChange({
        ...filters,
        size: { ...filters.size, min: undefined },
      });
    }
  }

  function handleSizeMaxChange(value: string) {
    setSizeMax(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onFiltersChange({
        ...filters,
        size: { ...filters.size, max: numValue * 1024 * 1024 },
      });
    } else if (value === '') {
      onFiltersChange({
        ...filters,
        size: { ...filters.size, max: undefined },
      });
    }
  }

  function handleDateChange(value: string) {
    setDateOlderThan(value);
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      onFiltersChange({
        ...filters,
        date: { ...filters.date, olderThan: numValue },
      });
    } else if (value === '') {
      onFiltersChange({
        ...filters,
        date: { ...filters.date, olderThan: undefined },
      });
    }
  }

  function handlePresetClick(preset: FilterPreset) {
    onFiltersChange(preset.filters);
    setSizeMin(preset.filters.size.min ? (preset.filters.size.min / (1024 * 1024)).toString() : '');
    setSizeMax(preset.filters.size.max ? (preset.filters.size.max / (1024 * 1024)).toString() : '');
    setDateOlderThan(preset.filters.date.olderThan?.toString() || '');
  }

  function handleClearAll() {
    const emptyFilters: AdvancedFilters = {
      size: { enabled: false },
      date: { enabled: false },
    };
    onFiltersChange(emptyFilters);
    setSizeMin('');
    setSizeMax('');
    setDateOlderThan('');
  }

  function getActiveFilterChips() {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];

    if (filters.size.enabled) {
      let label = 'Size: ';
      if (filters.size.min && filters.size.max) {
        label += `${formatBytes(filters.size.min)} - ${formatBytes(filters.size.max)}`;
      } else if (filters.size.min) {
        label += `> ${formatBytes(filters.size.min)}`;
      } else if (filters.size.max) {
        label += `< ${formatBytes(filters.size.max)}`;
      } else {
        label += 'any';
      }
      chips.push({
        key: 'size',
        label,
        onRemove: () => handleSizeToggle(false),
      });
    }

    if (filters.date.enabled && filters.date.olderThan) {
      chips.push({
        key: 'date',
        label: `Older than ${filters.date.olderThan} days`,
        onRemove: () => handleDateToggle(false),
      });
    }

    return chips;
  }

  const activeChips = getActiveFilterChips();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FilterIcon className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-semibold">Advanced Filters</CardTitle>
            {hasActiveFilters && <Badge variant="default">{activeChips.length}</Badge>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-1"
          >
            {isExpanded ? (
              <>
                <span className="text-xs">Collapse</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span className="text-xs">Expand</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {/* Active Filter Chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {activeChips.map((chip) => (
              <Badge
                key={chip.key}
                variant="secondary"
                className="flex items-center gap-1.5 px-2.5 py-1"
              >
                <span>{chip.label}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={chip.onRemove}
                  className="h-4 w-4 p-0 hover:bg-primary/20"
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
            {activeChips.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-xs h-6 px-2"
              >
                Clear All
              </Button>
            )}
          </div>
        )}
      </CardHeader>

      {isExpanded && (
        <>
          <Separator />
          <CardContent className="pt-4 space-y-6">
            {/* Presets */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Quick Presets</Label>
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_PRESETS.map((preset) => (
                  <Button
                    key={preset.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetClick(preset)}
                    className="h-auto flex-col items-start text-left p-3 hover:bg-accent"
                  >
                    <span className="font-medium text-sm">{preset.name}</span>
                    <span className="text-xs text-muted-foreground">{preset.description}</span>
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Size Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Checkbox
                  id="size-filter-toggle"
                  checked={filters.size.enabled}
                  onCheckedChange={handleSizeToggle}
                />
                <Label
                  htmlFor="size-filter-toggle"
                  className="text-sm font-semibold cursor-pointer"
                >
                  Filter by Size
                </Label>
              </div>

              {filters.size.enabled && (
                <div className="space-y-3 pl-6">
                  <div>
                    <Label htmlFor="size-min" className="text-xs text-muted-foreground">
                      Minimum Size (MB)
                    </Label>
                    <Input
                      id="size-min"
                      type="number"
                      min="0"
                      step="1"
                      value={sizeMin}
                      onChange={(e) => handleSizeMinChange(e.target.value)}
                      placeholder="e.g., 100"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="size-max" className="text-xs text-muted-foreground">
                      Maximum Size (MB)
                    </Label>
                    <Input
                      id="size-max"
                      type="number"
                      min="0"
                      step="1"
                      value={sizeMax}
                      onChange={(e) => handleSizeMaxChange(e.target.value)}
                      placeholder="e.g., 5000"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Date Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Checkbox
                  id="date-filter-toggle"
                  checked={filters.date.enabled}
                  onCheckedChange={handleDateToggle}
                />
                <Label
                  htmlFor="date-filter-toggle"
                  className="text-sm font-semibold cursor-pointer"
                >
                  Filter by Age
                </Label>
              </div>

              {filters.date.enabled && (
                <div className="pl-6">
                  <Label htmlFor="date-older" className="text-xs text-muted-foreground">
                    Show files older than (days)
                  </Label>
                  <Input
                    id="date-older"
                    type="number"
                    min="1"
                    step="1"
                    value={dateOlderThan}
                    onChange={(e) => handleDateChange(e.target.value)}
                    placeholder="e.g., 365"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Examples: 30 (1 month), 90 (3 months), 365 (1 year)
                  </p>
                </div>
              )}
            </div>

            {hasActiveFilters && (
              <>
                <Separator />
                <Button variant="outline" size="sm" onClick={handleClearAll} className="w-full">
                  Clear All Filters
                </Button>
              </>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
}
