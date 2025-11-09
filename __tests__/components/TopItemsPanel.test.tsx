import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TopItemsPanel from '@/components/TopItemsPanel';
import { FileNode } from '@/types';
import * as utils from '@/lib/utils';
import { toast } from 'sonner';

// Mock the utils module
jest.mock('@/lib/utils', () => ({
  ...jest.requireActual('@/lib/utils'),
  copyToClipboard: jest.fn(),
}));

describe('TopItemsPanel', () => {
  const mockData: FileNode = {
    name: 'root',
    path: '/root',
    size: 1000000,
    type: 'directory',
    children: [
      {
        name: 'large-file.mp4',
        path: '/root/large-file.mp4',
        size: 500000,
        type: 'file',
        extension: 'mp4',
      },
      {
        name: 'medium-file.pdf',
        path: '/root/medium-file.pdf',
        size: 300000,
        type: 'file',
        extension: 'pdf',
      },
      {
        name: 'subfolder',
        path: '/root/subfolder',
        size: 200000,
        type: 'directory',
        children: [],
      },
    ],
  };

  it('renders the top items panel', () => {
    render(<TopItemsPanel data={mockData} />);
    expect(screen.getByText('Top 10 Largest Items')).toBeDefined();
  });

  it('displays all view mode buttons', () => {
    render(<TopItemsPanel data={mockData} />);
    expect(screen.getByText('All')).toBeDefined();
    expect(screen.getByText('Files')).toBeDefined();
    expect(screen.getByText('Folders')).toBeDefined();
  });

  it('shows top items with correct information', () => {
    render(<TopItemsPanel data={mockData} />);
    expect(screen.getByText('large-file.mp4')).toBeDefined();
    expect(screen.getByText('medium-file.pdf')).toBeDefined();
    expect(screen.getByText('subfolder')).toBeDefined();
  });

  it('filters to show only files when Files button is clicked', () => {
    render(<TopItemsPanel data={mockData} />);

    const filesButton = screen.getByText('Files');
    fireEvent.click(filesButton);

    expect(screen.getByText('large-file.mp4')).toBeDefined();
    expect(screen.getByText('medium-file.pdf')).toBeDefined();
    expect(screen.queryByText('subfolder')).toBeNull();
  });

  it('filters to show only folders when Folders button is clicked', () => {
    render(<TopItemsPanel data={mockData} />);

    const foldersButton = screen.getByText('Folders');
    fireEvent.click(foldersButton);

    expect(screen.getByText('subfolder')).toBeDefined();
    expect(screen.queryByText('large-file.mp4')).toBeNull();
    expect(screen.queryByText('medium-file.pdf')).toBeNull();
  });

  it('calls onItemClick when an item is clicked', () => {
    const mockOnItemClick = jest.fn();
    render(<TopItemsPanel data={mockData} onItemClick={mockOnItemClick} />);

    const item = screen.getByText('large-file.mp4').closest('button');
    if (item) {
      fireEvent.click(item);
      expect(mockOnItemClick).toHaveBeenCalledTimes(1);
    }
  });

  it('displays correct size formatting', () => {
    render(<TopItemsPanel data={mockData} />);
    // Should display formatted bytes (e.g., "488.28 KB" for 500000 bytes)
    const sizeElements = screen.getAllByText(/KB|MB|GB/);
    expect(sizeElements.length).toBeGreaterThan(0);
  });

  it('shows percentage of total size', () => {
    render(<TopItemsPanel data={mockData} />);
    // Should show percentage like "50.0%"
    const percentages = screen.getAllByText(/\d+\.\d+%/);
    expect(percentages.length).toBeGreaterThan(0);
  });

  it('displays total size of top 10 items', () => {
    render(<TopItemsPanel data={mockData} />);
    expect(screen.getByText('Total (Top 10)')).toBeDefined();
  });

  it('shows "No items found" when no items match filter', () => {
    const emptyData: FileNode = {
      name: 'empty',
      path: '/empty',
      size: 0,
      type: 'directory',
      modifiedTime: Date.now(),
      children: [],
    };

    render(<TopItemsPanel data={emptyData} />);

    const foldersButton = screen.getByText('Folders');
    fireEvent.click(foldersButton);

    expect(screen.getByText('No items found')).toBeDefined();
  });

  describe('Copy Path Functionality', () => {
    const mockCopyToClipboard = utils.copyToClipboard as jest.MockedFunction<
      typeof utils.copyToClipboard
    >;

    beforeEach(() => {
      mockCopyToClipboard.mockClear();
      (toast.success as jest.Mock).mockClear();
    });

    it('should copy path when copy button is clicked', async () => {
      mockCopyToClipboard.mockResolvedValue(true);

      const { container } = render(<TopItemsPanel data={mockData} />);

      // Find the item and hover to reveal copy button
      const item = screen.getByText('large-file.mp4').closest('div[class*="group"]');
      expect(item).toBeTruthy();

      // Find copy button within the item
      const copyButton = item?.querySelector('button[title="Copy path"]');
      expect(copyButton).toBeTruthy();

      if (copyButton) {
        fireEvent.click(copyButton);

        await waitFor(() => {
          expect(mockCopyToClipboard).toHaveBeenCalledWith('/root/large-file.mp4');
        });
      }
    });

    it('should show success toast when copy succeeds', async () => {
      mockCopyToClipboard.mockResolvedValue(true);

      const { container } = render(<TopItemsPanel data={mockData} />);

      const item = screen.getByText('large-file.mp4').closest('div[class*="group"]');
      const copyButton = item?.querySelector('button[title="Copy path"]');

      if (copyButton) {
        fireEvent.click(copyButton);

        await waitFor(() => {
          expect(toast.success).toHaveBeenCalledWith('Path copied!', {
            description: '/root/large-file.mp4',
          });
        });
      }
    });

    it('should not show toast when copy fails', async () => {
      mockCopyToClipboard.mockResolvedValue(false);

      const { container } = render(<TopItemsPanel data={mockData} />);

      const item = screen.getByText('large-file.mp4').closest('div[class*="group"]');
      const copyButton = item?.querySelector('button[title="Copy path"]');

      if (copyButton) {
        fireEvent.click(copyButton);

        await waitFor(() => {
          expect(mockCopyToClipboard).toHaveBeenCalled();
        });

        // Should not show success toast when copy fails
        expect(toast.success).not.toHaveBeenCalled();
      }
    });

    it('should stop event propagation when copy button is clicked', async () => {
      mockCopyToClipboard.mockResolvedValue(true);
      const mockOnItemClick = jest.fn();

      const { container } = render(<TopItemsPanel data={mockData} onItemClick={mockOnItemClick} />);

      const item = screen.getByText('large-file.mp4').closest('div[class*="group"]');
      const copyButton = item?.querySelector('button[title="Copy path"]');

      if (copyButton) {
        fireEvent.click(copyButton);

        // onItemClick should NOT be called because event.stopPropagation() was called
        expect(mockOnItemClick).not.toHaveBeenCalled();
      }
    });
  });

  describe('Item Click Functionality', () => {
    it('should call onItemClick when item div is clicked', () => {
      const mockOnItemClick = jest.fn();
      render(<TopItemsPanel data={mockData} onItemClick={mockOnItemClick} />);

      const item = screen.getByText('large-file.mp4').closest('div[class*="group"]');
      if (item) {
        fireEvent.click(item);
        expect(mockOnItemClick).toHaveBeenCalledTimes(1);
        expect(mockOnItemClick).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'large-file.mp4',
            path: '/root/large-file.mp4',
          })
        );
      }
    });

    it('should not error when onItemClick is not provided', () => {
      render(<TopItemsPanel data={mockData} />);

      const item = screen.getByText('large-file.mp4').closest('div[class*="group"]');
      if (item) {
        expect(() => fireEvent.click(item)).not.toThrow();
      }
    });

    it('should call onItemClick for folders', () => {
      const mockOnItemClick = jest.fn();
      render(<TopItemsPanel data={mockData} onItemClick={mockOnItemClick} />);

      const item = screen.getByText('subfolder').closest('div[class*="group"]');
      if (item) {
        fireEvent.click(item);
        expect(mockOnItemClick).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'subfolder',
            type: 'directory',
          })
        );
      }
    });
  });

  describe('Display and Formatting', () => {
    it('should display item numbers (1-10)', () => {
      render(<TopItemsPanel data={mockData} />);
      expect(screen.getByText('1')).toBeDefined();
      expect(screen.getByText('2')).toBeDefined();
      expect(screen.getByText('3')).toBeDefined();
    });

    it('should show file extension when available', () => {
      render(<TopItemsPanel data={mockData} />);
      expect(screen.getByText('.mp4')).toBeDefined();
      expect(screen.getByText('.pdf')).toBeDefined();
    });

    it('should show folder icon for directories', () => {
      const { container } = render(<TopItemsPanel data={mockData} />);
      const folderIcons = container.querySelectorAll('svg.text-blue-500');
      expect(folderIcons.length).toBeGreaterThan(0);
    });

    it('should show file icon for files', () => {
      const { container } = render(<TopItemsPanel data={mockData} />);
      const fileIcons = container.querySelectorAll('svg.text-gray-500');
      expect(fileIcons.length).toBeGreaterThan(0);
    });

    it('should display item count for directories with children', () => {
      const dataWithChildren: FileNode = {
        name: 'root',
        path: '/root',
        size: 1000000,
        type: 'directory',
        modifiedTime: Date.now(),
        children: [
          {
            name: 'folder-with-items',
            path: '/root/folder-with-items',
            size: 500000,
            type: 'directory',
            modifiedTime: Date.now(),
            children: [
              {
                name: 'file1.txt',
                path: '/root/folder-with-items/file1.txt',
                size: 100,
                type: 'file',
                modifiedTime: Date.now(),
              },
              {
                name: 'file2.txt',
                path: '/root/folder-with-items/file2.txt',
                size: 100,
                type: 'file',
                modifiedTime: Date.now(),
              },
              {
                name: 'file3.txt',
                path: '/root/folder-with-items/file3.txt',
                size: 100,
                type: 'file',
                modifiedTime: Date.now(),
              },
            ],
          },
        ],
      };

      render(<TopItemsPanel data={dataWithChildren} />);
      expect(screen.getByText('3 items')).toBeDefined();
    });

    it('should display progress bar with correct width', () => {
      const { container } = render(<TopItemsPanel data={mockData} />);
      const progressBars = container.querySelectorAll('div[class*="bg-gradient-to-r"]');
      expect(progressBars.length).toBeGreaterThan(0);
    });

    it('should show path on hover (group-hover)', () => {
      render(<TopItemsPanel data={mockData} />);
      const pathElement = screen.getByText('/root/large-file.mp4');
      expect(pathElement).toHaveClass('opacity-0', 'group-hover:opacity-100');
    });
  });

  describe('Nested Directory Handling', () => {
    it('should collect items from nested directories', () => {
      const nestedData: FileNode = {
        name: 'root',
        path: '/root',
        size: 1000000,
        type: 'directory',
        modifiedTime: Date.now(),
        children: [
          {
            name: 'level1',
            path: '/root/level1',
            size: 500000,
            type: 'directory',
            modifiedTime: Date.now(),
            children: [
              {
                name: 'level2',
                path: '/root/level1/level2',
                size: 300000,
                type: 'directory',
                modifiedTime: Date.now(),
                children: [
                  {
                    name: 'deep-file.txt',
                    path: '/root/level1/level2/deep-file.txt',
                    size: 300000,
                    type: 'file',
                    modifiedTime: Date.now(),
                  },
                ],
              },
            ],
          },
        ],
      };

      render(<TopItemsPanel data={nestedData} />);
      expect(screen.getByText('deep-file.txt')).toBeDefined();
      expect(screen.getByText('level2')).toBeDefined();
      expect(screen.getByText('level1')).toBeDefined();
    });

    it('should limit to top 10 items even with many nested files', () => {
      const manyFilesData: FileNode = {
        name: 'root',
        path: '/root',
        size: 10000,
        type: 'directory',
        modifiedTime: Date.now(),
        children: Array.from({ length: 50 }, (_, i) => ({
          name: `file${i}.txt`,
          path: `/root/file${i}.txt`,
          size: 1000 - i * 10,
          type: 'file' as const,
          modifiedTime: Date.now(),
        })),
      };

      const { container } = render(<TopItemsPanel data={manyFilesData} />);
      const items = container.querySelectorAll('div[class*="group relative"]');
      expect(items.length).toBe(10);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero-sized items', () => {
      const zeroSizeData: FileNode = {
        name: 'root',
        path: '/root',
        size: 100,
        type: 'directory',
        modifiedTime: Date.now(),
        children: [
          {
            name: 'empty.txt',
            path: '/root/empty.txt',
            size: 0,
            type: 'file',
            modifiedTime: Date.now(),
          },
          {
            name: 'normal.txt',
            path: '/root/normal.txt',
            size: 100,
            type: 'file',
            modifiedTime: Date.now(),
          },
        ],
      };

      render(<TopItemsPanel data={zeroSizeData} />);
      expect(screen.getByText('empty.txt')).toBeDefined();
      expect(screen.getByText('0.0%')).toBeDefined();
    });

    it('should handle data with no children', () => {
      const noChildrenData: FileNode = {
        name: 'root',
        path: '/root',
        size: 0,
        type: 'directory',
        modifiedTime: Date.now(),
        children: [],
      };

      render(<TopItemsPanel data={noChildrenData} />);
      expect(screen.getByText('No items found')).toBeDefined();
    });

    it('should switch back to All view mode', () => {
      render(<TopItemsPanel data={mockData} />);

      // Switch to Files
      fireEvent.click(screen.getByText('Files'));
      expect(screen.queryByText('subfolder')).toBeNull();

      // Switch back to All
      fireEvent.click(screen.getByText('All'));
      expect(screen.getByText('subfolder')).toBeDefined();
    });

    it('should calculate percentage correctly even with very small items', () => {
      const smallItemData: FileNode = {
        name: 'root',
        path: '/root',
        size: 1000000,
        type: 'directory',
        modifiedTime: Date.now(),
        children: [
          {
            name: 'tiny.txt',
            path: '/root/tiny.txt',
            size: 1,
            type: 'file',
            modifiedTime: Date.now(),
          },
        ],
      };

      render(<TopItemsPanel data={smallItemData} />);
      // Should show 0.0% for very small percentage
      expect(screen.getByText(/0\.0%/)).toBeDefined();
    });
  });
});
