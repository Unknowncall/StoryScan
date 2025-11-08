import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TopItemsPanel from '@/components/TopItemsPanel';
import { FileNode } from '@/types';

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
      children: [],
    };

    render(<TopItemsPanel data={emptyData} />);

    const foldersButton = screen.getByText('Folders');
    fireEvent.click(foldersButton);

    expect(screen.getByText('No items found')).toBeDefined();
  });
});
