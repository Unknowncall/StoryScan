'use client';

import React, { useRef, useEffect, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { TrackedPathHistory } from '@/types';
import { formatBytes } from '@/lib/utils';
import { getColorForPath } from '@/lib/utils';

interface HistoryGraphProps {
  data: TrackedPathHistory[];
}

export default function HistoryGraph({ data }: HistoryGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  // Observe container size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) {
          setDimensions({ width, height: 400 });
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Compute all data points and scales
  const chartData = useMemo(() => {
    if (data.length === 0) return null;

    const allPoints = data.flatMap((d) => d.dataPoints);
    if (allPoints.length === 0) return null;

    const dateExtent = d3.extent(allPoints, (d) => d.date) as [Date, Date];
    const sizeMax = d3.max(allPoints, (d) => d.sizeBytes) || 0;

    return { dateExtent, sizeMax };
  }, [data]);

  // D3 rendering
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    if (!chartData || data.length === 0) return;

    const margin = { top: 20, right: 30, bottom: 40, left: 70 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    if (width <= 0 || height <= 0) return;

    const g = svg
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleTime().domain(chartData.dateExtent).range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, chartData.sizeMax * 1.1])
      .range([height, 0]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(y)
          .tickSize(-width)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.1);

    g.selectAll('.grid .domain').remove();

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(6))
      .attr('color', 'currentColor')
      .selectAll('text')
      .attr('fill', 'currentColor');

    // Y axis with formatted bytes
    g.append('g')
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat((d) => formatBytes(d as number, 1))
      )
      .attr('color', 'currentColor')
      .selectAll('text')
      .attr('fill', 'currentColor');

    // Line generator
    const line = d3
      .line<{ date: Date; sizeBytes: number }>()
      .x((d) => x(d.date))
      .y((d) => y(d.sizeBytes))
      .curve(d3.curveMonotoneX);

    // Draw lines for each tracked path
    data.forEach((series, index) => {
      const color = getColorForPath(series.trackedPath.path, index);

      // Line
      const path = g
        .append('path')
        .datum(series.dataPoints)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2.5)
        .attr('d', line);

      // Animate line drawing
      const totalLength = (path.node() as SVGPathElement)?.getTotalLength() || 0;
      if (totalLength > 0) {
        path
          .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
          .attr('stroke-dashoffset', totalLength)
          .transition()
          .duration(800)
          .attr('stroke-dashoffset', 0);
      }

      // Data points
      g.selectAll(`.dot-${index}`)
        .data(series.dataPoints)
        .enter()
        .append('circle')
        .attr('cx', (d) => x(d.date))
        .attr('cy', (d) => y(d.sizeBytes))
        .attr('r', 4)
        .attr('fill', color)
        .attr('stroke', 'var(--background, white)')
        .attr('stroke-width', 2)
        .style('opacity', 0)
        .transition()
        .delay(800)
        .duration(300)
        .style('opacity', 1);
    });

    // Tooltip overlay
    const tooltip = g.append('g').attr('class', 'tooltip-group').style('display', 'none');

    tooltip
      .append('line')
      .attr('class', 'crosshair')
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.3)
      .attr('stroke-dasharray', '4,4');

    const tooltipBg = tooltip
      .append('rect')
      .attr('fill', 'var(--card, white)')
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.2)
      .attr('rx', 6)
      .attr('ry', 6);

    const tooltipText = tooltip.append('text').attr('fill', 'currentColor').attr('font-size', 12);

    // Mouse interaction
    g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .on('mouseover', () => tooltip.style('display', null))
      .on('mouseout', () => tooltip.style('display', 'none'))
      .on('mousemove', function (event) {
        const [mx] = d3.pointer(event);
        const dateAtMouse = x.invert(mx);

        tooltip.select('.crosshair').attr('x1', mx).attr('x2', mx);

        // Build tooltip content
        const lines: string[] = [d3.timeFormat('%b %d, %Y %H:%M')(dateAtMouse)];

        data.forEach((series, index) => {
          // Find nearest data point
          const bisect = d3.bisector((d: { date: Date }) => d.date).left;
          const i = bisect(series.dataPoints, dateAtMouse, 1);
          const d0 = series.dataPoints[i - 1];
          const d1 = series.dataPoints[i];
          if (!d0 && !d1) return;

          const nearest =
            d1 &&
            dateAtMouse.getTime() - (d0?.date.getTime() || 0) >
              d1.date.getTime() - dateAtMouse.getTime()
              ? d1
              : d0 || d1;

          if (nearest) {
            lines.push(`${series.trackedPath.label}: ${formatBytes(nearest.sizeBytes)}`);
          }
        });

        tooltipText.selectAll('tspan').remove();
        lines.forEach((line, i) => {
          tooltipText
            .append('tspan')
            .attr('x', 8)
            .attr('dy', i === 0 ? 16 : 16)
            .text(line)
            .attr('font-weight', i === 0 ? 'bold' : 'normal');
        });

        const bbox = (tooltipText.node() as SVGTextElement)?.getBBox();
        const tooltipWidth = (bbox?.width || 100) + 16;
        const tooltipHeight = (bbox?.height || 40) + 12;

        // Position tooltip (flip if near edge)
        const tooltipX = mx + 15 + tooltipWidth > width ? mx - tooltipWidth - 15 : mx + 15;

        tooltipBg
          .attr('x', tooltipX)
          .attr('y', 4)
          .attr('width', tooltipWidth)
          .attr('height', tooltipHeight);

        tooltipText.attr('transform', `translate(${tooltipX}, 0)`);
      });

    // Legend
    const legend = g.append('g').attr('transform', `translate(${width - 10}, 10)`);

    data.forEach((series, index) => {
      const color = getColorForPath(series.trackedPath.path, index);
      const row = legend.append('g').attr('transform', `translate(0, ${index * 20})`);

      row
        .append('rect')
        .attr('x', -120)
        .attr('width', 12)
        .attr('height', 12)
        .attr('rx', 2)
        .attr('fill', color);

      row
        .append('text')
        .attr('x', -104)
        .attr('y', 10)
        .attr('fill', 'currentColor')
        .attr('font-size', 11)
        .text(series.trackedPath.label);
    });
  }, [data, chartData, dimensions]);

  if (data.length === 0 || !data.some((d) => d.dataPoints.length > 0)) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium">No history data yet</p>
          <p className="text-sm mt-1">
            Track some paths and run a scan to start recording history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" style={{ height: 400 }} />
    </div>
  );
}
