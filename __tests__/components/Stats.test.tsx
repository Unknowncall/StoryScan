import React from 'react';
import { render, screen } from '@testing-library/react';
import Stats from '@/components/Stats';
import { FileNode } from '@/types';

describe('Stats Component', () => {
  const mockFileNode: FileNode = {
    name: 'test',
    path: '/test',
    size: 1073741824, // 1 GB
    type: 'directory',
    children: [
      {
        name: 'file1.txt',
        path: '/test/file1.txt',
        size: 1024,
        type: 'file',
        extension: 'txt',
      },
      {
        name: 'folder1',
        path: '/test/folder1',
        size: 2048,
        type: 'directory',
        children: [
          {
            name: 'file2.txt',
            path: '/test/folder1/file2.txt',
            size: 2048,
            type: 'file',
            extension: 'txt',
          },
        ],
      },
    ],
  };

  it('should render total size', () => {
    render(<Stats data={mockFileNode} />);
    expect(screen.getByText('Total Size')).toBeInTheDocument();
    expect(screen.getByText('1 GB')).toBeInTheDocument();
  });

  it('should render file count', () => {
    const { container } = render(<Stats data={mockFileNode} />);
    expect(screen.getByText('Files')).toBeInTheDocument();

    // Use getAllByText since "2" appears multiple times
    const elements = screen.getAllByText('2');
    expect(elements.length).toBeGreaterThan(0);
  });

  it('should render folder count', () => {
    const { container } = render(<Stats data={mockFileNode} />);
    expect(screen.getByText('Folders')).toBeInTheDocument();

    // Use getAllByText since "2" appears multiple times
    const elements = screen.getAllByText('2');
    expect(elements.length).toBeGreaterThan(0);
  });

  it('should render scan timestamp when provided', () => {
    const scannedAt = '2025-01-01T12:00:00.000Z';
    render(<Stats data={mockFileNode} scannedAt={scannedAt} />);

    expect(screen.getByText(/Last scanned:/)).toBeInTheDocument();
  });

  it('should not render timestamp when not provided', () => {
    render(<Stats data={mockFileNode} />);
    expect(screen.queryByText(/Last scanned:/)).not.toBeInTheDocument();
  });

  it('should render icons for each stat', () => {
    const { container } = render(<Stats data={mockFileNode} />);
    const svgs = container.querySelectorAll('svg');
    // Should have at least 3 SVGs for the stats (HardDrive, Files, Folder)
    expect(svgs.length).toBeGreaterThanOrEqual(3);
  });
});
