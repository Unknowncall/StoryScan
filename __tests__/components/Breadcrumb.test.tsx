import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Breadcrumb from '@/components/Breadcrumb';
import { toast } from 'sonner';
import * as utils from '@/lib/utils';

// Mock the utils module
jest.mock('@/lib/utils', () => ({
  ...jest.requireActual('@/lib/utils'),
  copyToClipboard: jest.fn(),
  formatPath: jest.fn((path: string, format: string) => {
    if (format === 'unix') return path;
    if (format === 'windows') return path.replace(/\//g, '\\');
    if (format === 'unraid') return `/mnt/user${path}`;
    return path;
  }),
}));

describe('Breadcrumb Component', () => {
  const mockOnNavigate = jest.fn();
  const mockCopyToClipboard = utils.copyToClipboard as jest.MockedFunction<
    typeof utils.copyToClipboard
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render root button', () => {
    render(<Breadcrumb path={[]} fullPath="/root" onNavigate={mockOnNavigate} />);
    expect(screen.getByText('Root')).toBeInTheDocument();
  });

  it('should render path segments', () => {
    render(
      <Breadcrumb
        path={['folder1', 'folder2']}
        fullPath="/root/folder1/folder2"
        onNavigate={mockOnNavigate}
      />
    );

    expect(screen.getByText('Root')).toBeInTheDocument();
    expect(screen.getByText('folder1')).toBeInTheDocument();
    expect(screen.getByText('folder2')).toBeInTheDocument();
  });

  it('should call onNavigate when root is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    render(<Breadcrumb path={['folder1']} fullPath="/root/folder1" onNavigate={mockOnNavigate} />);

    await user.click(screen.getByText('Root'));
    expect(mockOnNavigate).toHaveBeenCalledWith(0);
  });

  it('should call onNavigate with correct index when segment is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <Breadcrumb
        path={['folder1', 'folder2']}
        fullPath="/root/folder1/folder2"
        onNavigate={mockOnNavigate}
      />
    );

    await user.click(screen.getByText('folder1'));
    expect(mockOnNavigate).toHaveBeenCalledWith(1);
  });

  it('should show chevron separators', () => {
    const { container } = render(
      <Breadcrumb
        path={['folder1', 'folder2']}
        fullPath="/root/folder1/folder2"
        onNavigate={mockOnNavigate}
      />
    );

    const chevrons = container.querySelectorAll('svg');
    // Should have at least 2 chevrons (one after Root, one after folder1) + Home icon
    expect(chevrons.length).toBeGreaterThanOrEqual(2);
  });

  describe('Copy Path Functionality', () => {
    it('should render copy path button', () => {
      render(
        <Breadcrumb path={['folder1']} fullPath="/root/folder1" onNavigate={mockOnNavigate} />
      );
      expect(screen.getByText('Copy Path')).toBeInTheDocument();
    });

    it('should show copy dropdown menu when copy button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <Breadcrumb path={['folder1']} fullPath="/root/folder1" onNavigate={mockOnNavigate} />
      );

      const copyButton = screen.getByText('Copy Path');
      await user.click(copyButton);

      expect(screen.getByText('Copy as...')).toBeInTheDocument();
      expect(screen.getByText('Unix Format')).toBeInTheDocument();
      expect(screen.getByText('Windows (SMB)')).toBeInTheDocument();
      expect(screen.getByText('Unraid Format')).toBeInTheDocument();
    });

    it('should copy path in Unix format when Unix format is selected', async () => {
      const user = userEvent.setup({ delay: null });
      mockCopyToClipboard.mockResolvedValue(true);

      render(
        <Breadcrumb path={['folder1']} fullPath="/root/folder1" onNavigate={mockOnNavigate} />
      );

      const copyButton = screen.getByText('Copy Path');
      await user.click(copyButton);

      const unixOption = screen.getByText('Unix Format');
      await user.click(unixOption);

      await waitFor(() => {
        expect(mockCopyToClipboard).toHaveBeenCalledWith('/root/folder1');
        expect(toast.success).toHaveBeenCalledWith('Path copied!', {
          description: '/root/folder1 (Format: UNIX)',
        });
      });
    });

    it('should copy path in Windows format when Windows format is selected', async () => {
      const user = userEvent.setup({ delay: null });
      mockCopyToClipboard.mockResolvedValue(true);

      render(
        <Breadcrumb
          path={['folder1', 'folder2']}
          fullPath="/root/folder1/folder2"
          onNavigate={mockOnNavigate}
        />
      );

      const copyButton = screen.getByText('Copy Path');
      await user.click(copyButton);

      const windowsOption = screen.getByText('Windows (SMB)');
      await user.click(windowsOption);

      await waitFor(() => {
        expect(mockCopyToClipboard).toHaveBeenCalledWith('\\root\\folder1\\folder2');
        expect(toast.success).toHaveBeenCalledWith('Path copied!', {
          description: '\\root\\folder1\\folder2 (Format: WINDOWS)',
        });
      });
    });

    it('should copy path in Unraid format when Unraid format is selected', async () => {
      const user = userEvent.setup({ delay: null });
      mockCopyToClipboard.mockResolvedValue(true);

      render(
        <Breadcrumb
          path={['media', 'videos']}
          fullPath="/root/media/videos"
          onNavigate={mockOnNavigate}
        />
      );

      const copyButton = screen.getByText('Copy Path');
      await user.click(copyButton);

      const unraidOption = screen.getByText('Unraid Format');
      await user.click(unraidOption);

      await waitFor(() => {
        expect(mockCopyToClipboard).toHaveBeenCalledWith('/mnt/user/root/media/videos');
        expect(toast.success).toHaveBeenCalledWith('Path copied!', {
          description: '/mnt/user/root/media/videos (Format: UNRAID)',
        });
      });
    });

    it('should show check icon after successful copy', async () => {
      const user = userEvent.setup({ delay: null });
      mockCopyToClipboard.mockResolvedValue(true);

      const { container } = render(
        <Breadcrumb path={['folder1']} fullPath="/root/folder1" onNavigate={mockOnNavigate} />
      );

      // Initially should show Copy icon
      const copyButton = screen.getByText('Copy Path');
      await user.click(copyButton);

      const unixOption = screen.getByText('Unix Format');
      await user.click(unixOption);

      // After copy, should show Check icon
      await waitFor(() => {
        const checkIcon = container.querySelector('svg.text-green-500');
        expect(checkIcon).toBeInTheDocument();
      });
    });

    it('should reset check icon after 2 seconds', async () => {
      const user = userEvent.setup({ delay: null });
      mockCopyToClipboard.mockResolvedValue(true);

      const { container } = render(
        <Breadcrumb path={['folder1']} fullPath="/root/folder1" onNavigate={mockOnNavigate} />
      );

      const copyButton = screen.getByText('Copy Path');
      await user.click(copyButton);

      const unixOption = screen.getByText('Unix Format');
      await user.click(unixOption);

      // Check icon should appear
      await waitFor(() => {
        const checkIcon = container.querySelector('svg.text-green-500');
        expect(checkIcon).toBeInTheDocument();
      });

      // Fast-forward 2 seconds
      jest.advanceTimersByTime(2000);

      // Check icon should be gone (back to Copy icon)
      await waitFor(() => {
        const checkIcon = container.querySelector('svg.text-green-500');
        expect(checkIcon).not.toBeInTheDocument();
      });
    });

    it('should show error toast when copy fails', async () => {
      const user = userEvent.setup({ delay: null });
      mockCopyToClipboard.mockResolvedValue(false);

      render(
        <Breadcrumb path={['folder1']} fullPath="/root/folder1" onNavigate={mockOnNavigate} />
      );

      const copyButton = screen.getByText('Copy Path');
      await user.click(copyButton);

      const unixOption = screen.getByText('Unix Format');
      await user.click(unixOption);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Copy failed', {
          description: 'Could not copy path to clipboard',
        });
      });
    });

    it('should not show check icon when copy fails', async () => {
      const user = userEvent.setup({ delay: null });
      mockCopyToClipboard.mockResolvedValue(false);

      const { container } = render(
        <Breadcrumb path={['folder1']} fullPath="/root/folder1" onNavigate={mockOnNavigate} />
      );

      const copyButton = screen.getByText('Copy Path');
      await user.click(copyButton);

      const unixOption = screen.getByText('Unix Format');
      await user.click(unixOption);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      // Check icon should NOT appear
      const checkIcon = container.querySelector('svg.text-green-500');
      expect(checkIcon).not.toBeInTheDocument();
    });

    it('should format path correctly for each format type', async () => {
      const user = userEvent.setup({ delay: null });
      mockCopyToClipboard.mockResolvedValue(true);

      const { rerender } = render(
        <Breadcrumb
          path={['media', 'movies']}
          fullPath="/data/media/movies"
          onNavigate={mockOnNavigate}
        />
      );

      // Test Unix format
      const copyButton = screen.getByText('Copy Path');
      await user.click(copyButton);
      await user.click(screen.getByText('Unix Format'));

      await waitFor(() => {
        expect(utils.formatPath).toHaveBeenCalledWith('/data/media/movies', 'unix');
      });

      // Reset and test Windows format
      rerender(
        <Breadcrumb
          path={['media', 'movies']}
          fullPath="/data/media/movies"
          onNavigate={mockOnNavigate}
        />
      );

      await user.click(screen.getByText('Copy Path'));
      await user.click(screen.getByText('Windows (SMB)'));

      await waitFor(() => {
        expect(utils.formatPath).toHaveBeenCalledWith('/data/media/movies', 'windows');
      });

      // Reset and test Unraid format
      rerender(
        <Breadcrumb
          path={['media', 'movies']}
          fullPath="/data/media/movies"
          onNavigate={mockOnNavigate}
        />
      );

      await user.click(screen.getByText('Copy Path'));
      await user.click(screen.getByText('Unraid Format'));

      await waitFor(() => {
        expect(utils.formatPath).toHaveBeenCalledWith('/data/media/movies', 'unraid');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty path array', () => {
      render(<Breadcrumb path={[]} fullPath="/root" onNavigate={mockOnNavigate} />);
      expect(screen.getByText('Root')).toBeInTheDocument();
      expect(screen.queryByText('folder1')).not.toBeInTheDocument();
    });

    it('should handle deeply nested paths', () => {
      const deepPath = ['level1', 'level2', 'level3', 'level4', 'level5'];
      render(
        <Breadcrumb
          path={deepPath}
          fullPath="/root/level1/level2/level3/level4/level5"
          onNavigate={mockOnNavigate}
        />
      );

      deepPath.forEach((segment) => {
        expect(screen.getByText(segment)).toBeInTheDocument();
      });
    });

    it('should handle paths with special characters', () => {
      const specialPath = ['folder with spaces', 'folder-with-dashes', 'folder_with_underscores'];
      render(
        <Breadcrumb
          path={specialPath}
          fullPath="/root/folder with spaces/folder-with-dashes/folder_with_underscores"
          onNavigate={mockOnNavigate}
        />
      );

      specialPath.forEach((segment) => {
        expect(screen.getByText(segment)).toBeInTheDocument();
      });
    });

    it('should call onNavigate with correct index for nested paths', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <Breadcrumb
          path={['folder1', 'folder2', 'folder3']}
          fullPath="/root/folder1/folder2/folder3"
          onNavigate={mockOnNavigate}
        />
      );

      await user.click(screen.getByText('folder2'));
      expect(mockOnNavigate).toHaveBeenCalledWith(2);

      await user.click(screen.getByText('folder3'));
      expect(mockOnNavigate).toHaveBeenCalledWith(3);
    });
  });
});
