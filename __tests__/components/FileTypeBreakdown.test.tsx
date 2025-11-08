import React from 'react';
import { render, screen } from '@testing-library/react';
import FileTypeBreakdown from '@/components/FileTypeBreakdown';
import { FileNode } from '@/types';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('FileTypeBreakdown', () => {
  const mockData: FileNode = {
    name: 'root',
    path: '/root',
    size: 2000000,
    type: 'directory',
    children: [
      {
        name: 'video.mp4',
        path: '/root/video.mp4',
        size: 1000000,
        type: 'file',
        extension: 'mp4',
      },
      {
        name: 'image.jpg',
        path: '/root/image.jpg',
        size: 500000,
        type: 'file',
        extension: 'jpg',
      },
      {
        name: 'document.pdf',
        path: '/root/document.pdf',
        size: 300000,
        type: 'file',
        extension: 'pdf',
      },
      {
        name: 'audio.mp3',
        path: '/root/audio.mp3',
        size: 200000,
        type: 'file',
        extension: 'mp3',
      },
    ],
  };

  it('renders the file type breakdown title', () => {
    render(<FileTypeBreakdown data={mockData} />);
    expect(screen.getByText('File Type Breakdown')).toBeDefined();
  });

  it('displays category names and sizes', () => {
    render(<FileTypeBreakdown data={mockData} />);

    // Should show categories like Videos, Images, Documents, Audio
    expect(screen.getByText('Videos')).toBeDefined();
    expect(screen.getByText('Images')).toBeDefined();
    expect(screen.getByText('Documents')).toBeDefined();
    expect(screen.getByText('Audio')).toBeDefined();
  });

  it('displays file counts for each category', () => {
    render(<FileTypeBreakdown data={mockData} />);

    // Should show "1 files" for each category
    const fileCountElements = screen.getAllByText(/\d+ files?/);
    expect(fileCountElements.length).toBeGreaterThan(0);
  });

  it('displays formatted sizes', () => {
    render(<FileTypeBreakdown data={mockData} />);

    // Should display sizes in KB, MB, or GB format
    const sizeElements = screen.getAllByText(/\d+(\.\d+)?\s*(KB|MB|GB)/);
    expect(sizeElements.length).toBeGreaterThan(0);
  });

  it('displays percentages', () => {
    render(<FileTypeBreakdown data={mockData} />);

    // Should show percentages like "50.0%"
    const percentageElements = screen.getAllByText(/\d+\.\d+%/);
    expect(percentageElements.length).toBeGreaterThan(0);
  });

  it('renders SVG chart', () => {
    const { container } = render(<FileTypeBreakdown data={mockData} />);

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('shows "No files to analyze" for empty data', () => {
    const emptyData: FileNode = {
      name: 'empty',
      path: '/empty',
      size: 0,
      type: 'directory',
      children: [],
    };

    render(<FileTypeBreakdown data={emptyData} />);
    expect(screen.getByText('No files to analyze')).toBeDefined();
  });

  it('shows "No files to analyze" for directory with only subdirectories', () => {
    const dirOnlyData: FileNode = {
      name: 'folders',
      path: '/folders',
      size: 0,
      type: 'directory',
      children: [
        {
          name: 'subfolder',
          path: '/folders/subfolder',
          size: 0,
          type: 'directory',
          children: [],
        },
      ],
    };

    render(<FileTypeBreakdown data={dirOnlyData} />);
    expect(screen.getByText('No files to analyze')).toBeDefined();
  });

  it('categorizes files correctly', () => {
    const mixedData: FileNode = {
      name: 'mixed',
      path: '/mixed',
      size: 1000,
      type: 'directory',
      children: [
        {
          name: 'code.js',
          path: '/mixed/code.js',
          size: 100,
          type: 'file',
          extension: 'js',
        },
        {
          name: 'archive.zip',
          path: '/mixed/archive.zip',
          size: 200,
          type: 'file',
          extension: 'zip',
        },
        {
          name: 'unknown.xyz',
          path: '/mixed/unknown.xyz',
          size: 50,
          type: 'file',
          extension: 'xyz',
        },
      ],
    };

    render(<FileTypeBreakdown data={mixedData} />);

    expect(screen.getByText('Code')).toBeDefined();
    expect(screen.getByText('Archives')).toBeDefined();
    expect(screen.getByText('Other')).toBeDefined();
  });

  it('handles nested directory structure', () => {
    const nestedData: FileNode = {
      name: 'root',
      path: '/root',
      size: 1000,
      type: 'directory',
      children: [
        {
          name: 'subfolder',
          path: '/root/subfolder',
          size: 1000,
          type: 'directory',
          children: [
            {
              name: 'nested.mp4',
              path: '/root/subfolder/nested.mp4',
              size: 1000,
              type: 'file',
              extension: 'mp4',
            },
          ],
        },
      ],
    };

    render(<FileTypeBreakdown data={nestedData} />);
    expect(screen.getByText('Videos')).toBeDefined();
  });
});
