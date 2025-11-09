'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { FileNode } from '@/types';
import { formatBytes, formatPercentage, getColorForExtension, getColorForPath } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface TreemapProps {
  data: FileNode;
  onNodeClick?: (node: FileNode) => void;
  maxDepth?: number;
  minSizePercentage?: number;
  maxNodes?: number;
}

interface TreemapData extends d3.HierarchyRectangularNode<FileNode> {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export default function Treemap({
  data,
  onNodeClick,
  maxDepth = 5,
  minSizePercentage = 0.05, // Increased to filter out tiny items
  maxNodes = 1500, // Reduced for better performance
}: TreemapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<FileNode | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hiddenItemsInfo, setHiddenItemsInfo] = useState<
    Map<string, { count: number; totalSize: number }>
  >(new Map());

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    const hierarchy = d3
      .hierarchy(data)
      .sum((d) => (d.type === 'file' ? d.size : 0))
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemapLayout = d3
      .treemap<FileNode>()
      .size([width, height])
      .paddingOuter(3)
      .paddingTop(19)
      .paddingInner(2)
      .round(true);

    const root = treemapLayout(hierarchy) as TreemapData;

    const g = svg.append('g');

    // Performance optimization: filter nodes by depth, size, and count
    const totalSize = root.value || 1;
    const minSize = (totalSize * minSizePercentage) / 100;

    // Get all descendants and filter them
    let nodes = root
      .descendants()
      .filter((d) => {
        // Skip root node
        if (d.depth === 0) return false;
        // Limit depth
        if (d.depth > maxDepth) return false;
        // Filter by minimum size
        if ((d.value || 0) < minSize) return false;
        return true;
      })
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Track which nodes were truncated
    const totalNodesBeforeTruncation = nodes.length;
    const wasTruncated = nodes.length > maxNodes;

    // Limit total number of nodes for performance
    if (wasTruncated) {
      nodes = nodes.slice(0, maxNodes);
    }

    // Calculate hidden items per parent directory
    const hiddenItemsMap = new Map<string, { count: number; totalSize: number }>();

    // For each parent in the visible tree, count hidden children
    root.descendants().forEach((parent) => {
      if (!parent.children || parent.children.length === 0) return;

      const hiddenChildren = parent.children.filter((child) => {
        const isTooSmall = (child.value || 0) < minSize;
        const isTooDeep = child.depth > maxDepth;
        const isNotInVisibleNodes = !nodes.some((n) => n === child);
        return isTooSmall || isTooDeep || isNotInVisibleNodes;
      });

      if (hiddenChildren.length > 0) {
        const hiddenSize = hiddenChildren.reduce((sum, child) => sum + (child.value || 0), 0);
        hiddenItemsMap.set(parent.data.path, {
          count: hiddenChildren.length,
          totalSize: hiddenSize,
        });
      }
    });

    // Update state for tooltip usage
    setHiddenItemsInfo(hiddenItemsMap);

    // Create cell groups
    const cell = g
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('transform', (d) => `translate(${d.x0},${d.y0})`);

    // Add rectangles for all items - even small ones
    cell
      .append('rect')
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => d.y1 - d.y0)
      .attr('fill', (d, i) => {
        if (d.data.type === 'file' && d.data.extension) {
          return getColorForExtension(d.data.extension);
        }
        return getColorForPath(d.data.path, i);
      })
      .attr('stroke', (d) => {
        const width = d.x1 - d.x0;
        const height = d.y1 - d.y0;
        // Slightly brighter border for very small items to make them visible
        return width < 20 || height < 20 ? 'rgba(255,255,255,0.5)' : '#fff';
      })
      .attr('stroke-width', (d) => {
        const width = d.x1 - d.x0;
        const height = d.y1 - d.y0;
        // Thinner borders for very small items
        return width < 10 || height < 10 ? 0.5 : 1;
      })
      .attr('rx', (d) => {
        const width = d.x1 - d.x0;
        const height = d.y1 - d.y0;
        // Less rounding for very small items
        return width < 15 || height < 15 ? 2 : 4;
      })
      .attr('opacity', 0.85)
      .style('cursor', 'pointer')
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', 1)
          .attr('stroke-width', 2)
          .attr('stroke', '#fff');
        setHoveredNode(d.data);
        setMousePos({ x: event.clientX, y: event.clientY });
      })
      .on('mousemove', function (event) {
        setMousePos({ x: event.clientX, y: event.clientY });
      })
      .on('mouseleave', function (event, d) {
        const width = d.x1 - d.x0;
        const height = d.y1 - d.y0;
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', 0.85)
          .attr('stroke-width', width < 10 || height < 10 ? 0.5 : 1)
          .attr('stroke', width < 20 || height < 20 ? 'rgba(255,255,255,0.5)' : '#fff');
        setHoveredNode(null);
      })
      .on('click', function (event, d) {
        event.stopPropagation();
        if (onNodeClick && d.data.type === 'directory') {
          onNodeClick(d.data);
        }
      });

    // Add text labels only for cells large enough to display them
    // This is the key performance optimization - render all rectangles but limit text elements
    cell
      .filter((d) => {
        const width = d.x1 - d.x0;
        const height = d.y1 - d.y0;
        return width >= 60 && height >= 20;
      })
      .append('text')
      .attr('x', 4)
      .attr('y', 14)
      .text((d) => d.data.name)
      .attr('fill', 'white')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .style('pointer-events', 'none')
      .style('text-shadow', '0 1px 2px rgba(0,0,0,0.5)')
      .each(function (d) {
        const text = d3.select(this);
        const width = d.x1 - d.x0 - 8;
        let textContent = d.data.name;
        text.text(textContent);

        // Truncate text if it's too long
        while (this.getComputedTextLength() > width && textContent.length > 0) {
          textContent = textContent.slice(0, -1);
          text.text(textContent + '...');
        }
      });
  }, [data, dimensions, onNodeClick, maxDepth, minSizePercentage, maxNodes]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      />

      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 pointer-events-none"
            style={{
              left: mousePos.x + 16,
              top: mousePos.y + 16,
            }}
          >
            <div className="bg-gray-900/95 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-2xl border border-white/10 max-w-sm">
              <div className="font-semibold text-sm mb-1 truncate">{hoveredNode.name}</div>
              <div className="text-xs text-gray-300 space-y-1">
                <div>Size: {formatBytes(hoveredNode.size)}</div>
                {hoveredNode.children && <div>Items: {hoveredNode.children.length}</div>}
                {hoveredNode.extension && (
                  <div className="text-blue-400">.{hoveredNode.extension}</div>
                )}
                {(() => {
                  const hiddenInfo = hiddenItemsInfo.get(hoveredNode.path);
                  if (hiddenInfo) {
                    return (
                      <div className="text-yellow-400 mt-2 pt-2 border-t border-white/10">
                        +{hiddenInfo.count} hidden items ({formatBytes(hiddenInfo.totalSize)})
                      </div>
                    );
                  }
                  return null;
                })()}
                <div className="text-gray-400 text-xs truncate mt-1">{hoveredNode.path}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
