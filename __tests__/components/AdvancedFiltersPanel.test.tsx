import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdvancedFiltersPanel from '@/components/AdvancedFiltersPanel';
import { AdvancedFilters } from '@/types';

describe('AdvancedFiltersPanel', () => {
  const mockOnFiltersChange = jest.fn();

  const defaultFilters: AdvancedFilters = {
    size: { enabled: false },
    date: { enabled: false },
  };

  beforeEach(() => {
    mockOnFiltersChange.mockClear();
  });

  it('renders the advanced filters panel', () => {
    render(<AdvancedFiltersPanel filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />);
    expect(screen.getByText('Advanced Filters')).toBeDefined();
  });

  it('starts collapsed by default', () => {
    render(<AdvancedFiltersPanel filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />);
    expect(screen.queryByText('Quick Presets')).toBeNull();
  });

  it('expands when expand button is clicked', () => {
    render(<AdvancedFiltersPanel filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />);

    const expandButton = screen.getByText('Expand').closest('button');
    if (expandButton) fireEvent.click(expandButton);

    expect(screen.getByText('Quick Presets')).toBeDefined();
  });

  it('shows active filter count badge', () => {
    const activeFilters: AdvancedFilters = {
      size: { enabled: true, min: 1024 * 1024 * 1024 },
      date: { enabled: true, olderThan: 365 },
    };

    render(<AdvancedFiltersPanel filters={activeFilters} onFiltersChange={mockOnFiltersChange} />);

    // Badge showing count of active filters
    expect(screen.getByText('2')).toBeDefined();
  });

  it('displays size filter chip when size filter is active', () => {
    const sizeFilters: AdvancedFilters = {
      size: { enabled: true, min: 1024 * 1024 * 1024 },
      date: { enabled: false },
    };

    render(<AdvancedFiltersPanel filters={sizeFilters} onFiltersChange={mockOnFiltersChange} />);

    expect(screen.getByText(/Size:/)).toBeDefined();
    expect(screen.getByText(/1 GB/)).toBeDefined();
  });

  it('displays date filter chip when date filter is active', () => {
    const dateFilters: AdvancedFilters = {
      size: { enabled: false },
      date: { enabled: true, olderThan: 365 },
    };

    render(<AdvancedFiltersPanel filters={dateFilters} onFiltersChange={mockOnFiltersChange} />);

    expect(screen.getByText('Older than 365 days')).toBeDefined();
  });

  it('calls onFiltersChange when size filter is toggled', () => {
    render(<AdvancedFiltersPanel filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />);

    // Expand panel
    const expandButton = screen.getByText('Expand').closest('button');
    if (expandButton) fireEvent.click(expandButton);

    // Toggle size filter
    const sizeCheckbox = screen.getByLabelText('Filter by Size');
    fireEvent.click(sizeCheckbox);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      size: { enabled: true },
      date: { enabled: false },
    });
  });

  it('calls onFiltersChange when date filter is toggled', () => {
    render(<AdvancedFiltersPanel filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />);

    // Expand panel
    const expandButton = screen.getByText('Expand').closest('button');
    if (expandButton) fireEvent.click(expandButton);

    // Toggle date filter
    const dateCheckbox = screen.getByLabelText('Filter by Age');
    fireEvent.click(dateCheckbox);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      size: { enabled: false },
      date: { enabled: true },
    });
  });

  it('shows size input fields when size filter is enabled', () => {
    const sizeFilters: AdvancedFilters = {
      size: { enabled: true },
      date: { enabled: false },
    };

    render(<AdvancedFiltersPanel filters={sizeFilters} onFiltersChange={mockOnFiltersChange} />);

    // Expand panel
    const expandButton = screen.getByText('Expand').closest('button');
    if (expandButton) fireEvent.click(expandButton);

    expect(screen.getByLabelText('Minimum Size (MB)')).toBeDefined();
    expect(screen.getByLabelText('Maximum Size (MB)')).toBeDefined();
  });

  it('shows date input field when date filter is enabled', () => {
    const dateFilters: AdvancedFilters = {
      size: { enabled: false },
      date: { enabled: true },
    };

    render(<AdvancedFiltersPanel filters={dateFilters} onFiltersChange={mockOnFiltersChange} />);

    // Expand panel
    const expandButton = screen.getByText('Expand').closest('button');
    if (expandButton) fireEvent.click(expandButton);

    expect(screen.getByLabelText('Show files older than (days)')).toBeDefined();
  });

  it('applies preset when preset button is clicked', () => {
    render(<AdvancedFiltersPanel filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />);

    // Expand panel
    const expandButton = screen.getByText('Expand').closest('button');
    if (expandButton) fireEvent.click(expandButton);

    // Click "Large Files" preset
    const largeFilesPreset = screen.getByText('Large Files').closest('button');
    if (largeFilesPreset) fireEvent.click(largeFilesPreset);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      size: { enabled: true, min: 1024 * 1024 * 1024 },
      date: { enabled: false },
    });
  });

  it('renders all preset buttons', () => {
    render(<AdvancedFiltersPanel filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />);

    // Expand panel
    const expandButton = screen.getByText('Expand').closest('button');
    if (expandButton) fireEvent.click(expandButton);

    expect(screen.getByText('Large Files')).toBeDefined();
    expect(screen.getByText('Old Files')).toBeDefined();
    expect(screen.getByText('Large Old Files')).toBeDefined();
    expect(screen.getByText('Tiny Files')).toBeDefined();
  });

  it('shows Clear All button when filters are active', () => {
    const activeFilters: AdvancedFilters = {
      size: { enabled: true, min: 1024 * 1024 },
      date: { enabled: true, olderThan: 30 },
    };

    render(<AdvancedFiltersPanel filters={activeFilters} onFiltersChange={mockOnFiltersChange} />);

    // Clear All button appears in the chips area when multiple filters are active
    const clearButton = screen.getByText('Clear All');
    expect(clearButton).toBeDefined();
  });

  it('clears all filters when Clear All is clicked', () => {
    const activeFilters: AdvancedFilters = {
      size: { enabled: true, min: 1024 * 1024 },
      date: { enabled: true, olderThan: 30 },
    };

    render(<AdvancedFiltersPanel filters={activeFilters} onFiltersChange={mockOnFiltersChange} />);

    const clearButton = screen.getAllByText('Clear All')[0].closest('button');
    if (clearButton) fireEvent.click(clearButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      size: { enabled: false },
      date: { enabled: false },
    });
  });

  it('removes individual filter when chip X is clicked', () => {
    const activeFilters: AdvancedFilters = {
      size: { enabled: true, min: 1024 * 1024 },
      date: { enabled: true, olderThan: 30 },
    };

    render(<AdvancedFiltersPanel filters={activeFilters} onFiltersChange={mockOnFiltersChange} />);

    // Find the X button in one of the chips (there should be 2, one for each filter)
    const removeButtons = screen.getAllByRole('button');
    const chipRemoveButton = removeButtons.find((btn) => btn.querySelector('.lucide-x'));

    if (chipRemoveButton) {
      fireEvent.click(chipRemoveButton);
      // Should have been called to remove one of the filters
      expect(mockOnFiltersChange).toHaveBeenCalled();
    }
  });

  it('formats size range correctly in chip', () => {
    const rangeFilters: AdvancedFilters = {
      size: { enabled: true, min: 100 * 1024 * 1024, max: 1024 * 1024 * 1024 },
      date: { enabled: false },
    };

    render(<AdvancedFiltersPanel filters={rangeFilters} onFiltersChange={mockOnFiltersChange} />);

    // Check that the size chip contains both min and max values
    const sizeChip = screen.getByText(/Size:/);
    expect(sizeChip.textContent).toContain('MB');
    expect(sizeChip.textContent).toContain('GB');
  });

  it('updates size min value when input changes', () => {
    const sizeFilters: AdvancedFilters = {
      size: { enabled: true },
      date: { enabled: false },
    };

    render(<AdvancedFiltersPanel filters={sizeFilters} onFiltersChange={mockOnFiltersChange} />);

    // Expand panel
    const expandButton = screen.getByText('Expand').closest('button');
    if (expandButton) fireEvent.click(expandButton);

    const minInput = screen.getByLabelText('Minimum Size (MB)') as HTMLInputElement;
    fireEvent.change(minInput, { target: { value: '100' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      size: { enabled: true, min: 100 * 1024 * 1024 },
      date: { enabled: false },
    });
  });

  it('updates date value when input changes', () => {
    const dateFilters: AdvancedFilters = {
      size: { enabled: false },
      date: { enabled: true },
    };

    render(<AdvancedFiltersPanel filters={dateFilters} onFiltersChange={mockOnFiltersChange} />);

    // Expand panel
    const expandButton = screen.getByText('Expand').closest('button');
    if (expandButton) fireEvent.click(expandButton);

    const dateInput = screen.getByLabelText('Show files older than (days)') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '365' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      size: { enabled: false },
      date: { enabled: true, olderThan: 365 },
    });
  });

  it('handles empty size input by clearing min/max values', () => {
    const sizeFilters: AdvancedFilters = {
      size: { enabled: true, min: 100 * 1024 * 1024 },
      date: { enabled: false },
    };

    render(<AdvancedFiltersPanel filters={sizeFilters} onFiltersChange={mockOnFiltersChange} />);

    // Expand panel
    const expandButton = screen.getByText('Expand').closest('button');
    if (expandButton) fireEvent.click(expandButton);

    const minInput = screen.getByLabelText('Minimum Size (MB)') as HTMLInputElement;
    fireEvent.change(minInput, { target: { value: '' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      size: { enabled: true, min: undefined },
      date: { enabled: false },
    });
  });

  it('displays preset descriptions', () => {
    render(<AdvancedFiltersPanel filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />);

    // Expand panel
    const expandButton = screen.getByText('Expand').closest('button');
    if (expandButton) fireEvent.click(expandButton);

    expect(screen.getByText('Files larger than 1GB')).toBeDefined();
    expect(screen.getByText('Files older than 1 year')).toBeDefined();
    expect(screen.getByText('Files >500MB and older than 6 months')).toBeDefined();
    expect(screen.getByText('Files smaller than 1MB')).toBeDefined();
  });
});
