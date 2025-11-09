import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FileTypeBreakdown from '@/components/FileTypeBreakdown';
import { FileNode } from '@/types';
import * as d3 from 'd3';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('FileTypeBreakdown', () => {
  const mockData: FileNode = {
    name: 'root',
    path: '/root',
    size: 2000000,
    type: 'directory',
    modifiedTime: Date.now(),
    children: [
      {
        name: 'video.mp4',
        path: '/root/video.mp4',
        size: 1000000,
        type: 'file',
        extension: 'mp4',
        modifiedTime: Date.now(),
      },
      {
        name: 'image.jpg',
        path: '/root/image.jpg',
        size: 500000,
        type: 'file',
        extension: 'jpg',
        modifiedTime: Date.now(),
      },
      {
        name: 'document.pdf',
        path: '/root/document.pdf',
        size: 300000,
        type: 'file',
        extension: 'pdf',
        modifiedTime: Date.now(),
      },
      {
        name: 'audio.mp3',
        path: '/root/audio.mp3',
        size: 200000,
        type: 'file',
        extension: 'mp3',
        modifiedTime: Date.now(),
      },
    ],
  };

  it('renders the file type breakdown title', () => {
    render(<FileTypeBreakdown data={mockData} />);
    expect(screen.getByText('File Type Breakdown')).toBeDefined();
  });

  it('displays category names and sizes', () => {
    render(<FileTypeBreakdown data={mockData} />);

    // Should show categories like Videos, Images, Documents, Audio
    expect(screen.getByText('Videos')).toBeDefined();
    expect(screen.getByText('Images')).toBeDefined();
    expect(screen.getByText('Documents')).toBeDefined();
    expect(screen.getByText('Audio')).toBeDefined();
  });

  it('displays file counts for each category', () => {
    render(<FileTypeBreakdown data={mockData} />);

    // Should show "1 files" for each category
    const fileCountElements = screen.getAllByText(/\d+ files?/);
    expect(fileCountElements.length).toBeGreaterThan(0);
  });

  it('displays formatted sizes', () => {
    render(<FileTypeBreakdown data={mockData} />);

    // Should display sizes in KB, MB, or GB format
    const sizeElements = screen.getAllByText(/\d+(\.\d+)?\s*(KB|MB|GB)/);
    expect(sizeElements.length).toBeGreaterThan(0);
  });

  it('displays percentages', () => {
    render(<FileTypeBreakdown data={mockData} />);

    // Should show percentages like "50.0%"
    const percentageElements = screen.getAllByText(/\d+\.\d+%/);
    expect(percentageElements.length).toBeGreaterThan(0);
  });

  it('renders SVG chart', () => {
    const { container } = render(<FileTypeBreakdown data={mockData} />);

    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('shows "No files to analyze" for empty data', () => {
    const emptyData: FileNode = {
      name: 'empty',
      path: '/empty',
      size: 0,
      type: 'directory',
      modifiedTime: Date.now(),
      children: [],
    };

    render(<FileTypeBreakdown data={emptyData} />);
    expect(screen.getByText('No files to analyze')).toBeDefined();
  });

  it('shows "No files to analyze" for directory with only subdirectories', () => {
    const dirOnlyData: FileNode = {
      name: 'folders',
      path: '/folders',
      size: 0,
      type: 'directory',
      modifiedTime: Date.now(),
      children: [
        {
          name: 'subfolder',
          path: '/folders/subfolder',
          size: 0,
          type: 'directory',
          modifiedTime: Date.now(),
          children: [],
        },
      ],
    };

    render(<FileTypeBreakdown data={dirOnlyData} />);
    expect(screen.getByText('No files to analyze')).toBeDefined();
  });

  it('categorizes files correctly', () => {
    const mixedData: FileNode = {
      name: 'mixed',
      path: '/mixed',
      size: 1000,
      type: 'directory',
      modifiedTime: Date.now(),
      children: [
        {
          name: 'code.js',
          path: '/mixed/code.js',
          size: 100,
          type: 'file',
          extension: 'js',
          modifiedTime: Date.now(),
        },
        {
          name: 'archive.zip',
          path: '/mixed/archive.zip',
          size: 200,
          type: 'file',
          extension: 'zip',
          modifiedTime: Date.now(),
        },
        {
          name: 'unknown.xyz',
          path: '/mixed/unknown.xyz',
          size: 50,
          type: 'file',
          extension: 'xyz',
          modifiedTime: Date.now(),
        },
      ],
    };

    render(<FileTypeBreakdown data={mixedData} />);

    expect(screen.getByText('Code')).toBeDefined();
    expect(screen.getByText('Archives')).toBeDefined();
    expect(screen.getByText('Other')).toBeDefined();
  });

  it('handles nested directory structure', () => {
    const nestedData: FileNode = {
      name: 'root',
      path: '/root',
      size: 1000,
      type: 'directory',
      modifiedTime: Date.now(),
      children: [
        {
          name: 'subfolder',
          path: '/root/subfolder',
          size: 1000,
          type: 'directory',
          modifiedTime: Date.now(),
          children: [
            {
              name: 'nested.mp4',
              path: '/root/subfolder/nested.mp4',
              size: 1000,
              type: 'file',
              extension: 'mp4',
              modifiedTime: Date.now(),
            },
          ],
        },
      ],
    };

    render(<FileTypeBreakdown data={nestedData} />);
    expect(screen.getByText('Videos')).toBeDefined();
  });

  describe('D3 Integration', () => {
    it('should call d3.pie to create pie chart', () => {
      const pieSpy = jest.spyOn(d3, 'pie');

      render(<FileTypeBreakdown data={mockData} />);

      expect(pieSpy).toHaveBeenCalled();
    });

    it('should call d3.arc to create arcs', () => {
      const arcSpy = jest.spyOn(d3, 'arc');

      render(<FileTypeBreakdown data={mockData} />);

      expect(arcSpy).toHaveBeenCalled();
    });

    it('should use d3.select to create SVG elements', () => {
      const selectSpy = jest.spyOn(d3, 'select');

      render(<FileTypeBreakdown data={mockData} />);

      expect(selectSpy).toHaveBeenCalled();
    });
  });

  describe('Category Click Handling', () => {
    it('should call onTypeClick when category button is clicked', () => {
      const mockOnTypeClick = jest.fn();

      render(<FileTypeBreakdown data={mockData} onTypeClick={mockOnTypeClick} />);

      const videosButton = screen.getByText('Videos').closest('button');
      if (videosButton) {
        fireEvent.click(videosButton);
        expect(mockOnTypeClick).toHaveBeenCalledWith('Videos');
      }
    });

    it('should call onTypeClick with empty string when clicking selected category', () => {
      const mockOnTypeClick = jest.fn();

      render(
        <FileTypeBreakdown data={mockData} onTypeClick={mockOnTypeClick} selectedType="Videos" />
      );

      const videosButton = screen.getByText('Videos').closest('button');
      if (videosButton) {
        fireEvent.click(videosButton);
        expect(mockOnTypeClick).toHaveBeenCalledWith('');
      }
    });

    it('should not call onTypeClick if handler is not provided', () => {
      const { container } = render(<FileTypeBreakdown data={mockData} />);

      const videosButton = screen.getByText('Videos').closest('button');
      if (videosButton) {
        // Should not throw error when clicking without handler
        expect(() => fireEvent.click(videosButton)).not.toThrow();
      }
    });

    it('should apply selected styling to selected category', () => {
      render(<FileTypeBreakdown data={mockData} selectedType="Videos" />);

      const videosButton = screen.getByText('Videos').closest('button');
      expect(videosButton).toHaveClass('bg-accent');
    });

    it('should reduce opacity of non-selected categories when one is selected', () => {
      render(<FileTypeBreakdown data={mockData} selectedType="Videos" />);

      const imagesButton = screen.getByText('Images').closest('button');
      expect(imagesButton).toHaveClass('opacity-50');
    });
  });

  describe('File Extension Categories', () => {
    it('should categorize all video extensions correctly', () => {
      const videoData: FileNode = {
        name: 'videos',
        path: '/videos',
        size: 8000,
        type: 'directory',
        modifiedTime: Date.now(),
        children: [
          {
            name: 'v1.mp4',
            path: '/v1.mp4',
            size: 1000,
            type: 'file',
            extension: 'mp4',
            modifiedTime: Date.now(),
          },
          {
            name: 'v2.mkv',
            path: '/v2.mkv',
            size: 1000,
            type: 'file',
            extension: 'mkv',
            modifiedTime: Date.now(),
          },
          {
            name: 'v3.avi',
            path: '/v3.avi',
            size: 1000,
            type: 'file',
            extension: 'avi',
            modifiedTime: Date.now(),
          },
          {
            name: 'v4.mov',
            path: '/v4.mov',
            size: 1000,
            type: 'file',
            extension: 'mov',
            modifiedTime: Date.now(),
          },
          {
            name: 'v5.wmv',
            path: '/v5.wmv',
            size: 1000,
            type: 'file',
            extension: 'wmv',
            modifiedTime: Date.now(),
          },
          {
            name: 'v6.flv',
            path: '/v6.flv',
            size: 1000,
            type: 'file',
            extension: 'flv',
            modifiedTime: Date.now(),
          },
          {
            name: 'v7.webm',
            path: '/v7.webm',
            size: 1000,
            type: 'file',
            extension: 'webm',
            modifiedTime: Date.now(),
          },
          {
            name: 'v8.m4v',
            path: '/v8.m4v',
            size: 1000,
            type: 'file',
            extension: 'm4v',
            modifiedTime: Date.now(),
          },
        ],
      };

      render(<FileTypeBreakdown data={videoData} />);
      expect(screen.getByText('Videos')).toBeDefined();
      expect(screen.getByText('8 files')).toBeDefined();
    });

    it('should categorize all image extensions correctly', () => {
      const imageData: FileNode = {
        name: 'images',
        path: '/images',
        size: 8000,
        type: 'directory',
        modifiedTime: Date.now(),
        children: [
          {
            name: 'i1.jpg',
            path: '/i1.jpg',
            size: 1000,
            type: 'file',
            extension: 'jpg',
            modifiedTime: Date.now(),
          },
          {
            name: 'i2.jpeg',
            path: '/i2.jpeg',
            size: 1000,
            type: 'file',
            extension: 'jpeg',
            modifiedTime: Date.now(),
          },
          {
            name: 'i3.png',
            path: '/i3.png',
            size: 1000,
            type: 'file',
            extension: 'png',
            modifiedTime: Date.now(),
          },
          {
            name: 'i4.gif',
            path: '/i4.gif',
            size: 1000,
            type: 'file',
            extension: 'gif',
            modifiedTime: Date.now(),
          },
          {
            name: 'i5.bmp',
            path: '/i5.bmp',
            size: 1000,
            type: 'file',
            extension: 'bmp',
            modifiedTime: Date.now(),
          },
          {
            name: 'i6.svg',
            path: '/i6.svg',
            size: 1000,
            type: 'file',
            extension: 'svg',
            modifiedTime: Date.now(),
          },
          {
            name: 'i7.webp',
            path: '/i7.webp',
            size: 1000,
            type: 'file',
            extension: 'webp',
            modifiedTime: Date.now(),
          },
          {
            name: 'i8.tiff',
            path: '/i8.tiff',
            size: 1000,
            type: 'file',
            extension: 'tiff',
            modifiedTime: Date.now(),
          },
        ],
      };

      render(<FileTypeBreakdown data={imageData} />);
      expect(screen.getByText('Images')).toBeDefined();
      expect(screen.getByText('8 files')).toBeDefined();
    });

    it('should categorize all document extensions correctly', () => {
      const docData: FileNode = {
        name: 'docs',
        path: '/docs',
        size: 7000,
        type: 'directory',
        modifiedTime: Date.now(),
        children: [
          {
            name: 'd1.pdf',
            path: '/d1.pdf',
            size: 1000,
            type: 'file',
            extension: 'pdf',
            modifiedTime: Date.now(),
          },
          {
            name: 'd2.doc',
            path: '/d2.doc',
            size: 1000,
            type: 'file',
            extension: 'doc',
            modifiedTime: Date.now(),
          },
          {
            name: 'd3.docx',
            path: '/d3.docx',
            size: 1000,
            type: 'file',
            extension: 'docx',
            modifiedTime: Date.now(),
          },
          {
            name: 'd4.txt',
            path: '/d4.txt',
            size: 1000,
            type: 'file',
            extension: 'txt',
            modifiedTime: Date.now(),
          },
          {
            name: 'd5.xlsx',
            path: '/d5.xlsx',
            size: 1000,
            type: 'file',
            extension: 'xlsx',
            modifiedTime: Date.now(),
          },
          {
            name: 'd6.pptx',
            path: '/d6.pptx',
            size: 1000,
            type: 'file',
            extension: 'pptx',
            modifiedTime: Date.now(),
          },
          {
            name: 'd7.odt',
            path: '/d7.odt',
            size: 1000,
            type: 'file',
            extension: 'odt',
            modifiedTime: Date.now(),
          },
        ],
      };

      render(<FileTypeBreakdown data={docData} />);
      expect(screen.getByText('Documents')).toBeDefined();
      expect(screen.getByText('7 files')).toBeDefined();
    });

    it('should categorize all audio extensions correctly', () => {
      const audioData: FileNode = {
        name: 'audio',
        path: '/audio',
        size: 7000,
        type: 'directory',
        modifiedTime: Date.now(),
        children: [
          {
            name: 'a1.mp3',
            path: '/a1.mp3',
            size: 1000,
            type: 'file',
            extension: 'mp3',
            modifiedTime: Date.now(),
          },
          {
            name: 'a2.wav',
            path: '/a2.wav',
            size: 1000,
            type: 'file',
            extension: 'wav',
            modifiedTime: Date.now(),
          },
          {
            name: 'a3.flac',
            path: '/a3.flac',
            size: 1000,
            type: 'file',
            extension: 'flac',
            modifiedTime: Date.now(),
          },
          {
            name: 'a4.aac',
            path: '/a4.aac',
            size: 1000,
            type: 'file',
            extension: 'aac',
            modifiedTime: Date.now(),
          },
          {
            name: 'a5.ogg',
            path: '/a5.ogg',
            size: 1000,
            type: 'file',
            extension: 'ogg',
            modifiedTime: Date.now(),
          },
          {
            name: 'a6.m4a',
            path: '/a6.m4a',
            size: 1000,
            type: 'file',
            extension: 'm4a',
            modifiedTime: Date.now(),
          },
          {
            name: 'a7.wma',
            path: '/a7.wma',
            size: 1000,
            type: 'file',
            extension: 'wma',
            modifiedTime: Date.now(),
          },
        ],
      };

      render(<FileTypeBreakdown data={audioData} />);
      expect(screen.getByText('Audio')).toBeDefined();
      expect(screen.getByText('7 files')).toBeDefined();
    });

    it('should categorize all archive extensions correctly', () => {
      const archiveData: FileNode = {
        name: 'archives',
        path: '/archives',
        size: 7000,
        type: 'directory',
        modifiedTime: Date.now(),
        children: [
          {
            name: 'a1.zip',
            path: '/a1.zip',
            size: 1000,
            type: 'file',
            extension: 'zip',
            modifiedTime: Date.now(),
          },
          {
            name: 'a2.rar',
            path: '/a2.rar',
            size: 1000,
            type: 'file',
            extension: 'rar',
            modifiedTime: Date.now(),
          },
          {
            name: 'a3.7z',
            path: '/a3.7z',
            size: 1000,
            type: 'file',
            extension: '7z',
            modifiedTime: Date.now(),
          },
          {
            name: 'a4.tar',
            path: '/a4.tar',
            size: 1000,
            type: 'file',
            extension: 'tar',
            modifiedTime: Date.now(),
          },
          {
            name: 'a5.gz',
            path: '/a5.gz',
            size: 1000,
            type: 'file',
            extension: 'gz',
            modifiedTime: Date.now(),
          },
          {
            name: 'a6.bz2',
            path: '/a6.bz2',
            size: 1000,
            type: 'file',
            extension: 'bz2',
            modifiedTime: Date.now(),
          },
          {
            name: 'a7.iso',
            path: '/a7.iso',
            size: 1000,
            type: 'file',
            extension: 'iso',
            modifiedTime: Date.now(),
          },
        ],
      };

      render(<FileTypeBreakdown data={archiveData} />);
      expect(screen.getByText('Archives')).toBeDefined();
      expect(screen.getByText('7 files')).toBeDefined();
    });

    it('should categorize all code extensions correctly', () => {
      const codeData: FileNode = {
        name: 'code',
        path: '/code',
        size: 13000,
        type: 'directory',
        modifiedTime: Date.now(),
        children: [
          {
            name: 'c1.js',
            path: '/c1.js',
            size: 1000,
            type: 'file',
            extension: 'js',
            modifiedTime: Date.now(),
          },
          {
            name: 'c2.ts',
            path: '/c2.ts',
            size: 1000,
            type: 'file',
            extension: 'ts',
            modifiedTime: Date.now(),
          },
          {
            name: 'c3.tsx',
            path: '/c3.tsx',
            size: 1000,
            type: 'file',
            extension: 'tsx',
            modifiedTime: Date.now(),
          },
          {
            name: 'c4.py',
            path: '/c4.py',
            size: 1000,
            type: 'file',
            extension: 'py',
            modifiedTime: Date.now(),
          },
          {
            name: 'c5.java',
            path: '/c5.java',
            size: 1000,
            type: 'file',
            extension: 'java',
            modifiedTime: Date.now(),
          },
          {
            name: 'c6.cpp',
            path: '/c6.cpp',
            size: 1000,
            type: 'file',
            extension: 'cpp',
            modifiedTime: Date.now(),
          },
          {
            name: 'c7.c',
            path: '/c7.c',
            size: 1000,
            type: 'file',
            extension: 'c',
            modifiedTime: Date.now(),
          },
          {
            name: 'c8.h',
            path: '/c8.h',
            size: 1000,
            type: 'file',
            extension: 'h',
            modifiedTime: Date.now(),
          },
          {
            name: 'c9.css',
            path: '/c9.css',
            size: 1000,
            type: 'file',
            extension: 'css',
            modifiedTime: Date.now(),
          },
          {
            name: 'c10.html',
            path: '/c10.html',
            size: 1000,
            type: 'file',
            extension: 'html',
            modifiedTime: Date.now(),
          },
          {
            name: 'c11.jsx',
            path: '/c11.jsx',
            size: 1000,
            type: 'file',
            extension: 'jsx',
            modifiedTime: Date.now(),
          },
          {
            name: 'c12.json',
            path: '/c12.json',
            size: 1000,
            type: 'file',
            extension: 'json',
            modifiedTime: Date.now(),
          },
          {
            name: 'c13.xml',
            path: '/c13.xml',
            size: 1000,
            type: 'file',
            extension: 'xml',
            modifiedTime: Date.now(),
          },
        ],
      };

      render(<FileTypeBreakdown data={codeData} />);
      expect(screen.getByText('Code')).toBeDefined();
      expect(screen.getByText('13 files')).toBeDefined();
    });

    it('should handle case-insensitive extensions', () => {
      const mixedCaseData: FileNode = {
        name: 'mixed',
        path: '/mixed',
        size: 3000,
        type: 'directory',
        modifiedTime: Date.now(),
        children: [
          {
            name: 'v1.MP4',
            path: '/v1.MP4',
            size: 1000,
            type: 'file',
            extension: 'MP4',
            modifiedTime: Date.now(),
          },
          {
            name: 'v2.MkV',
            path: '/v2.MkV',
            size: 1000,
            type: 'file',
            extension: 'MkV',
            modifiedTime: Date.now(),
          },
          {
            name: 'v3.AVI',
            path: '/v3.AVI',
            size: 1000,
            type: 'file',
            extension: 'AVI',
            modifiedTime: Date.now(),
          },
        ],
      };

      render(<FileTypeBreakdown data={mixedCaseData} />);
      expect(screen.getByText('Videos')).toBeDefined();
      expect(screen.getByText('3 files')).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle files without extensions', () => {
      const noExtData: FileNode = {
        name: 'root',
        path: '/root',
        size: 1000,
        type: 'directory',
        modifiedTime: Date.now(),
        children: [
          {
            name: 'README',
            path: '/root/README',
            size: 1000,
            type: 'file',
            modifiedTime: Date.now(),
          },
        ],
      };

      render(<FileTypeBreakdown data={noExtData} />);
      expect(screen.getByText('No files to analyze')).toBeDefined();
    });

    it('should handle very large file counts', () => {
      const largeData: FileNode = {
        name: 'large',
        path: '/large',
        size: 100000,
        type: 'directory',
        modifiedTime: Date.now(),
        children: Array.from({ length: 1000 }, (_, i) => ({
          name: `file${i}.mp4`,
          path: `/large/file${i}.mp4`,
          size: 100,
          type: 'file' as const,
          extension: 'mp4',
          modifiedTime: Date.now(),
        })),
      };

      render(<FileTypeBreakdown data={largeData} />);
      expect(screen.getByText('Videos')).toBeDefined();
      expect(screen.getByText('1000 files')).toBeDefined();
    });

    it('should sort categories by size (largest first)', () => {
      const { container } = render(<FileTypeBreakdown data={mockData} />);

      const buttons = container.querySelectorAll('button');
      const categoryNames = Array.from(buttons).map((btn) => btn.textContent);

      // Videos (1MB) should appear before Images (500KB)
      const videosIndex = categoryNames.findIndex((name) => name?.includes('Videos'));
      const imagesIndex = categoryNames.findIndex((name) => name?.includes('Images'));

      expect(videosIndex).toBeLessThan(imagesIndex);
    });

    it('should display correct percentage for small categories', () => {
      const smallCategoryData: FileNode = {
        name: 'root',
        path: '/root',
        size: 1000000,
        type: 'directory',
        modifiedTime: Date.now(),
        children: [
          {
            name: 'large.mp4',
            path: '/root/large.mp4',
            size: 999000,
            type: 'file',
            extension: 'mp4',
            modifiedTime: Date.now(),
          },
          {
            name: 'tiny.jpg',
            path: '/root/tiny.jpg',
            size: 1000,
            type: 'file',
            extension: 'jpg',
            modifiedTime: Date.now(),
          },
        ],
      };

      render(<FileTypeBreakdown data={smallCategoryData} />);
      // Images should show 0.1%
      expect(screen.getByText(/0\.\d%/)).toBeDefined();
    });

    it('should handle deeply nested file structures', () => {
      const deepData: FileNode = {
        name: 'root',
        path: '/root',
        size: 1000,
        type: 'directory',
        modifiedTime: Date.now(),
        children: [
          {
            name: 'level1',
            path: '/root/level1',
            size: 1000,
            type: 'directory',
            modifiedTime: Date.now(),
            children: [
              {
                name: 'level2',
                path: '/root/level1/level2',
                size: 1000,
                type: 'directory',
                modifiedTime: Date.now(),
                children: [
                  {
                    name: 'level3',
                    path: '/root/level1/level2/level3',
                    size: 1000,
                    type: 'directory',
                    modifiedTime: Date.now(),
                    children: [
                      {
                        name: 'deep.mp4',
                        path: '/root/level1/level2/level3/deep.mp4',
                        size: 1000,
                        type: 'file',
                        extension: 'mp4',
                        modifiedTime: Date.now(),
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      render(<FileTypeBreakdown data={deepData} />);
      expect(screen.getByText('Videos')).toBeDefined();
    });

    it('should update when data changes', () => {
      const { rerender } = render(<FileTypeBreakdown data={mockData} />);

      expect(screen.getByText('Videos')).toBeDefined();

      const newData: FileNode = {
        name: 'new',
        path: '/new',
        size: 1000,
        type: 'directory',
        modifiedTime: Date.now(),
        children: [
          {
            name: 'code.js',
            path: '/new/code.js',
            size: 1000,
            type: 'file',
            extension: 'js',
            modifiedTime: Date.now(),
          },
        ],
      };

      rerender(<FileTypeBreakdown data={newData} />);

      expect(screen.getByText('Code')).toBeDefined();
      expect(screen.queryByText('Videos')).not.toBeInTheDocument();
    });

    it('should update when selectedType changes', () => {
      const { rerender } = render(<FileTypeBreakdown data={mockData} selectedType={null} />);

      const videosButton = screen.getByText('Videos').closest('button');
      expect(videosButton).not.toHaveClass('opacity-50');

      rerender(<FileTypeBreakdown data={mockData} selectedType="Images" />);

      const videosButtonAfter = screen.getByText('Videos').closest('button');
      expect(videosButtonAfter).toHaveClass('opacity-50');
    });
  });
});
