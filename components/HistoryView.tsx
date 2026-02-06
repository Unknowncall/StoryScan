'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import HistoryGraph from '@/components/HistoryGraph';
import TrackedPathsManager from '@/components/TrackedPathsManager';
import { useHistory } from '@/contexts/HistoryContext';
import { HistoryTimeRange } from '@/types';

const TIME_RANGES: { value: HistoryTimeRange; label: string }[] = [
  { value: '1W', label: '1W' },
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '6M', label: '6M' },
  { value: '1Y', label: '1Y' },
  { value: 'ALL', label: 'All' },
];

export default function HistoryView() {
  const { historyData, timeRange, setTimeRange, isLoading, trackedPaths } = useHistory();

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium text-muted-foreground">Time Range:</Label>
            <ToggleGroup
              type="single"
              value={timeRange}
              onValueChange={(value) => value && setTimeRange(value as HistoryTimeRange)}
            >
              {TIME_RANGES.map((range) => (
                <ToggleGroupItem
                  key={range.value}
                  value={range.value}
                  aria-label={`Show ${range.label} of history`}
                >
                  {range.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>

      {/* History Graph */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              Loading history...
            </div>
          ) : (
            <HistoryGraph data={historyData} />
          )}
        </CardContent>
      </Card>

      {/* Tracked Paths Manager */}
      <TrackedPathsManager />
    </div>
  );
}
