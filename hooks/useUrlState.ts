import { useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ViewMode, AdvancedFilters } from '@/types';

interface UrlStateParams {
  dirId: string | null;
  path: string[];
  viewMode: ViewMode;
  searchQuery: string;
  extensionFilter: string | null;
  typeFilter: string | null;
  advancedFilters: AdvancedFilters;
}

interface UseUrlStateReturn {
  getShareableUrl: () => string;
  applyUrlState: (params: URLSearchParams) => UrlStateParams | null;
}

export function useUrlState(): UseUrlStateReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Generate shareable URL with current state
  const getShareableUrl = useCallback((): string => {
    if (typeof window === 'undefined') return '';

    const currentUrl = new URL(window.location.href);
    return currentUrl.toString();
  }, []);

  // Parse URL parameters and return state
  const applyUrlState = useCallback((params: URLSearchParams): UrlStateParams | null => {
    const dirId = params.get('dir');
    const pathParam = params.get('path');
    const viewMode = (params.get('view') as ViewMode) || 'treemap';
    const searchQuery = params.get('search') || '';
    const extensionFilter = params.get('ext');
    const typeFilter = params.get('type');

    // Parse advanced filters
    const minSize = params.get('minSize');
    const maxSize = params.get('maxSize');
    const olderThan = params.get('olderThan');

    const advancedFilters: AdvancedFilters = {
      size: {
        enabled: Boolean(minSize || maxSize),
        min: minSize ? parseFloat(minSize) : undefined,
        max: maxSize ? parseFloat(maxSize) : undefined,
      },
      date: {
        enabled: Boolean(olderThan),
        olderThan: olderThan ? parseInt(olderThan) : undefined,
      },
    };

    return {
      dirId,
      path: pathParam ? pathParam.split('/').filter(Boolean) : [],
      viewMode,
      searchQuery,
      extensionFilter,
      typeFilter,
      advancedFilters,
    };
  }, []);

  return {
    getShareableUrl,
    applyUrlState,
  };
}

// Helper function to update URL without navigation
export function updateUrl(params: {
  dirId?: string;
  path?: string[];
  viewMode?: ViewMode;
  searchQuery?: string;
  extensionFilter?: string | null;
  typeFilter?: string | null;
  advancedFilters?: AdvancedFilters;
}): void {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  const searchParams = new URLSearchParams(url.search);

  // Update or remove parameters
  if (params.dirId !== undefined) {
    if (params.dirId) {
      searchParams.set('dir', params.dirId);
    } else {
      searchParams.delete('dir');
    }
  }

  if (params.path !== undefined && params.path.length > 0) {
    searchParams.set('path', params.path.join('/'));
  } else if (params.path !== undefined) {
    searchParams.delete('path');
  }

  if (params.viewMode) {
    searchParams.set('view', params.viewMode);
  }

  if (params.searchQuery !== undefined) {
    if (params.searchQuery) {
      searchParams.set('search', params.searchQuery);
    } else {
      searchParams.delete('search');
    }
  }

  if (params.extensionFilter !== undefined) {
    if (params.extensionFilter) {
      searchParams.set('ext', params.extensionFilter);
    } else {
      searchParams.delete('ext');
    }
  }

  if (params.typeFilter !== undefined) {
    if (params.typeFilter) {
      searchParams.set('type', params.typeFilter);
    } else {
      searchParams.delete('type');
    }
  }

  // Handle advanced filters
  if (params.advancedFilters) {
    const { size, date } = params.advancedFilters;

    if (size.enabled && size.min !== undefined) {
      searchParams.set('minSize', size.min.toString());
    } else {
      searchParams.delete('minSize');
    }

    if (size.enabled && size.max !== undefined) {
      searchParams.set('maxSize', size.max.toString());
    } else {
      searchParams.delete('maxSize');
    }

    if (date.enabled && date.olderThan !== undefined) {
      searchParams.set('olderThan', date.olderThan.toString());
    } else {
      searchParams.delete('olderThan');
    }
  }

  // Update URL without page reload
  const newUrl = `${url.pathname}?${searchParams.toString()}`;
  window.history.replaceState({}, '', newUrl);
}
