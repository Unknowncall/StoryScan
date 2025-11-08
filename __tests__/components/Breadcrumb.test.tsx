import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Breadcrumb from '@/components/Breadcrumb';

describe('Breadcrumb Component', () => {
  const mockOnNavigate = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render root button', () => {
    render(<Breadcrumb path={[]} onNavigate={mockOnNavigate} />);
    expect(screen.getByText('Root')).toBeInTheDocument();
  });

  it('should render path segments', () => {
    render(<Breadcrumb path={['folder1', 'folder2']} onNavigate={mockOnNavigate} />);

    expect(screen.getByText('Root')).toBeInTheDocument();
    expect(screen.getByText('folder1')).toBeInTheDocument();
    expect(screen.getByText('folder2')).toBeInTheDocument();
  });

  it('should call onNavigate when root is clicked', async () => {
    const user = userEvent.setup();
    render(<Breadcrumb path={['folder1']} onNavigate={mockOnNavigate} />);

    await user.click(screen.getByText('Root'));
    expect(mockOnNavigate).toHaveBeenCalledWith(0);
  });

  it('should call onNavigate with correct index when segment is clicked', async () => {
    const user = userEvent.setup();
    render(<Breadcrumb path={['folder1', 'folder2']} onNavigate={mockOnNavigate} />);

    await user.click(screen.getByText('folder1'));
    expect(mockOnNavigate).toHaveBeenCalledWith(1);
  });

  it('should show chevron separators', () => {
    const { container } = render(
      <Breadcrumb path={['folder1', 'folder2']} onNavigate={mockOnNavigate} />
    );

    const chevrons = container.querySelectorAll('svg');
    // Should have at least 2 chevrons (one after Root, one after folder1) + Home icon
    expect(chevrons.length).toBeGreaterThanOrEqual(2);
  });
});
