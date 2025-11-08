import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return percentage < 0.01 ? '<0.01%' : `${percentage.toFixed(2)}%`;
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length === 1) return '';
  return parts[parts.length - 1].toLowerCase();
}

export function getColorForExtension(extension: string): string {
  const colorMap: Record<string, string> = {
    // Images
    jpg: '#ef4444',
    jpeg: '#ef4444',
    png: '#ef4444',
    gif: '#ef4444',
    svg: '#ef4444',
    webp: '#ef4444',

    // Videos
    mp4: '#8b5cf6',
    mov: '#8b5cf6',
    avi: '#8b5cf6',
    mkv: '#8b5cf6',
    webm: '#8b5cf6',

    // Documents
    pdf: '#f59e0b',
    doc: '#f59e0b',
    docx: '#f59e0b',
    txt: '#f59e0b',
    md: '#f59e0b',

    // Code
    js: '#fbbf24',
    ts: '#fbbf24',
    jsx: '#fbbf24',
    tsx: '#fbbf24',
    py: '#fbbf24',
    java: '#fbbf24',
    cpp: '#fbbf24',
    go: '#fbbf24',

    // Archives
    zip: '#06b6d4',
    rar: '#06b6d4',
    tar: '#06b6d4',
    gz: '#06b6d4',
    '7z': '#06b6d4',

    // Audio
    mp3: '#10b981',
    wav: '#10b981',
    flac: '#10b981',
    aac: '#10b981',
  };

  return colorMap[extension] || '#6b7280';
}

export function getColorForPath(path: string, index: number): string {
  const colors = [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#f59e0b', // amber
    '#10b981', // green
    '#06b6d4', // cyan
    '#f43f5e', // rose
    '#14b8a6', // teal
  ];

  return colors[index % colors.length];
}

export type PathFormat = 'unix' | 'windows' | 'unraid';

export function formatPath(path: string, format: PathFormat, serverName?: string): string {
  switch (format) {
    case 'windows':
      // Convert /mnt/user/path to \\server\path or \\server\user\path
      const server = serverName || 'server';
      return path.replace(/\//g, '\\').replace(/^\\/, `\\\\${server}\\`);
    case 'unraid':
      // Unraid-specific format (same as Unix but with /mnt/user prefix if not present)
      if (!path.startsWith('/mnt/user/') && !path.startsWith('/mnt/')) {
        return '/mnt/user' + path;
      }
      return path;
    case 'unix':
    default:
      return path;
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

// Export/Import Types
export interface ExportMetadata {
  version: string;
  exportedAt: string;
  directoryPath: string;
  directoryName: string;
  totalSize: number;
  scannedAt: string;
}

export interface CSVRow {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size: number;
  sizeFormatted: string;
  extension: string;
  depth: number;
  parentPath: string;
}

// Export to CSV format
export function exportToCSV(root: any, metadata: ExportMetadata): string {
  const rows: CSVRow[] = [];

  // Recursively flatten the tree
  function flattenNode(node: any, depth: number = 0, parentPath: string = '') {
    const row: CSVRow = {
      path: node.path,
      name: node.name,
      type: node.type,
      size: node.size,
      sizeFormatted: formatBytes(node.size),
      extension: node.extension || '',
      depth,
      parentPath,
    };
    rows.push(row);

    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        flattenNode(child, depth + 1, node.path);
      }
    }
  }

  flattenNode(root);

  // Build CSV string
  const headers = [
    'Path',
    'Name',
    'Type',
    'Size (Bytes)',
    'Size (Formatted)',
    'Extension',
    'Depth',
    'Parent Path',
  ];
  const csvRows = [headers.join(',')];

  // Add metadata as comments
  csvRows.unshift(`# StoryScan Export`);
  csvRows.unshift(`# Version: ${metadata.version}`);
  csvRows.unshift(`# Exported: ${metadata.exportedAt}`);
  csvRows.unshift(`# Directory: ${metadata.directoryPath}`);
  csvRows.unshift(`# Scanned: ${metadata.scannedAt}`);
  csvRows.unshift(`# Total Size: ${formatBytes(metadata.totalSize)}`);
  csvRows.unshift('');

  for (const row of rows) {
    const values = [
      escapeCSV(row.path),
      escapeCSV(row.name),
      row.type,
      row.size.toString(),
      escapeCSV(row.sizeFormatted),
      escapeCSV(row.extension),
      row.depth.toString(),
      escapeCSV(row.parentPath),
    ];
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

// Export to JSON format
export function exportToJSON(root: any, metadata: ExportMetadata): string {
  const exportData = {
    metadata,
    data: root,
  };

  return JSON.stringify(exportData, null, 2);
}

// Helper to escape CSV values
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Trigger file download in browser
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
