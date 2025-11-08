import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/components/Header';

// Mock the ShareButton component
jest.mock('@/components/ShareButton', () => {
  return function MockShareButton() {
    return <button>Share</button>;
  };
});

describe('Header', () => {
  const mockProps = {
    isDarkMode: true,
    onToggleDarkMode: jest.fn(),
    lastScanTime: null,
    isLoading: false,
    hasSelectedDirectory: false,
    hasScanResult: false,
    isComparisonMode: false,
    autoRefreshInterval: 0,
    onAutoRefreshChange: jest.fn(),
    onRefresh: jest.fn(),
    onExport: jest.fn(),
    onEnterComparisonMode: jest.fn(),
    onExitComparisonMode: jest.fn(),
    getShareableUrl: jest.fn(() => 'http://example.com'),
    isSidebarOpen: false,
    onToggleSidebar: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders logo and title', () => {
    render(<Header {...mockProps} />);
    expect(screen.getByText('StoryScan')).toBeInTheDocument();
    expect(screen.getByText('Beautiful Disk Usage Visualizer')).toBeInTheDocument();
  });

  it('toggles dark mode when button is clicked', () => {
    render(<Header {...mockProps} />);
    const darkModeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(darkModeButton);
    expect(mockProps.onToggleDarkMode).toHaveBeenCalledTimes(1);
  });

  it('shows last scan time when available and not loading', () => {
    const lastScanTime = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
    render(<Header {...mockProps} lastScanTime={lastScanTime} />);
    expect(screen.getByText('5 minutes ago')).toBeInTheDocument();
  });

  it('does not show last scan time when loading', () => {
    const lastScanTime = new Date();
    render(<Header {...mockProps} lastScanTime={lastScanTime} isLoading={true} />);
    expect(screen.queryByText(/ago/)).not.toBeInTheDocument();
  });

  it('shows auto-refresh selector when directory is selected and not loading', () => {
    render(<Header {...mockProps} hasSelectedDirectory={true} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('does not show auto-refresh selector when no directory is selected', () => {
    render(<Header {...mockProps} hasSelectedDirectory={false} />);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('shows refresh button when directory is selected and not loading', () => {
    render(<Header {...mockProps} hasSelectedDirectory={true} />);
    const refreshButton = screen.getByTitle('Refresh scan');
    expect(refreshButton).toBeInTheDocument();
  });

  it('calls onRefresh when refresh button is clicked', () => {
    render(<Header {...mockProps} hasSelectedDirectory={true} />);
    const refreshButton = screen.getByTitle('Refresh scan');
    fireEvent.click(refreshButton);
    expect(mockProps.onRefresh).toHaveBeenCalledTimes(1);
  });

  it('shows export button when scan result exists and not in comparison mode', () => {
    render(<Header {...mockProps} hasScanResult={true} isComparisonMode={false} />);
    const exportButton = screen.getByTitle('Export data');
    expect(exportButton).toBeInTheDocument();
  });

  it('does not show export button in comparison mode', () => {
    render(<Header {...mockProps} hasScanResult={true} isComparisonMode={true} />);
    expect(screen.queryByTitle('Export data')).not.toBeInTheDocument();
  });

  it('shows comparison mode button when scan result exists', () => {
    render(<Header {...mockProps} hasScanResult={true} />);
    expect(screen.getByTitle('Enter comparison mode')).toBeInTheDocument();
  });

  it('shows exit comparison button when in comparison mode', () => {
    render(<Header {...mockProps} hasScanResult={true} isComparisonMode={true} />);
    expect(screen.getByTitle('Exit comparison mode')).toBeInTheDocument();
  });

  it('calls onEnterComparisonMode when comparison button is clicked', () => {
    render(<Header {...mockProps} hasScanResult={true} />);
    const compareButton = screen.getByTitle('Enter comparison mode');
    fireEvent.click(compareButton);
    expect(mockProps.onEnterComparisonMode).toHaveBeenCalledTimes(1);
  });

  it('calls onExitComparisonMode when exit comparison button is clicked', () => {
    render(<Header {...mockProps} hasScanResult={true} isComparisonMode={true} />);
    const exitButton = screen.getByTitle('Exit comparison mode');
    fireEvent.click(exitButton);
    expect(mockProps.onExitComparisonMode).toHaveBeenCalledTimes(1);
  });

  it('shows share button when scan result exists and not in comparison mode', () => {
    render(<Header {...mockProps} hasScanResult={true} isComparisonMode={false} />);
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('does not show share button in comparison mode', () => {
    render(<Header {...mockProps} hasScanResult={true} isComparisonMode={true} />);
    expect(screen.queryByText('Share')).not.toBeInTheDocument();
  });

  it('shows sidebar toggle button when scan result exists and not in comparison mode', () => {
    render(<Header {...mockProps} hasScanResult={true} isComparisonMode={false} />);
    expect(screen.getByTitle('Open sidebar')).toBeInTheDocument();
  });

  it('calls onToggleSidebar when sidebar button is clicked', () => {
    render(<Header {...mockProps} hasScanResult={true} />);
    const sidebarButton = screen.getByTitle('Open sidebar');
    fireEvent.click(sidebarButton);
    expect(mockProps.onToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it('formats time correctly for just now', () => {
    const lastScanTime = new Date(Date.now() - 30 * 1000); // 30 seconds ago
    render(<Header {...mockProps} lastScanTime={lastScanTime} />);
    expect(screen.getByText('just now')).toBeInTheDocument();
  });

  it('formats time correctly for hours ago', () => {
    const lastScanTime = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
    render(<Header {...mockProps} lastScanTime={lastScanTime} />);
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
  });

  it('formats time correctly for days ago', () => {
    const lastScanTime = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
    render(<Header {...mockProps} lastScanTime={lastScanTime} />);
    expect(screen.getByText('3 days ago')).toBeInTheDocument();
  });
});
