'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { FileNode } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatBytes, formatPercentage } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FileTypeBreakdownProps {
  data: FileNode;
  onTypeClick?: (category: string) => void;
  selectedType?: string | null;
}

interface CategoryData {
  category: string;
  size: number;
  count: number;
  color: string;
  extensions: string[];
}

// Extension categories based on roadmap
const EXTENSION_CATEGORIES: Record<string, { color: string; extensions: string[] }> = {
  Videos: {
    color: '#8b5cf6',
    extensions: ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'm4v'],
  },
  Images: {
    color: '#ef4444',
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'tiff'],
  },
  Documents: {
    color: '#f59e0b',
    extensions: ['pdf', 'doc', 'docx', 'txt', 'xlsx', 'pptx', 'odt'],
  },
  Audio: {
    color: '#10b981',
    extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'],
  },
  Archives: {
    color: '#06b6d4',
    extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'iso'],
  },
  Code: {
    color: '#fbbf24',
    extensions: [
      'js',
      'ts',
      'tsx',
      'py',
      'java',
      'cpp',
      'c',
      'h',
      'css',
      'html',
      'jsx',
      'json',
      'xml',
    ],
  },
};

export default function FileTypeBreakdown({
  data,
  onTypeClick,
  selectedType,
}: FileTypeBreakdownProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 240, height: 240 });

  const categoryData = useMemo(() => {
    const categories: Map<string, { size: number; count: number; extensions: Set<string> }> =
      new Map();

    // Initialize categories
    Object.keys(EXTENSION_CATEGORIES).forEach((cat) => {
      categories.set(cat, { size: 0, count: 0, extensions: new Set() });
    });
    categories.set('Other', { size: 0, count: 0, extensions: new Set() });

    // Collect all files recursively
    function collectFiles(node: FileNode) {
      if (node.type === 'file' && node.extension) {
        let categorized = false;

        // Find matching category
        for (const [category, config] of Object.entries(EXTENSION_CATEGORIES)) {
          if (config.extensions.includes(node.extension.toLowerCase())) {
            const cat = categories.get(category)!;
            cat.size += node.size;
            cat.count += 1;
            cat.extensions.add(node.extension);
            categorized = true;
            break;
          }
        }

        // If not categorized, add to Other
        if (!categorized) {
          const other = categories.get('Other')!;
          other.size += node.size;
          other.count += 1;
          other.extensions.add(node.extension);
        }
      }

      if (node.children) {
        node.children.forEach(collectFiles);
      }
    }

    collectFiles(data);

    // Convert to array and filter out empty categories
    const result: CategoryData[] = [];
    categories.forEach((value, category) => {
      if (value.size > 0) {
        const color = EXTENSION_CATEGORIES[category]?.color || '#6b7280';
        result.push({
          category,
          size: value.size,
          count: value.count,
          color,
          extensions: Array.from(value.extensions),
        });
      }
    });

    return result.sort((a, b) => b.size - a.size);
  }, [data]);

  const totalSize = useMemo(() => {
    return categoryData.reduce((sum, cat) => sum + cat.size, 0);
  }, [categoryData]);

  useEffect(() => {
    if (!svgRef.current || categoryData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = dimensions.width;
    const height = dimensions.height;
    const radius = Math.min(width, height) / 2 - 10;

    const g = svg.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);

    const pie = d3
      .pie<CategoryData>()
      .value((d) => d.size)
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<CategoryData>>()
      .innerRadius(radius * 0.6) // Donut chart
      .outerRadius(radius);

    const outerArc = d3
      .arc<d3.PieArcDatum<CategoryData>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 1.05);

    const arcs = g.selectAll('.arc').data(pie(categoryData)).join('g').attr('class', 'arc');

    // Add paths with animation
    arcs
      .append('path')
      .attr('fill', (d) => d.data.color)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .style('opacity', (d) => (selectedType && selectedType !== d.data.category ? 0.3 : 0.85))
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .style('opacity', 1)
          .attr('transform', function () {
            const [x, y] = arc.centroid(d);
            return `translate(${x * 0.05}, ${y * 0.05})`;
          });
        setHoveredCategory(d.data.category);
      })
      .on('mouseleave', function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .style('opacity', selectedType && selectedType !== d.data.category ? 0.3 : 0.85)
          .attr('transform', 'translate(0, 0)');
        setHoveredCategory(null);
      })
      .on('click', function (event, d) {
        if (onTypeClick) {
          onTypeClick(selectedType === d.data.category ? '' : d.data.category);
        }
      })
      .transition()
      .duration(800)
      .attrTween('d', function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return arc(interpolate(t)) || '';
        };
      });

    // Add percentage labels
    arcs
      .append('text')
      .attr('transform', (d) => {
        const pos = arc.centroid(d);
        return `translate(${pos})`;
      })
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .style('pointer-events', 'none')
      .style('text-shadow', '0 1px 2px rgba(0,0,0,0.8)')
      .text((d) => {
        const percentage = (d.data.size / totalSize) * 100;
        return percentage > 5 ? `${percentage.toFixed(0)}%` : '';
      })
      .style('opacity', 0)
      .transition()
      .delay(800)
      .duration(400)
      .style('opacity', 1);
  }, [categoryData, totalSize, dimensions, selectedType, onTypeClick]);

  if (categoryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">File Type Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground py-8">No files to analyze</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">File Type Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Chart */}
        <div className="flex justify-center mb-4">
          <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
        </div>

        {/* Legend - Compact */}
        <div className="space-y-1.5">
          {categoryData.map((category) => {
            const percentage = (category.size / totalSize) * 100;
            const isHovered = hoveredCategory === category.category;
            const isSelected = selectedType === category.category;

            return (
              <Button
                key={category.category}
                variant="ghost"
                onClick={() => onTypeClick?.(isSelected ? '' : category.category)}
                className={`w-full h-auto text-left p-2.5 rounded-lg transition-all duration-200 justify-start ${
                  isHovered || isSelected
                    ? 'bg-accent shadow-md'
                    : 'bg-accent/30 hover:bg-accent/50'
                } ${selectedType && !isSelected ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-2.5 w-full">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs">{category.category}</span>
                      <span className="text-xs font-semibold">{formatBytes(category.size)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{category.count} files</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
