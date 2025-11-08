import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ShareButton from '@/components/ShareButton';
import userEvent from '@testing-library/user-event';

// Mock the useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock copyToClipboard
jest.mock('@/lib/utils', () => ({
  ...jest.requireActual('@/lib/utils'),
  copyToClipboard: jest.fn().mockResolvedValue(true),
}));

describe('ShareButton', () => {
  const mockGetShareableUrl = jest.fn(() => 'http://localhost:3000?dir=0&view=treemap');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders share button', () => {
    render(<ShareButton getShareableUrl={mockGetShareableUrl} />);
    expect(screen.getByTitle('Share current view')).toBeDefined();
    expect(screen.getByText('Share')).toBeDefined();
  });

  it('opens modal when clicked', () => {
    render(<ShareButton getShareableUrl={mockGetShareableUrl} />);

    const shareButton = screen.getByTitle('Share current view');
    fireEvent.click(shareButton);

    expect(screen.getByText('Share This View')).toBeDefined();
  });

  it('displays shareable URL in modal', () => {
    render(<ShareButton getShareableUrl={mockGetShareableUrl} />);

    const shareButton = screen.getByTitle('Share current view');
    fireEvent.click(shareButton);

    const urlInput = screen.getByDisplayValue('http://localhost:3000?dir=0&view=treemap');
    expect(urlInput).toBeDefined();
  });

  it('displays QR code', () => {
    render(<ShareButton getShareableUrl={mockGetShareableUrl} />);

    const shareButton = screen.getByTitle('Share current view');
    fireEvent.click(shareButton);

    expect(screen.getByText('QR Code')).toBeDefined();
    expect(screen.getByText('Scan with your phone to open this view on mobile')).toBeDefined();
  });

  it('copies URL to clipboard', async () => {
    const { copyToClipboard } = require('@/lib/utils');

    render(<ShareButton getShareableUrl={mockGetShareableUrl} />);

    const shareButton = screen.getByTitle('Share current view');
    fireEvent.click(shareButton);

    const copyButton = screen.getByText('Copy');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(copyToClipboard).toHaveBeenCalledWith('http://localhost:3000?dir=0&view=treemap');
    });
  });

  it('shows copied state after copying', async () => {
    render(<ShareButton getShareableUrl={mockGetShareableUrl} />);

    const shareButton = screen.getByTitle('Share current view');
    fireEvent.click(shareButton);

    const copyButton = screen.getByText('Copy');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText('Copied')).toBeDefined();
    });
  });

  it('closes modal when close button clicked', async () => {
    render(<ShareButton getShareableUrl={mockGetShareableUrl} />);

    const shareButton = screen.getByTitle('Share current view');
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText('Share This View')).toBeDefined();
    });

    // Find close button by role (Radix Dialog uses button with role)
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Share This View')).toBeNull();
    });
  });

  it('closes modal when Escape key pressed', async () => {
    const user = userEvent.setup();
    render(<ShareButton getShareableUrl={mockGetShareableUrl} />);

    const shareButton = screen.getByTitle('Share current view');
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText('Share This View')).toBeDefined();
    });

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByText('Share This View')).toBeNull();
    });
  });

  it('selects URL text when input is clicked', () => {
    render(<ShareButton getShareableUrl={mockGetShareableUrl} />);

    const shareButton = screen.getByTitle('Share current view');
    fireEvent.click(shareButton);

    const urlInput = screen.getByDisplayValue(
      'http://localhost:3000?dir=0&view=treemap'
    ) as HTMLInputElement;
    const selectSpy = jest.spyOn(urlInput, 'select');

    fireEvent.click(urlInput);

    expect(selectSpy).toHaveBeenCalled();
  });
});
