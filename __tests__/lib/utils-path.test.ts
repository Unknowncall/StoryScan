import { formatPath, copyToClipboard, type PathFormat } from '@/lib/utils';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('Path Formatting Utilities', () => {
  describe('formatPath', () => {
    it('returns Unix path unchanged', () => {
      const path = '/mnt/user/media/movies';
      expect(formatPath(path, 'unix')).toBe('/mnt/user/media/movies');
    });

    it('converts Unix path to Windows SMB format', () => {
      const path = '/mnt/user/media/movies';
      const result = formatPath(path, 'windows');
      expect(result).toBe('\\\\server\\mnt\\user\\media\\movies');
    });

    it('converts Unix path to Windows SMB format with custom server name', () => {
      const path = '/mnt/user/media/movies';
      const result = formatPath(path, 'windows', 'myserver');
      expect(result).toBe('\\\\myserver\\mnt\\user\\media\\movies');
    });

    it('formats path for Unraid with /mnt/user prefix', () => {
      const path = '/media/movies';
      const result = formatPath(path, 'unraid');
      expect(result).toBe('/mnt/user/media/movies');
    });

    it('returns Unraid path unchanged if already has /mnt/ prefix', () => {
      const path = '/mnt/user/media/movies';
      const result = formatPath(path, 'unraid');
      expect(result).toBe('/mnt/user/media/movies');
    });

    it('returns Unraid path unchanged if has /mnt/disk prefix', () => {
      const path = '/mnt/disk1/media/movies';
      const result = formatPath(path, 'unraid');
      expect(result).toBe('/mnt/disk1/media/movies');
    });

    it('handles root path correctly', () => {
      expect(formatPath('/', 'unix')).toBe('/');
      expect(formatPath('/', 'windows')).toBe('\\\\server\\');
      expect(formatPath('/', 'unraid')).toBe('/mnt/user/');
    });

    it('handles paths with special characters', () => {
      const path = '/mnt/user/media/my folder (2023)';
      expect(formatPath(path, 'unix')).toBe('/mnt/user/media/my folder (2023)');
      expect(formatPath(path, 'windows')).toBe('\\\\server\\mnt\\user\\media\\my folder (2023)');
    });
  });

  describe('copyToClipboard', () => {
    beforeEach(() => {
      (navigator.clipboard.writeText as jest.Mock).mockClear();
    });

    it('successfully copies text to clipboard', async () => {
      (navigator.clipboard.writeText as jest.Mock).mockResolvedValue(undefined);

      const result = await copyToClipboard('/test/path');

      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('/test/path');
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    });

    it('returns false when clipboard write fails', async () => {
      (navigator.clipboard.writeText as jest.Mock).mockRejectedValue(
        new Error('Permission denied')
      );

      const result = await copyToClipboard('/test/path');

      expect(result).toBe(false);
    });

    it('handles empty strings', async () => {
      (navigator.clipboard.writeText as jest.Mock).mockResolvedValue(undefined);

      const result = await copyToClipboard('');

      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('');
    });

    it('handles long paths', async () => {
      (navigator.clipboard.writeText as jest.Mock).mockResolvedValue(undefined);

      const longPath = '/very/long/path/'.repeat(100);
      const result = await copyToClipboard(longPath);

      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(longPath);
    });
  });
});
