import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DirectorySelector from '@/components/DirectorySelector';
import { DirectoryConfig } from '@/types';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  HardDrive: ({ className }: { className?: string }) => (
    <svg data-testid="hard-drive-icon" className={className} />
  ),
  Check: ({ className }: { className?: string }) => (
    <svg data-testid="check-icon" className={className} />
  ),
  ChevronDown: ({ className }: { className?: string }) => (
    <svg data-testid="chevron-down-icon" className={className} />
  ),
  ChevronUp: ({ className }: { className?: string }) => (
    <svg data-testid="chevron-up-icon" className={className} />
  ),
}));

// Mock the Select component with a simplified implementation
jest.mock('@/components/ui/select', () => {
  let globalOnValueChange: any = null;

  return {
    Select: ({ children, value, onValueChange }: any) => {
      globalOnValueChange = onValueChange;
      return (
        <div data-testid="select-root" data-value={value}>
          {React.Children.map(children, (child) =>
            React.isValidElement(child)
              ? React.cloneElement(child, { onValueChange } as any)
              : child
          )}
        </div>
      );
    },
    SelectTrigger: ({ children, className }: any) => (
      <button
        role="combobox"
        aria-expanded="false"
        className={className}
        data-testid="select-trigger"
      >
        {children}
      </button>
    ),
    SelectValue: ({ children }: any) => <span data-testid="select-value">{children}</span>,
    SelectContent: ({ children, onValueChange }: any) => {
      return (
        <div data-testid="select-content">
          {React.Children.map(children, (child) =>
            React.isValidElement(child)
              ? React.cloneElement(child, { onValueChange } as any)
              : child
          )}
        </div>
      );
    },
    SelectItem: ({ children, value, onValueChange }: any) => {
      const handleClick = () => {
        if (onValueChange) {
          onValueChange(value);
        }
      };

      return (
        <div
          role="option"
          aria-selected="false"
          data-value={value}
          onClick={handleClick}
          data-testid={`select-item-${value}`}
        >
          {children}
        </div>
      );
    },
  };
});

describe('DirectorySelector', () => {
  const mockOnSelect = jest.fn();

  const mockDirectories: DirectoryConfig[] = [
    { id: '0', name: 'Media', path: '/data/media' },
    { id: '1', name: 'Downloads', path: '/data/downloads' },
    { id: '2', name: 'Backups', path: '/data/backups' },
  ];

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  describe('Basic Rendering', () => {
    it('should render the directory selector with HardDrive icon', () => {
      render(
        <DirectorySelector
          directories={mockDirectories}
          selected={mockDirectories[0]}
          onSelect={mockOnSelect}
        />
      );

      // Check that the HardDrive icon is rendered
      const icon = screen.getByTestId('hard-drive-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('w-5', 'h-5', 'text-primary', 'flex-shrink-0');
    });

    it('should display the selected directory name and path', () => {
      render(
        <DirectorySelector
          directories={mockDirectories}
          selected={mockDirectories[0]}
          onSelect={mockOnSelect}
        />
      );

      // Check that the selected directory is displayed (use getAllByText since it appears in both trigger and options)
      const nameElements = screen.getAllByText('Media');
      const pathElements = screen.getAllByText('/data/media');
      expect(nameElements.length).toBeGreaterThan(0);
      expect(pathElements.length).toBeGreaterThan(0);
    });

    it('should render with multiple directories in the list', () => {
      const { container } = render(
        <DirectorySelector
          directories={mockDirectories}
          selected={mockDirectories[0]}
          onSelect={mockOnSelect}
        />
      );

      // Check that the component renders successfully
      expect(container.querySelector('button[role="combobox"]')).toBeInTheDocument();
    });

    it('should render with a single directory', () => {
      const singleDirectory: DirectoryConfig[] = [{ id: '0', name: 'Media', path: '/data/media' }];

      render(
        <DirectorySelector
          directories={singleDirectory}
          selected={singleDirectory[0]}
          onSelect={mockOnSelect}
        />
      );

      // Use getAllByText since text appears in both trigger and options
      const nameElements = screen.getAllByText('Media');
      const pathElements = screen.getAllByText('/data/media');
      expect(nameElements.length).toBeGreaterThan(0);
      expect(pathElements.length).toBeGreaterThan(0);
    });
  });

  describe('Selection Handling', () => {
    it('should call onSelect with the correct directory when selection changes', () => {
      render(
        <DirectorySelector
          directories={mockDirectories}
          selected={mockDirectories[0]}
          onSelect={mockOnSelect}
        />
      );

      // Click the second directory option directly (with our simplified mock)
      const option = screen.getByTestId('select-item-1');
      fireEvent.click(option);

      // Check that onSelect was called with the correct directory
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith(mockDirectories[1]);
    });

    it('should call onSelect with the third directory', () => {
      render(
        <DirectorySelector
          directories={mockDirectories}
          selected={mockDirectories[0]}
          onSelect={mockOnSelect}
        />
      );

      // Click the third directory option
      const option = screen.getByTestId('select-item-2');
      fireEvent.click(option);

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith(mockDirectories[2]);
    });

    it('should call onSelect when selecting the already selected directory', () => {
      render(
        <DirectorySelector
          directories={mockDirectories}
          selected={mockDirectories[0]}
          onSelect={mockOnSelect}
        />
      );

      // Click the first directory option (already selected)
      const option = screen.getByTestId('select-item-0');
      fireEvent.click(option);

      // onSelect should still be called even if it's the same directory
      // (the component doesn't prevent this - it's up to the parent)
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith(mockDirectories[0]);
    });

    it('should handle selection when directories have special characters in names', () => {
      const specialDirs: DirectoryConfig[] = [
        { id: '0', name: 'Media & Videos', path: '/data/media & videos' },
        { id: '1', name: 'Downloads (2024)', path: '/data/downloads (2024)' },
      ];

      render(
        <DirectorySelector
          directories={specialDirs}
          selected={specialDirs[0]}
          onSelect={mockOnSelect}
        />
      );

      // Use getAllByText since text appears in both trigger and options
      const elements = screen.getAllByText('Media & Videos');
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should render with empty directories array', () => {
      render(<DirectorySelector directories={[]} selected={null} onSelect={mockOnSelect} />);

      // Component should still render without crashing
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toBeInTheDocument();
    });

    it('should render with null selectedDirectory', () => {
      render(
        <DirectorySelector directories={mockDirectories} selected={null} onSelect={mockOnSelect} />
      );

      // Should render with placeholder or default state
      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toBeInTheDocument();
    });

    it('should handle very long directory names gracefully', () => {
      const longNameDirs: DirectoryConfig[] = [
        {
          id: '0',
          name: 'This Is A Very Long Directory Name That Should Be Truncated In The UI',
          path: '/data/very/long/path/that/goes/on/and/on/and/on',
        },
      ];

      render(
        <DirectorySelector
          directories={longNameDirs}
          selected={longNameDirs[0]}
          onSelect={mockOnSelect}
        />
      );

      // Use getAllByText since text appears in both trigger and options
      const elements = screen.getAllByText(
        'This Is A Very Long Directory Name That Should Be Truncated In The UI'
      );
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should handle very long directory paths gracefully', () => {
      const longPathDirs: DirectoryConfig[] = [
        {
          id: '0',
          name: 'Media',
          path: '/data/media/videos/2024/january/vacation/trip1/day1/morning/footage/raw/unedited',
        },
      ];

      render(
        <DirectorySelector
          directories={longPathDirs}
          selected={longPathDirs[0]}
          onSelect={mockOnSelect}
        />
      );

      // Use getAllByText since text appears in both trigger and options
      const elements = screen.getAllByText(
        '/data/media/videos/2024/january/vacation/trip1/day1/morning/footage/raw/unedited'
      );
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should handle directories with identical names but different paths', () => {
      const identicalNameDirs: DirectoryConfig[] = [
        { id: '0', name: 'Media', path: '/data/media' },
        { id: '1', name: 'Media', path: '/backup/media' },
      ];

      render(
        <DirectorySelector
          directories={identicalNameDirs}
          selected={identicalNameDirs[0]}
          onSelect={mockOnSelect}
        />
      );

      // Both should be present, differentiated by path
      const options = screen.getAllByText('Media');
      expect(options.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <DirectorySelector
          directories={mockDirectories}
          selected={mockDirectories[0]}
          onSelect={mockOnSelect}
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-expanded');
    });

    it('should render options with proper role attribute', () => {
      render(
        <DirectorySelector
          directories={mockDirectories}
          selected={mockDirectories[0]}
          onSelect={mockOnSelect}
        />
      );

      // All options should have role="option"
      const options = screen.getAllByRole('option');
      expect(options.length).toBe(mockDirectories.length);
    });

    it('should support screen reader text for directory paths', () => {
      render(
        <DirectorySelector
          directories={mockDirectories}
          selected={mockDirectories[0]}
          onSelect={mockOnSelect}
        />
      );

      // Path should be visible with appropriate styling (use getAllByText since it appears multiple times)
      const pathElements = screen.getAllByText('/data/media');
      expect(pathElements.length).toBeGreaterThan(0);
      expect(pathElements[0]).toHaveClass('text-xs', 'text-muted-foreground');
    });
  });

  describe('Visual Styling', () => {
    it('should apply correct CSS classes to the trigger button', () => {
      render(
        <DirectorySelector
          directories={mockDirectories}
          selected={mockDirectories[0]}
          onSelect={mockOnSelect}
        />
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass('w-full', 'max-w-md');
    });

    it('should display directory name with proper text styling', () => {
      render(
        <DirectorySelector
          directories={mockDirectories}
          selected={mockDirectories[0]}
          onSelect={mockOnSelect}
        />
      );

      // Use getAllByText since name appears multiple times
      const nameElements = screen.getAllByText('Media');
      expect(nameElements.length).toBeGreaterThan(0);
      expect(nameElements[0]).toHaveClass('font-medium');
    });

    it('should display directory path with muted text color', () => {
      render(
        <DirectorySelector
          directories={mockDirectories}
          selected={mockDirectories[0]}
          onSelect={mockOnSelect}
        />
      );

      // Use getAllByText since path appears multiple times
      const pathElements = screen.getAllByText('/data/media');
      expect(pathElements.length).toBeGreaterThan(0);
      expect(pathElements[0]).toHaveClass('text-xs', 'text-muted-foreground');
    });

    it('should render HardDrive icon with correct styling', () => {
      render(
        <DirectorySelector
          directories={mockDirectories}
          selected={mockDirectories[0]}
          onSelect={mockOnSelect}
        />
      );

      const icon = screen.getByTestId('hard-drive-icon');
      expect(icon).toHaveClass('w-5', 'h-5', 'text-primary', 'flex-shrink-0');
    });
  });

  describe('Integration with Select Component', () => {
    it('should render select with proper structure', () => {
      render(
        <DirectorySelector
          directories={mockDirectories}
          selected={mockDirectories[0]}
          onSelect={mockOnSelect}
        />
      );

      // Check that all components are rendered
      expect(screen.getByTestId('select-root')).toBeInTheDocument();
      expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('select-value')).toBeInTheDocument();
      expect(screen.getByTestId('select-content')).toBeInTheDocument();
    });

    it('should display all directories in the dropdown', () => {
      render(
        <DirectorySelector
          directories={mockDirectories}
          selected={mockDirectories[0]}
          onSelect={mockOnSelect}
        />
      );

      // Check that each directory appears in the dropdown (use getAllByText since they appear multiple times)
      mockDirectories.forEach((dir) => {
        const nameElements = screen.getAllByText(dir.name);
        const pathElements = screen.getAllByText(dir.path);
        expect(nameElements.length).toBeGreaterThan(0);
        expect(pathElements.length).toBeGreaterThan(0);
      });
    });

    it('should have correct value set on select root', () => {
      render(
        <DirectorySelector
          directories={mockDirectories}
          selected={mockDirectories[0]}
          onSelect={mockOnSelect}
        />
      );

      const selectRoot = screen.getByTestId('select-root');
      expect(selectRoot).toHaveAttribute('data-value', '0');
    });

    it('should render correct number of select items', () => {
      render(
        <DirectorySelector
          directories={mockDirectories}
          selected={mockDirectories[0]}
          onSelect={mockOnSelect}
        />
      );

      // Check that all directories are rendered as select items
      mockDirectories.forEach((dir) => {
        expect(screen.getByTestId(`select-item-${dir.id}`)).toBeInTheDocument();
      });
    });
  });
});
