import {
  formatBytes,
  formatNumber,
  formatPercentage,
  getFileExtension,
  getColorForExtension,
  getColorForPath,
  cn,
} from '@/lib/utils';

describe('Utility Functions', () => {
  describe('formatBytes', () => {
    it('should format 0 bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
    });

    it('should format bytes correctly', () => {
      expect(formatBytes(500)).toBe('500 Bytes');
    });

    it('should format kilobytes correctly', () => {
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1536)).toBe('1.5 KB');
    });

    it('should format megabytes correctly', () => {
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(1572864)).toBe('1.5 MB');
    });

    it('should format gigabytes correctly', () => {
      expect(formatBytes(1073741824)).toBe('1 GB');
      expect(formatBytes(1610612736)).toBe('1.5 GB');
    });

    it('should format terabytes correctly', () => {
      expect(formatBytes(1099511627776)).toBe('1 TB');
    });

    it('should respect decimal places', () => {
      expect(formatBytes(1536, 0)).toBe('2 KB');
      expect(formatBytes(1536, 1)).toBe('1.5 KB');
      // Note: parseFloat removes trailing zeros, so 1.50 becomes 1.5
      expect(formatBytes(1536, 2)).toBe('1.5 KB');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(123456789)).toBe('123,456,789');
    });

    it('should format small numbers without commas', () => {
      expect(formatNumber(100)).toBe('100');
      expect(formatNumber(999)).toBe('999');
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage correctly', () => {
      expect(formatPercentage(50, 100)).toBe('50.00%');
      expect(formatPercentage(25, 100)).toBe('25.00%');
      expect(formatPercentage(75, 100)).toBe('75.00%');
    });

    it('should handle zero total', () => {
      expect(formatPercentage(50, 0)).toBe('0%');
    });

    it('should handle very small percentages', () => {
      expect(formatPercentage(1, 10000)).toBe('0.01%');
      expect(formatPercentage(1, 100000)).toBe('<0.01%');
    });

    it('should handle 100%', () => {
      expect(formatPercentage(100, 100)).toBe('100.00%');
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extensions correctly', () => {
      expect(getFileExtension('file.txt')).toBe('txt');
      expect(getFileExtension('document.pdf')).toBe('pdf');
      expect(getFileExtension('image.jpg')).toBe('jpg');
    });

    it('should handle multiple dots', () => {
      expect(getFileExtension('archive.tar.gz')).toBe('gz');
    });

    it('should handle files without extension', () => {
      expect(getFileExtension('README')).toBe('');
      expect(getFileExtension('Makefile')).toBe('');
    });

    it('should handle hidden files', () => {
      expect(getFileExtension('.gitignore')).toBe('gitignore');
    });

    it('should convert to lowercase', () => {
      expect(getFileExtension('FILE.TXT')).toBe('txt');
      expect(getFileExtension('Image.JPG')).toBe('jpg');
    });
  });

  describe('getColorForExtension', () => {
    it('should return correct color for image files', () => {
      expect(getColorForExtension('jpg')).toBe('#ef4444');
      expect(getColorForExtension('png')).toBe('#ef4444');
      expect(getColorForExtension('gif')).toBe('#ef4444');
    });

    it('should return correct color for video files', () => {
      expect(getColorForExtension('mp4')).toBe('#8b5cf6');
      expect(getColorForExtension('mov')).toBe('#8b5cf6');
    });

    it('should return correct color for document files', () => {
      expect(getColorForExtension('pdf')).toBe('#f59e0b');
      expect(getColorForExtension('doc')).toBe('#f59e0b');
    });

    it('should return correct color for code files', () => {
      expect(getColorForExtension('js')).toBe('#fbbf24');
      expect(getColorForExtension('ts')).toBe('#fbbf24');
      expect(getColorForExtension('py')).toBe('#fbbf24');
    });

    it('should return default color for unknown extensions', () => {
      expect(getColorForExtension('unknown')).toBe('#6b7280');
      expect(getColorForExtension('')).toBe('#6b7280');
    });
  });

  describe('getColorForPath', () => {
    it('should return colors from the palette', () => {
      const colors = [
        '#3b82f6',
        '#8b5cf6',
        '#ec4899',
        '#f59e0b',
        '#10b981',
        '#06b6d4',
        '#f43f5e',
        '#14b8a6',
      ];

      for (let i = 0; i < colors.length; i++) {
        expect(getColorForPath(`/path${i}`, i)).toBe(colors[i]);
      }
    });

    it('should cycle through colors', () => {
      expect(getColorForPath('/path0', 0)).toBe('#3b82f6');
      expect(getColorForPath('/path8', 8)).toBe('#3b82f6'); // Should cycle back
    });
  });

  describe('cn (className merge)', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    });

    it('should handle tailwind conflicts', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4');
    });

    it('should handle empty inputs', () => {
      expect(cn()).toBe('');
      expect(cn('', undefined, null)).toBe('');
    });
  });
});
