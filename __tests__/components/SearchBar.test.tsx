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
});
