import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HistoryView from '@/components/HistoryView';
import { TrackedPath, TrackedPathHistory, HistoryTimeRange } from '@/types';

// Mock context hook
const mockUseHistory = jest.fn();

jest.mock('@/contexts/HistoryContext', () => ({
  useHistory: () => mockUseHistory(),
}));

// Mock child components
jest.mock('@/components/HistoryGraph', () => {
  return function MockHistoryGraph() {
    return <div>HistoryGraph</div>;
  };
});

jest.mock('@/components/TrackedPathsManager', () => {
  return function MockTrackedPathsManager() {
    return <div>TrackedPathsManager</div>;
  };
});

describe('HistoryView', () => {
  const mockSetTimeRange = jest.fn();

  const mockTrackedPaths: TrackedPath[] = [
    {
      id: 1,
      path: '/data/media',
      label: 'Media',
      createdAt: '2024-01-01T00:00:00Z',
      isActive: true,
    },
  ];

  const mockHistoryData: TrackedPathHistory[] = [
    {
      trackedPath: mockTrackedPaths[0],
      dataPoints: [
        { date: new Date('2024-01-01'), sizeBytes: 1000, fileCount: 10, folderCount: 2 },
        { date: new Date('2024-01-02'), sizeBytes: 1200, fileCount: 12, folderCount: 3 },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseHistory.mockReturnValue({
      historyData: mockHistoryData,
      timeRange: '1M' as HistoryTimeRange,
      setTimeRange: mockSetTimeRange,
      isLoading: false,
      trackedPaths: mockTrackedPaths,
    });
  });

  it('renders time range selector with all options', () => {
    render(<HistoryView />);
    expect(screen.getByText('1W')).toBeInTheDocument();
    expect(screen.getByText('1M')).toBeInTheDocument();
    expect(screen.getByText('3M')).toBeInTheDocument();
    expect(screen.getByText('6M')).toBeInTheDocument();
    expect(screen.getByText('1Y')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it('renders HistoryGraph component when not loading', () => {
    render(<HistoryView />);
    expect(screen.getByText('HistoryGraph')).toBeInTheDocument();
  });

  it('renders TrackedPathsManager component', () => {
    render(<HistoryView />);
    expect(screen.getByText('TrackedPathsManager')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    mockUseHistory.mockReturnValueOnce({
      historyData: [],
      timeRange: '1M' as HistoryTimeRange,
      setTimeRange: mockSetTimeRange,
      isLoading: true,
      trackedPaths: mockTrackedPaths,
    });
    render(<HistoryView />);
    expect(screen.getByText('Loading history...')).toBeInTheDocument();
    expect(screen.queryByText('HistoryGraph')).not.toBeInTheDocument();
  });

  it('shows HistoryGraph when not loading', () => {
    render(<HistoryView />);
    expect(screen.getByText('HistoryGraph')).toBeInTheDocument();
    expect(screen.queryByText('Loading history...')).not.toBeInTheDocument();
  });

  it('calls setTimeRange when a time range button is clicked', () => {
    render(<HistoryView />);
    const weekButton = screen.getByText('1W');
    fireEvent.click(weekButton);
    expect(mockSetTimeRange).toHaveBeenCalledWith('1W');
  });

  it('displays "Time Range:" label', () => {
    render(<HistoryView />);
    expect(screen.getByText('Time Range:')).toBeInTheDocument();
  });

  it('renders all time range buttons with correct aria-labels', () => {
    render(<HistoryView />);
    expect(screen.getByRole('radio', { name: 'Show 1W of history' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Show 1M of history' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Show 3M of history' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Show 6M of history' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Show 1Y of history' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Show All of history' })).toBeInTheDocument();
  });

  it('calls setTimeRange with different time range values', () => {
    render(<HistoryView />);

    fireEvent.click(screen.getByText('3M'));
    expect(mockSetTimeRange).toHaveBeenCalledWith('3M');

    fireEvent.click(screen.getByText('6M'));
    expect(mockSetTimeRange).toHaveBeenCalledWith('6M');

    fireEvent.click(screen.getByText('1Y'));
    expect(mockSetTimeRange).toHaveBeenCalledWith('1Y');

    fireEvent.click(screen.getByText('All'));
    expect(mockSetTimeRange).toHaveBeenCalledWith('ALL');
  });

  it('does not call setTimeRange when clicking the already-selected time range', () => {
    render(<HistoryView />);
    // '1M' is the currently selected value per beforeEach
    // ToggleGroup with type="single" uses onValueChange which passes empty string
    // when deselecting, and the component guards with `value &&`
    const selectedButton = screen.getByText('1M');
    fireEvent.click(selectedButton);
    // The guard `value && setTimeRange(...)` prevents calling with empty string
    expect(mockSetTimeRange).not.toHaveBeenCalled();
  });
});
