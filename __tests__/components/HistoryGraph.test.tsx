import React from 'react';
import { render, screen } from '@testing-library/react';
import HistoryGraph from '@/components/HistoryGraph';
import { TrackedPathHistory } from '@/types';

jest.mock('@/lib/utils', () => ({
  formatBytes: jest.fn((b: number) => b + ' bytes'),
  getColorForPath: jest.fn(() => '#3b82f6'),
}));

const makeTrackedPath = (
  overrides?: Partial<TrackedPathHistory['trackedPath']>
): TrackedPathHistory['trackedPath'] => ({
  id: 1,
  path: '/data/media',
  label: 'Media',
  isActive: true,
  createdAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

const makeDataPoint = (
  overrides?: Partial<TrackedPathHistory['dataPoints'][0]>
): TrackedPathHistory['dataPoints'][0] => ({
  date: new Date('2025-06-01T00:00:00Z'),
  sizeBytes: 1000000,
  fileCount: 100,
  folderCount: 10,
  ...overrides,
});

describe('HistoryGraph', () => {
  describe('Empty state', () => {
    it('renders empty state when data is an empty array', () => {
      render(<HistoryGraph data={[]} />);
      expect(screen.getByText('No history data yet')).toBeInTheDocument();
    });

    it('renders empty state when data has tracked paths but no data points', () => {
      const data: TrackedPathHistory[] = [
        {
          trackedPath: makeTrackedPath(),
          dataPoints: [],
        },
        {
          trackedPath: makeTrackedPath({ id: 2, path: '/data/downloads', label: 'Downloads' }),
          dataPoints: [],
        },
      ];

      render(<HistoryGraph data={data} />);
      expect(screen.getByText('No history data yet')).toBeInTheDocument();
    });

    it('shows "No history data yet" message in empty state', () => {
      render(<HistoryGraph data={[]} />);
      const heading = screen.getByText('No history data yet');
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('P');
      expect(heading).toHaveClass('text-lg', 'font-medium');
    });

    it('shows instruction text in empty state', () => {
      render(<HistoryGraph data={[]} />);
      expect(
        screen.getByText('Track some paths and run a scan to start recording history.')
      ).toBeInTheDocument();
    });

    it('does not render an SVG element in empty state', () => {
      const { container } = render(<HistoryGraph data={[]} />);
      expect(container.querySelector('svg')).toBeNull();
    });
  });

  describe('Chart rendering', () => {
    const dataWithPoints: TrackedPathHistory[] = [
      {
        trackedPath: makeTrackedPath(),
        dataPoints: [
          makeDataPoint({ date: new Date('2025-06-01'), sizeBytes: 500000 }),
          makeDataPoint({ date: new Date('2025-06-15'), sizeBytes: 750000 }),
          makeDataPoint({ date: new Date('2025-07-01'), sizeBytes: 1000000 }),
        ],
      },
    ];

    it('renders SVG element when data has points', () => {
      const { container } = render(<HistoryGraph data={dataWithPoints} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders container div for the chart', () => {
      const { container } = render(<HistoryGraph data={dataWithPoints} />);
      const wrapper = container.firstElementChild;
      expect(wrapper).toBeInTheDocument();
      expect(wrapper?.tagName).toBe('DIV');
      expect(wrapper).toHaveClass('w-full');
    });

    it('renders SVG with correct height style', () => {
      const { container } = render(<HistoryGraph data={dataWithPoints} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveStyle({ height: '400px' });
    });

    it('renders chart with multiple series', () => {
      const multiSeriesData: TrackedPathHistory[] = [
        {
          trackedPath: makeTrackedPath({ id: 1, path: '/data/media', label: 'Media' }),
          dataPoints: [
            makeDataPoint({ date: new Date('2025-06-01'), sizeBytes: 500000 }),
            makeDataPoint({ date: new Date('2025-07-01'), sizeBytes: 1000000 }),
          ],
        },
        {
          trackedPath: makeTrackedPath({ id: 2, path: '/data/downloads', label: 'Downloads' }),
          dataPoints: [
            makeDataPoint({ date: new Date('2025-06-01'), sizeBytes: 200000 }),
            makeDataPoint({ date: new Date('2025-07-01'), sizeBytes: 400000 }),
          ],
        },
      ];

      const { container } = render(<HistoryGraph data={multiSeriesData} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('does not show empty state text when data has points', () => {
      render(<HistoryGraph data={dataWithPoints} />);
      expect(screen.queryByText('No history data yet')).toBeNull();
      expect(
        screen.queryByText('Track some paths and run a scan to start recording history.')
      ).toBeNull();
    });
  });

  describe('Mixed data scenarios', () => {
    it('renders chart when at least one series has data points', () => {
      const mixedData: TrackedPathHistory[] = [
        {
          trackedPath: makeTrackedPath({ id: 1, label: 'Media' }),
          dataPoints: [],
        },
        {
          trackedPath: makeTrackedPath({ id: 2, label: 'Downloads' }),
          dataPoints: [makeDataPoint({ date: new Date('2025-06-01'), sizeBytes: 100000 })],
        },
      ];

      const { container } = render(<HistoryGraph data={mixedData} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(screen.queryByText('No history data yet')).toBeNull();
    });

    it('renders chart with a single data point', () => {
      const singlePointData: TrackedPathHistory[] = [
        {
          trackedPath: makeTrackedPath(),
          dataPoints: [makeDataPoint()],
        },
      ];

      const { container } = render(<HistoryGraph data={singlePointData} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });
});
