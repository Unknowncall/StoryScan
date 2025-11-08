import { exportToCSV, exportToJSON, downloadFile, type ExportMetadata } from '@/lib/utils';

describe('Export Utilities', () => {
  const mockMetadata: ExportMetadata = {
    version: '1.1.0',
    exportedAt: '2025-11-08T12:00:00.000Z',
    directoryPath: '/test/path',
    directoryName: 'test',
    totalSize: 1000000,
    scannedAt: '2025-11-08T11:00:00.000Z',
  };

  const mockFileNode = {
    name: 'root',
    path: '/test/root',
    size: 1000000,
    type: 'directory' as const,
    children: [
      {
        name: 'file1.txt',
        path: '/test/root/file1.txt',
        size: 500000,
        type: 'file' as const,
        extension: 'txt',
      },
      {
        name: 'subfolder',
        path: '/test/root/subfolder',
        size: 500000,
        type: 'directory' as const,
        children: [
          {
            name: 'file2.jpg',
            path: '/test/root/subfolder/file2.jpg',
            size: 300000,
            type: 'file' as const,
            extension: 'jpg',
          },
          {
            name: 'file3.mp4',
            path: '/test/root/subfolder/file3.mp4',
            size: 200000,
            type: 'file' as const,
            extension: 'mp4',
          },
        ],
      },
    ],
  };

  describe('exportToCSV', () => {
    it('should export file tree to CSV format', () => {
      const csv = exportToCSV(mockFileNode, mockMetadata);

      expect(csv).toContain('# StoryScan Export');
      expect(csv).toContain('# Version: 1.1.0');
      expect(csv).toContain('# Directory: /test/path');
      expect(csv).toContain(
        'Path,Name,Type,Size (Bytes),Size (Formatted),Extension,Depth,Parent Path'
      );
    });

    it('should include all nodes in flattened structure', () => {
      const csv = exportToCSV(mockFileNode, mockMetadata);

      expect(csv).toContain('/test/root');
      expect(csv).toContain('file1.txt');
      expect(csv).toContain('subfolder');
      expect(csv).toContain('file2.jpg');
      expect(csv).toContain('file3.mp4');
    });

    it('should properly escape CSV values with special characters', () => {
      const nodeWithSpecialChars = {
        name: 'file, with comma.txt',
        path: '/test/"quoted"/path',
        size: 1000,
        type: 'file' as const,
        extension: 'txt',
      };

      const csv = exportToCSV(nodeWithSpecialChars, mockMetadata);

      expect(csv).toContain('"file, with comma.txt"');
      expect(csv).toContain('"/test/""quoted""/path"');
    });

    it('should include depth information', () => {
      const csv = exportToCSV(mockFileNode, mockMetadata);

      // Root should be depth 0
      const lines = csv.split('\n');
      const rootLine = lines.find((line) => line.includes('/test/root') && !line.startsWith('#'));
      expect(rootLine).toContain(',0,'); // depth 0

      // Child should be depth 1
      const childLine = lines.find((line) => line.includes('file1.txt'));
      expect(childLine).toContain(',1,'); // depth 1

      // Grandchild should be depth 2
      const grandchildLine = lines.find((line) => line.includes('file2.jpg'));
      expect(grandchildLine).toContain(',2,'); // depth 2
    });

    it('should include parent path information', () => {
      const csv = exportToCSV(mockFileNode, mockMetadata);

      const lines = csv.split('\n');
      const childLine = lines.find((line) => line.includes('file2.jpg'));
      expect(childLine).toContain('/test/root/subfolder');
    });

    it('should handle nodes without extensions', () => {
      const nodeWithoutExtension = {
        name: 'README',
        path: '/test/README',
        size: 500,
        type: 'file' as const,
      };

      const csv = exportToCSV(nodeWithoutExtension, mockMetadata);

      expect(csv).toContain('README');
      expect(csv).toContain(',,'); // Empty extension field
    });

    it('should include formatted sizes', () => {
      const csv = exportToCSV(mockFileNode, mockMetadata);

      expect(csv).toContain('488.28 KB'); // 500000 bytes
      expect(csv).toContain('292.97 KB'); // 300000 bytes
      expect(csv).toContain('195.31 KB'); // 200000 bytes
    });

    it('should handle empty directory (no children)', () => {
      const emptyDir = {
        name: 'empty',
        path: '/test/empty',
        size: 0,
        type: 'directory' as const,
        children: [],
      };

      const csv = exportToCSV(emptyDir, mockMetadata);

      expect(csv).toContain('empty');
      expect(csv).toContain('directory');
    });
  });

  describe('exportToJSON', () => {
    it('should export file tree to JSON format with metadata', () => {
      const json = exportToJSON(mockFileNode, mockMetadata);
      const parsed = JSON.parse(json);

      expect(parsed).toHaveProperty('metadata');
      expect(parsed).toHaveProperty('data');
    });

    it('should include all metadata fields', () => {
      const json = exportToJSON(mockFileNode, mockMetadata);
      const parsed = JSON.parse(json);

      expect(parsed.metadata.version).toBe('1.1.0');
      expect(parsed.metadata.exportedAt).toBe('2025-11-08T12:00:00.000Z');
      expect(parsed.metadata.directoryPath).toBe('/test/path');
      expect(parsed.metadata.directoryName).toBe('test');
      expect(parsed.metadata.totalSize).toBe(1000000);
      expect(parsed.metadata.scannedAt).toBe('2025-11-08T11:00:00.000Z');
    });

    it('should preserve tree structure', () => {
      const json = exportToJSON(mockFileNode, mockMetadata);
      const parsed = JSON.parse(json);

      expect(parsed.data.name).toBe('root');
      expect(parsed.data.children).toHaveLength(2);
      expect(parsed.data.children[1].children).toHaveLength(2);
    });

    it('should include all node properties', () => {
      const json = exportToJSON(mockFileNode, mockMetadata);
      const parsed = JSON.parse(json);

      const fileNode = parsed.data.children[0];
      expect(fileNode.name).toBe('file1.txt');
      expect(fileNode.path).toBe('/test/root/file1.txt');
      expect(fileNode.size).toBe(500000);
      expect(fileNode.type).toBe('file');
      expect(fileNode.extension).toBe('txt');
    });

    it('should be pretty-printed (formatted with indentation)', () => {
      const json = exportToJSON(mockFileNode, mockMetadata);

      // Check for indentation (2 spaces)
      expect(json).toContain('  "metadata"');
      expect(json).toContain('    "version"');
    });

    it('should handle nested structures correctly', () => {
      const deepNode = {
        name: 'level1',
        path: '/level1',
        size: 1000,
        type: 'directory' as const,
        children: [
          {
            name: 'level2',
            path: '/level1/level2',
            size: 1000,
            type: 'directory' as const,
            children: [
              {
                name: 'level3.txt',
                path: '/level1/level2/level3.txt',
                size: 1000,
                type: 'file' as const,
                extension: 'txt',
              },
            ],
          },
        ],
      };

      const json = exportToJSON(deepNode, mockMetadata);
      const parsed = JSON.parse(json);

      expect(parsed.data.children[0].children[0].name).toBe('level3.txt');
    });
  });

  describe('downloadFile', () => {
    let createElementSpy: jest.SpyInstance;
    let mockLink: any;

    beforeEach(() => {
      // Mock URL API
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();

      // Mock DOM APIs
      mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
      };

      createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should create a download link and trigger download', () => {
      const content = 'test content';
      const filename = 'test.txt';

      downloadFile(content, filename);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should set correct filename', () => {
      const content = 'test content';
      const filename = 'myfile.csv';

      downloadFile(content, filename);

      expect(mockLink.download).toBe(filename);
    });

    it('should use correct MIME type for CSV', () => {
      const content = 'column1,column2\nvalue1,value2';
      const filename = 'data.csv';

      downloadFile(content, filename, 'text/csv');

      const createCall = (global.URL.createObjectURL as jest.Mock).mock.calls[0][0];
      expect(createCall.type).toBe('text/csv');
    });

    it('should use correct MIME type for JSON', () => {
      const content = '{"key": "value"}';
      const filename = 'data.json';

      downloadFile(content, filename, 'application/json');

      const createCall = (global.URL.createObjectURL as jest.Mock).mock.calls[0][0];
      expect(createCall.type).toBe('application/json');
    });

    it('should clean up by revoking object URL', () => {
      const content = 'test';
      const filename = 'test.txt';

      downloadFile(content, filename);

      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should remove link from DOM after download', () => {
      const content = 'test';
      const filename = 'test.txt';
      const removeChildSpy = jest.spyOn(document.body, 'removeChild');

      downloadFile(content, filename);

      expect(removeChildSpy).toHaveBeenCalled();
    });

    it('should trigger click event on link', () => {
      const content = 'test';
      const filename = 'test.txt';

      downloadFile(content, filename);

      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should handle large content', () => {
      const largeContent = 'x'.repeat(1000000); // 1MB of content
      const filename = 'large.txt';

      downloadFile(largeContent, filename);

      const createCall = (global.URL.createObjectURL as jest.Mock).mock.calls[0][0];
      expect(createCall.size).toBeGreaterThan(999000);
    });

    it('should handle special characters in content', () => {
      const content = 'Special chars: " \' , \n \t 你好 🎉';
      const filename = 'special.txt';

      downloadFile(content, filename);

      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should default to text/plain MIME type', () => {
      const content = 'test';
      const filename = 'test.txt';

      downloadFile(content, filename);

      const createCall = (global.URL.createObjectURL as jest.Mock).mock.calls[0][0];
      expect(createCall.type).toBe('text/plain');
    });
  });
});
