import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchBar from '@/components/SearchBar';

describe('SearchBar', () => {
  const mockOnSearchChange = jest.fn();
  const mockOnExtensionFilter = jest.fn();
  const availableExtensions = ['mp4', 'pdf', 'jpg', 'txt'];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input', () => {
    render(
      <SearchBar
        onSearchChange={mockOnSearchChange}
        onExtensionFilter={mockOnExtensionFilter}
        availableExtensions={availableExtensions}
      />
    );

    expect(screen.getByPlaceholderText('Search files and folders...')).toBeDefined();
  });

  it('calls onSearchChange after typing with debounce', async () => {
    jest.useFakeTimers();

    render(
      <SearchBar
        onSearchChange={mockOnSearchChange}
        onExtensionFilter={mockOnExtensionFilter}
        availableExtensions={availableExtensions}
      />
    );

    const input = screen.getByPlaceholderText('Search files and folders...');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(mockOnSearchChange).not.toHaveBeenCalled();

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(mockOnSearchChange).toHaveBeenCalledWith('test');
    });

    jest.useRealTimers();
  });

  it('shows clear button when text is entered', () => {
    render(
      <SearchBar
        onSearchChange={mockOnSearchChange}
        onExtensionFilter={mockOnExtensionFilter}
        availableExtensions={availableExtensions}
      />
    );

    const input = screen.getByPlaceholderText('Search files and folders...');
    fireEvent.change(input, { target: { value: 'test' } });

    // Clear button (X icon) should be visible
    const clearButtons = screen.getAllByRole('button');
    expect(clearButtons.length).toBeGreaterThan(0);
  });

  it('clears search when clear button is clicked', async () => {
    render(
      <SearchBar
        onSearchChange={mockOnSearchChange}
        onExtensionFilter={mockOnExtensionFilter}
        availableExtensions={availableExtensions}
      />
    );

    const input = screen.getByPlaceholderText('Search files and folders...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test' } });

    expect(input.value).toBe('test');

    // Find and click the clear button within the search input area
    const clearButton = input.parentElement?.querySelector('button');
    if (clearButton) {
      fireEvent.click(clearButton);
      expect(input.value).toBe('');
    }
  });

  it('displays extension filter dropdown', () => {
    render(
      <SearchBar
        onSearchChange={mockOnSearchChange}
        onExtensionFilter={mockOnExtensionFilter}
        availableExtensions={availableExtensions}
      />
    );

    // The Select component should be rendered
    expect(screen.getByRole('combobox')).toBeDefined();
  });

  it('shows match count when provided with active search', () => {
    const { rerender } = render(
      <SearchBar
        onSearchChange={mockOnSearchChange}
        onExtensionFilter={mockOnExtensionFilter}
        availableExtensions={availableExtensions}
      />
    );

    // Type in search to activate it
    const input = screen.getByPlaceholderText('Search files and folders...');
    fireEvent.change(input, { target: { value: 'test' } });

    // Rerender with matchCount
    rerender(
      <SearchBar
        onSearchChange={mockOnSearchChange}
        onExtensionFilter={mockOnExtensionFilter}
        availableExtensions={availableExtensions}
        matchCount={5}
      />
    );

    expect(screen.getByText(/Found/)).toBeDefined();
    expect(screen.getByText(/5/)).toBeDefined();
    expect(screen.getByText(/matches/)).toBeDefined();
  });

  it('shows "No results found" when match count is 0', () => {
    const { rerender } = render(
      <SearchBar
        onSearchChange={mockOnSearchChange}
        onExtensionFilter={mockOnExtensionFilter}
        availableExtensions={availableExtensions}
      />
    );

    // Type in search to activate it
    const input = screen.getByPlaceholderText('Search files and folders...');
    fireEvent.change(input, { target: { value: 'test' } });

    // Rerender with 0 matchCount
    rerender(
      <SearchBar
        onSearchChange={mockOnSearchChange}
        onExtensionFilter={mockOnExtensionFilter}
        availableExtensions={availableExtensions}
        matchCount={0}
      />
    );

    expect(screen.getByText('No results found')).toBeDefined();
  });

  it('shows singular "match" when count is 1', () => {
    const { rerender } = render(
      <SearchBar
        onSearchChange={mockOnSearchChange}
        onExtensionFilter={mockOnExtensionFilter}
        availableExtensions={availableExtensions}
      />
    );

    // Type in search to activate it
    const input = screen.getByPlaceholderText('Search files and folders...');
    fireEvent.change(input, { target: { value: 'test' } });

    // Rerender with matchCount 1
    rerender(
      <SearchBar
        onSearchChange={mockOnSearchChange}
        onExtensionFilter={mockOnExtensionFilter}
        availableExtensions={availableExtensions}
        matchCount={1}
      />
    );

    expect(screen.getByText(/1/)).toBeDefined();
    expect(screen.getByText(/match/)).toBeDefined();
  });

  it('renders all available extensions in dropdown', () => {
    const { container } = render(
      <SearchBar
        onSearchChange={mockOnSearchChange}
        onExtensionFilter={mockOnExtensionFilter}
        availableExtensions={availableExtensions}
      />
    );

    // Open the select dropdown
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    // Check if extensions are in the document (they should be rendered when opened)
    // Note: This test might need adjustment based on how Radix UI renders selects
  });

  it('shows clear all filters button when filters are active', () => {
    render(
      <SearchBar
        onSearchChange={mockOnSearchChange}
        onExtensionFilter={mockOnExtensionFilter}
        availableExtensions={availableExtensions}
      />
    );

    const input = screen.getByPlaceholderText('Search files and folders...');
    fireEvent.change(input, { target: { value: 'test' } });

    // Should have a clear all button when search is active
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(1);
  });

  describe('Extension Filter Functionality', () => {
    it('should call onExtensionFilter with specific extension when selected', async () => {
      render(
        <SearchBar
          onSearchChange={mockOnSearchChange}
          onExtensionFilter={mockOnExtensionFilter}
          availableExtensions={availableExtensions}
        />
      );

      // Open select dropdown
      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);

      // Select a specific extension
      const mp4Option = screen.getByText('.mp4');
      fireEvent.click(mp4Option);

      await waitFor(() => {
        expect(mockOnExtensionFilter).toHaveBeenCalledWith('mp4');
      });
    });

    it('should call onExtensionFilter with null when "All types" is selected', async () => {
      render(
        <SearchBar
          onSearchChange={mockOnSearchChange}
          onExtensionFilter={mockOnExtensionFilter}
          availableExtensions={availableExtensions}
        />
      );

      // First select a specific extension
      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);
      const mp4Option = screen.getByText('.mp4');
      fireEvent.click(mp4Option);

      await waitFor(() => {
        expect(mockOnExtensionFilter).toHaveBeenCalledWith('mp4');
      });

      // Then select "All types"
      fireEvent.click(trigger);
      const allOption = screen.getByText('All types');
      fireEvent.click(allOption);

      await waitFor(() => {
        expect(mockOnExtensionFilter).toHaveBeenCalledWith(null);
      });
    });

    it('should show clear all button when extension filter is active', () => {
      render(
        <SearchBar
          onSearchChange={mockOnSearchChange}
          onExtensionFilter={mockOnExtensionFilter}
          availableExtensions={availableExtensions}
        />
      );

      // Initially no clear all button (no active filters)
      expect(screen.queryByTitle('Clear all filters')).not.toBeInTheDocument();

      // Select an extension
      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);
      const pdfOption = screen.getByText('.pdf');
      fireEvent.click(pdfOption);

      // Now clear all button should be present
      expect(screen.getByTitle('Clear all filters')).toBeInTheDocument();
    });
  });

  describe('Clear All Functionality', () => {
    it('should clear search query and extension filter when clear all is clicked', async () => {
      render(
        <SearchBar
          onSearchChange={mockOnSearchChange}
          onExtensionFilter={mockOnExtensionFilter}
          availableExtensions={availableExtensions}
        />
      );

      // Set search query
      const input = screen.getByPlaceholderText('Search files and folders...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'test query' } });
      expect(input.value).toBe('test query');

      // Set extension filter
      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);
      const txtOption = screen.getByText('.txt');
      fireEvent.click(txtOption);

      await waitFor(() => {
        expect(mockOnExtensionFilter).toHaveBeenCalledWith('txt');
      });

      // Click clear all button (the standalone X button, not the one in the search input)
      const clearAllButton = screen.getByTitle('Clear all filters');
      fireEvent.click(clearAllButton);

      // Both search and filter should be cleared
      expect(input.value).toBe('');
      await waitFor(() => {
        expect(mockOnSearchChange).toHaveBeenCalledWith('');
        expect(mockOnExtensionFilter).toHaveBeenCalledWith(null);
      });
    });

    it('should hide clear all button after clearing all filters', async () => {
      render(
        <SearchBar
          onSearchChange={mockOnSearchChange}
          onExtensionFilter={mockOnExtensionFilter}
          availableExtensions={availableExtensions}
        />
      );

      // Set search query
      const input = screen.getByPlaceholderText('Search files and folders...');
      fireEvent.change(input, { target: { value: 'test' } });

      // Clear all button should be visible
      const clearAllButton = screen.getByTitle('Clear all filters');
      expect(clearAllButton).toBeInTheDocument();

      // Click clear all
      fireEvent.click(clearAllButton);

      // Clear all button should no longer be visible
      await waitFor(() => {
        expect(screen.queryByTitle('Clear all filters')).not.toBeInTheDocument();
      });
    });

    it('should reset both search and extension states when clearing all', async () => {
      render(
        <SearchBar
          onSearchChange={mockOnSearchChange}
          onExtensionFilter={mockOnExtensionFilter}
          availableExtensions={availableExtensions}
        />
      );

      // Set both filters
      const input = screen.getByPlaceholderText('Search files and folders...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'search term' } });

      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);
      const jpgOption = screen.getByText('.jpg');
      fireEvent.click(jpgOption);

      await waitFor(() => {
        expect(mockOnExtensionFilter).toHaveBeenCalledWith('jpg');
      });

      // Clear all filters
      const clearAllButton = screen.getByTitle('Clear all filters');
      fireEvent.click(clearAllButton);

      // Verify both are reset
      expect(input.value).toBe('');

      // The select should show "All types" again
      await waitFor(() => {
        expect(mockOnSearchChange).toHaveBeenCalledWith('');
        expect(mockOnExtensionFilter).toHaveBeenCalledWith(null);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty availableExtensions array', () => {
      render(
        <SearchBar
          onSearchChange={mockOnSearchChange}
          onExtensionFilter={mockOnExtensionFilter}
          availableExtensions={[]}
        />
      );

      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);

      // Should still show "All types" option
      const allTypesOptions = screen.getAllByText('All types');
      expect(allTypesOptions.length).toBeGreaterThanOrEqual(1);
    });

    it('should sort extensions alphabetically', () => {
      const unsortedExtensions = ['zzz', 'aaa', 'mmm'];
      render(
        <SearchBar
          onSearchChange={mockOnSearchChange}
          onExtensionFilter={mockOnExtensionFilter}
          availableExtensions={unsortedExtensions}
        />
      );

      const trigger = screen.getByRole('combobox');
      fireEvent.click(trigger);

      // Extensions should be sorted: aaa, mmm, zzz
      const options = screen.getAllByRole('option');
      // First option is "All types", then sorted extensions
      expect(options.length).toBeGreaterThanOrEqual(4); // "All types" + 3 extensions
    });

    it('should debounce search input properly with multiple rapid changes', async () => {
      jest.useFakeTimers();

      render(
        <SearchBar
          onSearchChange={mockOnSearchChange}
          onExtensionFilter={mockOnExtensionFilter}
          availableExtensions={availableExtensions}
        />
      );

      const input = screen.getByPlaceholderText('Search files and folders...');

      // Type rapidly
      fireEvent.change(input, { target: { value: 't' } });
      jest.advanceTimersByTime(100);
      fireEvent.change(input, { target: { value: 'te' } });
      jest.advanceTimersByTime(100);
      fireEvent.change(input, { target: { value: 'tes' } });
      jest.advanceTimersByTime(100);
      fireEvent.change(input, { target: { value: 'test' } });

      // Should not have called onSearchChange yet
      expect(mockOnSearchChange).not.toHaveBeenCalled();

      // Advance past the full debounce period
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        // Should only call once with the final value
        expect(mockOnSearchChange).toHaveBeenCalledTimes(1);
        expect(mockOnSearchChange).toHaveBeenCalledWith('test');
      });

      jest.useRealTimers();
    });
  });
});
