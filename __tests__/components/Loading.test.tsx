import React from 'react';
import { render, screen } from '@testing-library/react';
import Loading from '@/components/Loading';

describe('Loading Component', () => {
  it('should render with default message', () => {
    render(<Loading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    render(<Loading message="Scanning directory..." />);
    expect(screen.getByText('Scanning directory...')).toBeInTheDocument();
  });

  it('should render loading spinner', () => {
    const { container } = render(<Loading />);
    // Check for the Loader2 icon from lucide-react
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
