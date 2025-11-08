import { renderHook } from '@testing-library/react';
import { useUrlState } from '@/hooks/useUrlState';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
  })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

describe('useUrlState', () => {
  it('parses URL parameters correctly', () => {
    const { result } = renderHook(() => useUrlState());

    const params = new URLSearchParams('dir=0&path=/media/movies&view=tree&search=video&ext=mp4');
    const state = result.current.applyUrlState(params);

    expect(state).toEqual({
      dirId: '0',
      path: ['media', 'movies'],
      viewMode: 'tree',
      searchQuery: 'video',
      extensionFilter: 'mp4',
      typeFilter: null,
      advancedFilters: {
        size: { enabled: false },
        date: { enabled: false },
      },
    });
  });

  it('parses advanced filters from URL', () => {
    const { result } = renderHook(() => useUrlState());

    const params = new URLSearchParams('dir=0&minSize=1000000&maxSize=10000000&olderThan=30');
    const state = result.current.applyUrlState(params);

    expect(state?.advancedFilters).toEqual({
      size: {
        enabled: true,
        min: 1000000,
        max: 10000000,
      },
      date: {
        enabled: true,
        olderThan: 30,
      },
    });
  });

  it('returns empty path array when no path parameter', () => {
    const { result } = renderHook(() => useUrlState());

    const params = new URLSearchParams('dir=0');
    const state = result.current.applyUrlState(params);

    expect(state?.path).toEqual([]);
  });

  it('defaults to treemap view mode when not specified', () => {
    const { result } = renderHook(() => useUrlState());

    const params = new URLSearchParams('dir=0');
    const state = result.current.applyUrlState(params);

    expect(state?.viewMode).toBe('treemap');
  });

  it('handles type filter parameter', () => {
    const { result } = renderHook(() => useUrlState());

    const params = new URLSearchParams('dir=0&type=Videos');
    const state = result.current.applyUrlState(params);

    expect(state?.typeFilter).toBe('Videos');
  });

  it('handles all parameters together', () => {
    const { result } = renderHook(() => useUrlState());

    const params = new URLSearchParams(
      'dir=1&path=/documents/work&view=tree&search=report&ext=pdf&type=Documents&minSize=5000&maxSize=50000&olderThan=90'
    );
    const state = result.current.applyUrlState(params);

    expect(state).toEqual({
      dirId: '1',
      path: ['documents', 'work'],
      viewMode: 'tree',
      searchQuery: 'report',
      extensionFilter: 'pdf',
      typeFilter: 'Documents',
      advancedFilters: {
        size: {
          enabled: true,
          min: 5000,
          max: 50000,
        },
        date: {
          enabled: true,
          olderThan: 90,
        },
      },
    });
  });
});
