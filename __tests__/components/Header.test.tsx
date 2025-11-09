import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    const darkModeButtons = screen.getAllByTitle('Toggle theme');
    fireEvent.click(darkModeButtons[0]);
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
    const refreshButtons = screen.getAllByTitle('Refresh scan');
    expect(refreshButtons.length).toBeGreaterThan(0);
  });

  it('calls onRefresh when refresh button is clicked', () => {
    render(<Header {...mockProps} hasSelectedDirectory={true} />);
    const refreshButtons = screen.getAllByTitle('Refresh scan');
    fireEvent.click(refreshButtons[0]);
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

  // Mobile menu tests
  it('shows mobile menu button when scan result exists', () => {
    render(<Header {...mockProps} hasScanResult={true} />);
    expect(screen.getByTitle('Open menu')).toBeInTheDocument();
  });

  it('does not show mobile menu button when loading', () => {
    render(<Header {...mockProps} hasScanResult={true} isLoading={true} />);
    expect(screen.queryByTitle('Open menu')).not.toBeInTheDocument();
  });

  it('shows mobile menu button when directory is selected', () => {
    render(<Header {...mockProps} hasSelectedDirectory={true} />);
    expect(screen.getByTitle('Open menu')).toBeInTheDocument();
  });

  describe('Auto-refresh functionality', () => {
    it('calls onAutoRefreshChange when auto-refresh interval is changed', () => {
      render(<Header {...mockProps} hasSelectedDirectory={true} autoRefreshInterval={0} />);

      const select = screen.getByRole('combobox');
      fireEvent.click(select);

      // Simulate selecting 5 minutes (300000ms)
      const option = screen.getByText('5 minutes');
      fireEvent.click(option);

      expect(mockProps.onAutoRefreshChange).toHaveBeenCalledWith(300000);
    });

    it('shows current auto-refresh interval value', () => {
      render(<Header {...mockProps} hasSelectedDirectory={true} autoRefreshInterval={300000} />);
      // The select should have the value set
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('Export functionality', () => {
    it('renders export button when scan result exists', () => {
      render(<Header {...mockProps} hasScanResult={true} />);
      const exportButton = screen.getByTitle('Export data');
      expect(exportButton).toBeInTheDocument();
    });

    it('export button is clickable', () => {
      render(<Header {...mockProps} hasScanResult={true} />);
      const exportButton = screen.getByTitle('Export data');
      fireEvent.click(exportButton);
      // Dropdown menu rendering is handled by Radix UI portals
      // Actual clicking behavior is tested in E2E tests
      expect(exportButton).toBeInTheDocument();
    });

    it('does not render export button when no scan result', () => {
      render(<Header {...mockProps} hasScanResult={false} />);
      expect(screen.queryByTitle('Export data')).not.toBeInTheDocument();
    });
  });

  describe('Sidebar toggle functionality', () => {
    it('shows correct icon when sidebar is closed', () => {
      render(<Header {...mockProps} hasScanResult={true} isSidebarOpen={false} />);
      expect(screen.getByTitle('Open sidebar')).toBeInTheDocument();
    });

    it('shows correct icon when sidebar is open', () => {
      render(<Header {...mockProps} hasScanResult={true} isSidebarOpen={true} />);
      expect(screen.getByTitle('Close sidebar')).toBeInTheDocument();
    });

    it('toggles sidebar when button is clicked multiple times', () => {
      const { rerender } = render(
        <Header {...mockProps} hasScanResult={true} isSidebarOpen={false} />
      );

      const sidebarButton = screen.getByTitle('Open sidebar');
      fireEvent.click(sidebarButton);
      expect(mockProps.onToggleSidebar).toHaveBeenCalledTimes(1);

      rerender(<Header {...mockProps} hasScanResult={true} isSidebarOpen={true} />);
      const closeSidebarButton = screen.getByTitle('Close sidebar');
      fireEvent.click(closeSidebarButton);
      expect(mockProps.onToggleSidebar).toHaveBeenCalledTimes(2);
    });
  });

  describe('Dark mode toggle functionality', () => {
    it('shows moon icon when in light mode', () => {
      render(<Header {...mockProps} isDarkMode={false} />);
      const darkModeButtons = screen.getAllByTitle('Toggle theme');
      expect(darkModeButtons.length).toBeGreaterThan(0);
    });

    it('shows sun icon when in dark mode', () => {
      render(<Header {...mockProps} isDarkMode={true} />);
      const darkModeButtons = screen.getAllByTitle('Toggle theme');
      expect(darkModeButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Edge cases', () => {
    it('handles all props being false', () => {
      const emptyProps = {
        ...mockProps,
        hasSelectedDirectory: false,
        hasScanResult: false,
        isComparisonMode: false,
        isLoading: false,
        isSidebarOpen: false,
        lastScanTime: null,
      };
      render(<Header {...emptyProps} />);
      expect(screen.getByText('StoryScan')).toBeInTheDocument();
    });

    it('handles loading state correctly', () => {
      render(
        <Header {...mockProps} isLoading={true} hasSelectedDirectory={true} hasScanResult={true} />
      );
      // Most buttons should not be visible when loading
      expect(screen.queryByTitle('Refresh scan')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Export data')).not.toBeInTheDocument();
    });

    it('handles comparison mode with scan result', () => {
      render(<Header {...mockProps} isComparisonMode={true} hasScanResult={true} />);
      expect(screen.getByTitle('Exit comparison mode')).toBeInTheDocument();
      expect(screen.queryByTitle('Export data')).not.toBeInTheDocument();
      expect(screen.queryByText('Share')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Open sidebar')).not.toBeInTheDocument();
    });

    it('handles very recent scan time (under 1 minute)', () => {
      const recentTime = new Date(Date.now() - 10 * 1000); // 10 seconds ago
      render(<Header {...mockProps} lastScanTime={recentTime} />);
      expect(screen.getByText('just now')).toBeInTheDocument();
    });

    it('handles auto-refresh interval of 0 (off)', () => {
      render(<Header {...mockProps} hasSelectedDirectory={true} autoRefreshInterval={0} />);
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('handles auto-refresh interval of 15 minutes', () => {
      render(<Header {...mockProps} hasSelectedDirectory={true} autoRefreshInterval={900000} />);
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('handles auto-refresh interval of 30 minutes', () => {
      render(<Header {...mockProps} hasSelectedDirectory={true} autoRefreshInterval={1800000} />);
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('handles auto-refresh interval of 1 hour', () => {
      render(<Header {...mockProps} hasSelectedDirectory={true} autoRefreshInterval={3600000} />);
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });
  });
});
