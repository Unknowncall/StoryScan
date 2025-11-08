import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TreeView from '@/components/TreeView';
import { FileNode } from '@/types';

describe('TreeView', () => {
  const mockData: FileNode = {
    name: 'root',
    path: '/root',
    size: 3000,
    type: 'directory',
    children: [
      {
        name: 'folder1',
        path: '/root/folder1',
        size: 1000,
        type: 'directory',
        children: [
          {
            name: 'subfolder',
            path: '/root/folder1/subfolder',
            size: 500,
            type: 'directory',
            children: [],
          },
          {
            name: 'file.txt',
            path: '/root/folder1/file.txt',
            size: 500,
            type: 'file',
            extension: 'txt',
          },
        ],
      },
      {
        name: 'folder2',
        path: '/root/folder2',
        size: 2000,
        type: 'directory',
        children: [],
      },
    ],
  };

  it('renders the tree view', () => {
    render(<TreeView data={mockData} />);
    expect(screen.getByText('root')).toBeDefined();
    expect(screen.getByText('2 items')).toBeDefined();
  });

  it('renders item count', () => {
    render(<TreeView data={mockData} />);
    expect(screen.getByText('2 items')).toBeDefined();
  });

  it('shows root node expanded by default', () => {
    render(<TreeView data={mockData} />);
    expect(screen.getByText('folder1')).toBeDefined();
    expect(screen.getByText('folder2')).toBeDefined();
  });

  it('expands and collapses folders', () => {
    render(<TreeView data={mockData} />);

    const folder1 = screen.getByText('folder1');
    expect(screen.queryByText('subfolder')).toBeNull();

    // Find and click the chevron button for folder1
    const folder1Row = folder1.closest('div');
    const chevronButton = folder1Row?.querySelector('button');
    fireEvent.click(chevronButton!);

    expect(screen.getByText('subfolder')).toBeDefined();
    expect(screen.getByText('file.txt')).toBeDefined();

    // Click again to collapse
    fireEvent.click(chevronButton!);
    expect(screen.queryByText('subfolder')).toBeNull();
  });

  it('calls onItemClick when directory is clicked', () => {
    const mockOnItemClick = jest.fn();
    render(<TreeView data={mockData} onItemClick={mockOnItemClick} />);

    const folder1 = screen.getByText('folder1');
    fireEvent.click(folder1);

    expect(mockOnItemClick).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'folder1',
        type: 'directory',
      })
    );
  });

  it('does not call onItemClick for files', () => {
    const mockOnItemClick = jest.fn();
    render(<TreeView data={mockData} onItemClick={mockOnItemClick} />);

    // First expand folder1 to show file.txt
    const folder1 = screen.getByText('folder1');
    const folder1Row = folder1.closest('div');
    const chevronButton = folder1Row?.querySelector('button');
    fireEvent.click(chevronButton!);

    const fileTxt = screen.getByText('file.txt');
    fireEvent.click(fileTxt);

    expect(mockOnItemClick).not.toHaveBeenCalled();
  });

  it('displays file and folder icons', () => {
    render(<TreeView data={mockData} />);

    // Expand folder to show file
    const folder1 = screen.getByText('folder1');
    const folder1Row = folder1.closest('div');
    const chevronButton = folder1Row?.querySelector('button');
    fireEvent.click(chevronButton!);

    // Check for folder icons (lucide-react Folder component)
    const folderIcons = document.querySelectorAll('svg.lucide-folder');
    expect(folderIcons.length).toBeGreaterThan(0);

    // Check for file icons
    const fileIcons = document.querySelectorAll('svg.lucide-file');
    expect(fileIcons.length).toBeGreaterThan(0);
  });

  it('displays file sizes', () => {
    render(<TreeView data={mockData} />);
    expect(document.body.textContent).toContain('KB');
    expect(document.body.textContent).toContain('Bytes');
  });

  it('displays child count for directories', () => {
    render(<TreeView data={mockData} />);
    const treeText = document.body.textContent || '';
    expect(treeText).toMatch(/\(\d+\)/); // has child count in parentheses
  });

  it('does not have expand/collapse all button', () => {
    render(<TreeView data={mockData} />);
    expect(screen.queryByText('Expand All')).toBeNull();
    expect(screen.queryByText('Collapse All')).toBeNull();
  });

  it('handles empty tree', () => {
    const emptyData: FileNode = {
      name: 'empty',
      path: '/empty',
      size: 0,
      type: 'directory',
      children: [],
    };

    render(<TreeView data={emptyData} />);
    expect(screen.getByText('empty')).toBeDefined();
    expect(screen.getByText('0 items')).toBeDefined();
  });
});
