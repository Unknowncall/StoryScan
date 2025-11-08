'use client';

import React from 'react';
import { GitCompare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import DirectorySelector from '@/components/DirectorySelector';
import Loading from '@/components/Loading';
import ComparisonStats from '@/components/ComparisonStats';
import Treemap from '@/components/Treemap';
import { useScan } from '@/contexts/ScanContext';
import { useComparison } from '@/contexts/ComparisonContext';

export default function ComparisonView() {
  const { directories, selectedDirectory, scanResult, handleNodeClick } = useScan();
  const { comparisonDir, comparisonScanResult, isLoadingComparison, scanComparisonDirectory } =
    useComparison();

  return (
    <div className="animate-fade-in space-y-6">
      {/* Comparison Instructions */}
      {!comparisonDir && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <GitCompare className="w-12 h-12 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold text-lg mb-2">Comparison Mode Active</h3>
            <p className="text-sm text-muted-foreground">
              Select a second directory below to compare with{' '}
              <strong>{selectedDirectory?.name}</strong>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Second Directory Selector */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Select Directory to Compare</Label>
        <DirectorySelector
          directories={directories.filter((d) => d.id !== selectedDirectory?.id)}
          selected={comparisonDir}
          onSelect={scanComparisonDirectory}
        />
      </div>

      {isLoadingComparison && <Loading message="Scanning comparison directory..." />}

      {/* Split View - Show when both scans are ready */}
      {scanResult && comparisonScanResult && selectedDirectory && comparisonDir && (
        <>
          {/* Comparison Stats */}
          <ComparisonStats
            leftDir={selectedDirectory}
            rightDir={comparisonDir}
            leftData={scanResult.root}
            rightData={comparisonScanResult.root}
          />

          {/* Split Treemap View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Treemap */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">{selectedDirectory.name}</CardTitle>
                <p className="text-xs text-muted-foreground truncate">{selectedDirectory.path}</p>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[500px]">
                  <Treemap data={scanResult.root} onNodeClick={handleNodeClick} />
                </div>
              </CardContent>
            </Card>

            {/* Right Treemap */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">{comparisonDir.name}</CardTitle>
                <p className="text-xs text-muted-foreground truncate">{comparisonDir.path}</p>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[500px]">
                  <Treemap data={comparisonScanResult.root} onNodeClick={() => {}} />
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
