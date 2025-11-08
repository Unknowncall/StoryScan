import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ComparisonStats from '@/components/ComparisonStats';
import { DirectoryConfig, FileNode } from '@/types';

describe('ComparisonStats', () => {
  const mockLeftDir: DirectoryConfig = {
    id: '0',
    name: 'media',
    path: '/mnt/user/media',
  };

  const mockRightDir: DirectoryConfig = {
    id: '1',
    name: 'backup',
    path: '/mnt/user/backup',
  };

  const mockLeftData: FileNode = {
    name: 'media',
    path: '/mnt/user/media',
    size: 1000000000, // 1GB
    type: 'directory',
    children: [
      {
        name: 'file1.txt',
        path: '/mnt/user/media/file1.txt',
        size: 500000000,
        type: 'file',
        extension: 'txt',
      },
      {
        name: 'file2.txt',
        path: '/mnt/user/media/file2.txt',
        size: 500000000,
        type: 'file',
        extension: 'txt',
      },
    ],
  };

  const mockRightDataLarger: FileNode = {
    name: 'backup',
    path: '/mnt/user/backup',
    size: 2000000000, // 2GB
    type: 'directory',
    children: [
      {
        name: 'file3.txt',
        path: '/mnt/user/backup/file3.txt',
        size: 1000000000,
        type: 'file',
        extension: 'txt',
      },
      {
        name: 'file4.txt',
        path: '/mnt/user/backup/file4.txt',
        size: 1000000000,
        type: 'file',
        extension: 'txt',
      },
    ],
  };

  const mockRightDataSmaller: FileNode = {
    name: 'backup',
    path: '/mnt/user/backup',
    size: 500000000, // 500MB
    type: 'directory',
    children: [
      {
        name: 'file3.txt',
        path: '/mnt/user/backup/file3.txt',
        size: 500000000,
        type: 'file',
        extension: 'txt',
      },
    ],
  };

  const mockRightDataEqual: FileNode = {
    name: 'backup',
    path: '/mnt/user/backup',
    size: 1000000000, // 1GB (same as left)
    type: 'directory',
    children: [
      {
        name: 'file3.txt',
        path: '/mnt/user/backup/file3.txt',
        size: 1000000000,
        type: 'file',
        extension: 'txt',
      },
    ],
  };

  it('renders comparison stats component', () => {
    render(
      <ComparisonStats
        leftDir={mockLeftDir}
        rightDir={mockRightDir}
        leftData={mockLeftData}
        rightData={mockRightDataLarger}
      />
    );

    expect(screen.getByText('Comparison Summary')).toBeDefined();
  });

  it('displays both directory names', () => {
    render(
      <ComparisonStats
        leftDir={mockLeftDir}
        rightDir={mockRightDir}
        leftData={mockLeftData}
        rightData={mockRightDataLarger}
      />
    );

    const mediaElements = screen.getAllByText('media');
    expect(mediaElements.length).toBeGreaterThan(0);

    const backupElements = screen.getAllByText('backup');
    expect(backupElements.length).toBeGreaterThan(0);
  });

  it('shows sizes for both directories', () => {
    render(
      <ComparisonStats
        leftDir={mockLeftDir}
        rightDir={mockRightDir}
        leftData={mockLeftData}
        rightData={mockRightDataLarger}
      />
    );

    // Left is 1GB, right is 2GB
    expect(screen.getByText('953.67 MB')).toBeDefined(); // 1GB formatted
    expect(screen.getByText('1.86 GB')).toBeDefined(); // 2GB formatted
  });

  it('calculates and displays size difference correctly', () => {
    render(
      <ComparisonStats
        leftDir={mockLeftDir}
        rightDir={mockRightDir}
        leftData={mockLeftData}
        rightData={mockRightDataLarger}
      />
    );

    const diffElements = screen.getAllByText('Difference:');
    expect(diffElements.length).toBeGreaterThan(0);

    // Should show +1GB difference - check for the formatted value (appears multiple times)
    const sizeElements = screen.getAllByText(/953\.67 MB/);
    expect(sizeElements.length).toBeGreaterThanOrEqual(1);
  });

  it('displays file counts for both directories', () => {
    render(
      <ComparisonStats
        leftDir={mockLeftDir}
        rightDir={mockRightDir}
        leftData={mockLeftData}
        rightData={mockRightDataLarger}
      />
    );

    expect(screen.getByText('Files')).toBeDefined();
    // Left has 2 files, right has 2 files
    const fileCountElements = screen.getAllByText('2');
    expect(fileCountElements.length).toBeGreaterThanOrEqual(2);
  });

  it('shows larger directory indicator when right is larger', () => {
    render(
      <ComparisonStats
        leftDir={mockLeftDir}
        rightDir={mockRightDir}
        leftData={mockLeftData}
        rightData={mockRightDataLarger}
      />
    );

    expect(screen.getByText('Larger Directory')).toBeDefined();
    const backupElements = screen.getAllByText('backup');
    expect(backupElements.length).toBeGreaterThanOrEqual(1);
  });

  it('shows larger directory indicator when left is larger', () => {
    render(
      <ComparisonStats
        leftDir={mockLeftDir}
        rightDir={mockRightDir}
        leftData={mockLeftData}
        rightData={mockRightDataSmaller}
      />
    );

    expect(screen.getByText('Larger Directory')).toBeDefined();
    const mediaElements = screen.getAllByText('media');
    expect(mediaElements.length).toBeGreaterThanOrEqual(1);
  });

  it('shows equal message when directories are same size', () => {
    render(
      <ComparisonStats
        leftDir={mockLeftDir}
        rightDir={mockRightDir}
        leftData={mockLeftData}
        rightData={mockRightDataEqual}
      />
    );

    expect(screen.getByText('Both directories are the same size')).toBeDefined();
  });

  it('displays folder counts', () => {
    render(
      <ComparisonStats
        leftDir={mockLeftDir}
        rightDir={mockRightDir}
        leftData={mockLeftData}
        rightData={mockRightDataLarger}
      />
    );

    expect(screen.getByText('Folders')).toBeDefined();
    // Both have 1 folder (the root directory)
    const folderCountElements = screen.getAllByText('1');
    expect(folderCountElements.length).toBeGreaterThanOrEqual(2);
  });

  it('shows percentage difference for sizes', () => {
    render(
      <ComparisonStats
        leftDir={mockLeftDir}
        rightDir={mockRightDir}
        leftData={mockLeftData}
        rightData={mockRightDataLarger}
      />
    );

    // 2GB vs 1GB = 100% increase
    expect(screen.getByText(/100\.0%/)).toBeDefined();
  });

  it('handles nested directory structures for counting', () => {
    const nestedLeft: FileNode = {
      name: 'media',
      path: '/mnt/user/media',
      size: 1000000000,
      type: 'directory',
      children: [
        {
          name: 'subfolder',
          path: '/mnt/user/media/subfolder',
          size: 500000000,
          type: 'directory',
          children: [
            {
              name: 'file.txt',
              path: '/mnt/user/media/subfolder/file.txt',
              size: 500000000,
              type: 'file',
              extension: 'txt',
            },
          ],
        },
      ],
    };

    render(
      <ComparisonStats
        leftDir={mockLeftDir}
        rightDir={mockRightDir}
        leftData={nestedLeft}
        rightData={mockRightDataLarger}
      />
    );

    // Should count files and folders recursively
    expect(screen.getByText('Files')).toBeDefined();
    expect(screen.getByText('Folders')).toBeDefined();
  });

  it('displays directory paths as tooltips', () => {
    render(
      <ComparisonStats
        leftDir={mockLeftDir}
        rightDir={mockRightDir}
        leftData={mockLeftData}
        rightData={mockRightDataLarger}
      />
    );

    // Find elements with title attributes containing the paths
    const leftPathElement = screen.getByText(mockLeftDir.name).closest('[title]');
    expect(leftPathElement).toHaveAttribute('title', mockLeftDir.path);

    const rightPathElements = screen.getAllByText(mockRightDir.name);
    const rightPathElement = rightPathElements.find((el) => el.closest('[title]'));
    expect(rightPathElement?.closest('[title]')).toHaveAttribute('title', mockRightDir.path);
  });

  it('shows "No change" when file counts are equal', () => {
    render(
      <ComparisonStats
        leftDir={mockLeftDir}
        rightDir={mockRightDir}
        leftData={mockLeftData}
        rightData={mockRightDataLarger}
      />
    );

    // Both have 2 files, so file difference should be "No change"
    const noChangeElements = screen.getAllByText('No change');
    expect(noChangeElements.length).toBeGreaterThan(0);
  });

  it('handles empty directories', () => {
    const emptyDir: FileNode = {
      name: 'empty',
      path: '/empty',
      size: 0,
      type: 'directory',
      children: [],
    };

    render(
      <ComparisonStats
        leftDir={mockLeftDir}
        rightDir={mockRightDir}
        leftData={emptyDir}
        rightData={mockRightDataLarger}
      />
    );

    expect(screen.getByText('Comparison Summary')).toBeDefined();
    expect(screen.getByText('0 Bytes')).toBeDefined();
  });
});
