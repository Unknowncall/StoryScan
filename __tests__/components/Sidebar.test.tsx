import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '@/components/Sidebar';
import { FileNode } from '@/types';

// Mock contexts
const mockUseScan = jest.fn();
const mockUseAppState = jest.fn();

jest.mock('@/contexts/ScanContext', () => ({
  ...jest.requireActual('@/contexts/ScanContext'),
  useScan: () => mockUseScan(),
}));

jest.mock('@/contexts/AppStateContext', () => ({
  ...jest.requireActual('@/contexts/AppStateContext'),
  useAppState: () => mockUseAppState(),
}));

// Mock TopItemsPanel component
jest.mock('@/components/TopItemsPanel', () => {
  return function MockTopItemsPanel({ onItemClick }: { onItemClick: (node: FileNode) => void }) {
    return (
      <div>
        <button
          onClick={() =>
            onItemClick({ name: 'test', path: '/test', size: 100, type: 'directory', children: [] })
          }
        >
          Mock Item
        </button>
      </div>
    );
  };
});

describe('Sidebar', () => {
  const mockNode: FileNode = {
    name: 'root',
    path: '/path/to/root',
    size: 1000,
    type: 'directory',
    children: [
      {
        name: 'folder1',
        path: '/path/to/root/folder1',
        size: 500,
        type: 'directory',
        children: [],
      },
      {
        name: 'file1.txt',
        path: '/path/to/root/file1.txt',
        size: 300,
        type: 'file',
        extension: '.txt',
      },
    ],
  };

  const mockHandleNodeClick = jest.fn();
  const mockSetIsSidebarOpen = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock ScanContext with default values
    mockUseScan.mockReturnValue({
      currentNode: mockNode,
      scanResult: { root: mockNode, scannedAt: '2024-01-01T00:00:00Z' },
      navigationPath: [],
      handleNodeClick: mockHandleNodeClick,
      handleBreadcrumbNavigate: jest.fn(),
      directories: [],
      selectedDirectory: null,
    });

    // Mock AppStateContext with default values (sidebar closed)
    mockUseAppState.mockReturnValue({
      isSidebarOpen: false,
      setIsSidebarOpen: mockSetIsSidebarOpen,
      viewMode: 'treemap',
      setViewMode: jest.fn(),
      isDarkMode: false,
      setIsDarkMode: jest.fn(),
    });
  });

  it('renders sidebar with title', () => {
    mockUseAppState.mockReturnValueOnce({
      isSidebarOpen: true,
      setIsSidebarOpen: mockSetIsSidebarOpen,
      viewMode: 'treemap',
      setViewMode: jest.fn(),
      isDarkMode: false,
      setIsDarkMode: jest.fn(),
    } as any);
    render(<Sidebar />);
    expect(screen.getByText('Top Items')).toBeInTheDocument();
  });

  it('renders close button', () => {
    mockUseAppState.mockReturnValueOnce({
      isSidebarOpen: true,
      setIsSidebarOpen: mockSetIsSidebarOpen,
      viewMode: 'treemap',
      setViewMode: jest.fn(),
      isDarkMode: false,
      setIsDarkMode: jest.fn(),
    } as any);
    render(<Sidebar />);
    const closeButton = screen.getByTitle('Close sidebar');
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    mockUseAppState.mockReturnValueOnce({
      isSidebarOpen: true,
      setIsSidebarOpen: mockSetIsSidebarOpen,
      viewMode: 'treemap',
      setViewMode: jest.fn(),
      isDarkMode: false,
      setIsDarkMode: jest.fn(),
    } as any);
    render(<Sidebar />);
    const closeButton = screen.getByTitle('Close sidebar');
    fireEvent.click(closeButton);
    expect(mockSetIsSidebarOpen).toHaveBeenCalledTimes(1);
    expect(mockSetIsSidebarOpen).toHaveBeenCalledWith(false);
  });

  it('renders TopItemsPanel', () => {
    mockUseAppState.mockReturnValueOnce({
      isSidebarOpen: true,
      setIsSidebarOpen: mockSetIsSidebarOpen,
      viewMode: 'treemap',
      setViewMode: jest.fn(),
      isDarkMode: false,
      setIsDarkMode: jest.fn(),
    } as any);
    render(<Sidebar />);
    expect(screen.getByText('Mock Item')).toBeInTheDocument();
  });

  it('calls onItemClick when directory item is clicked in TopItemsPanel', () => {
    mockUseAppState.mockReturnValueOnce({
      isSidebarOpen: true,
      setIsSidebarOpen: mockSetIsSidebarOpen,
      viewMode: 'treemap',
      setViewMode: jest.fn(),
      isDarkMode: false,
      setIsDarkMode: jest.fn(),
    } as any);
    render(<Sidebar />);
    const mockItem = screen.getByText('Mock Item');
    fireEvent.click(mockItem);
    expect(mockHandleNodeClick).toHaveBeenCalledTimes(1);
    expect(mockHandleNodeClick).toHaveBeenCalledWith({
      name: 'test',
      path: '/test',
      size: 100,
      type: 'directory',
      children: [],
    });
  });

  it('applies translate-x-0 class when sidebar is open', () => {
    mockUseAppState.mockReturnValueOnce({
      isSidebarOpen: true,
      setIsSidebarOpen: mockSetIsSidebarOpen,
      viewMode: 'treemap',
      setViewMode: jest.fn(),
      isDarkMode: false,
      setIsDarkMode: jest.fn(),
    } as any);
    const { container } = render(<Sidebar />);
    const sidebar = container.querySelector('aside');
    expect(sidebar).toHaveClass('translate-x-0');
  });

  it('applies translate-x-full class when sidebar is closed', () => {
    const { container } = render(<Sidebar />);
    const sidebar = container.querySelector('aside');
    expect(sidebar).toHaveClass('translate-x-full');
  });

  it('renders overlay when sidebar is open', () => {
    mockUseAppState.mockReturnValueOnce({
      isSidebarOpen: true,
      setIsSidebarOpen: mockSetIsSidebarOpen,
      viewMode: 'treemap',
      setViewMode: jest.fn(),
      isDarkMode: false,
      setIsDarkMode: jest.fn(),
    } as any);
    const { container } = render(<Sidebar />);
    const overlay = container.querySelector('.fixed.inset-0.bg-black\\/20');
    expect(overlay).toBeInTheDocument();
  });

  it('does not render overlay when sidebar is closed', () => {
    const { container } = render(<Sidebar />);
    const overlay = container.querySelector('.fixed.inset-0.bg-black\\/20');
    expect(overlay).not.toBeInTheDocument();
  });

  it('calls onClose when overlay is clicked', () => {
    mockUseAppState.mockReturnValueOnce({
      isSidebarOpen: true,
      setIsSidebarOpen: mockSetIsSidebarOpen,
      viewMode: 'treemap',
      setViewMode: jest.fn(),
      isDarkMode: false,
      setIsDarkMode: jest.fn(),
    } as any);
    const { container } = render(<Sidebar />);
    const overlay = container.querySelector('.fixed.inset-0.bg-black\\/20');
    fireEvent.click(overlay!);
    expect(mockSetIsSidebarOpen).toHaveBeenCalledTimes(1);
    expect(mockSetIsSidebarOpen).toHaveBeenCalledWith(false);
  });

  it('has correct width styling', () => {
    mockUseAppState.mockReturnValueOnce({
      isSidebarOpen: true,
      setIsSidebarOpen: mockSetIsSidebarOpen,
      viewMode: 'treemap',
      setViewMode: jest.fn(),
      isDarkMode: false,
      setIsDarkMode: jest.fn(),
    } as any);
    const { container } = render(<Sidebar />);
    const sidebar = container.querySelector('aside');
    expect(sidebar).toHaveStyle({ width: '500px' });
  });
});
