import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
  test('GET /api/scan should return list of directories', async ({ request }) => {
    const response = await request.get('/api/scan');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('directories');
    expect(Array.isArray(data.directories)).toBeTruthy();
    expect(data.directories.length).toBeGreaterThan(0);

    // Check structure of directory objects
    const firstDir = data.directories[0];
    expect(firstDir).toHaveProperty('id');
    expect(firstDir).toHaveProperty('name');
    expect(firstDir).toHaveProperty('path');
  });

  test('GET /api/scan?dir=0 should return scan results', async ({ request }) => {
    const response = await request.get('/api/scan?dir=0');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();

    // Check response structure
    expect(data).toHaveProperty('directory');
    expect(data).toHaveProperty('root');
    expect(data).toHaveProperty('totalSize');
    expect(data).toHaveProperty('scannedAt');

    // Check directory object
    expect(data.directory).toHaveProperty('id');
    expect(data.directory).toHaveProperty('name');
    expect(data.directory).toHaveProperty('path');

    // Check root node
    expect(data.root).toHaveProperty('name');
    expect(data.root).toHaveProperty('path');
    expect(data.root).toHaveProperty('size');
    expect(data.root).toHaveProperty('type');
    expect(data.root.type).toBe('directory');

    // Total size should be positive
    expect(data.totalSize).toBeGreaterThan(0);

    // Scanned at should be a valid ISO date
    expect(new Date(data.scannedAt).toString()).not.toBe('Invalid Date');
  });

  test('GET /api/scan?dir=999 should return error for invalid index', async ({ request }) => {
    const response = await request.get('/api/scan?dir=999');

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('Scan result should include children for directories', async ({ request }) => {
    const response = await request.get('/api/scan?dir=0');
    const data = await response.json();

    // Root should have children
    if (data.root.type === 'directory') {
      expect(data.root).toHaveProperty('children');
      expect(Array.isArray(data.root.children)).toBeTruthy();

      // Check structure of child nodes
      if (data.root.children.length > 0) {
        const firstChild = data.root.children[0];
        expect(firstChild).toHaveProperty('name');
        expect(firstChild).toHaveProperty('path');
        expect(firstChild).toHaveProperty('size');
        expect(firstChild).toHaveProperty('type');

        if (firstChild.type === 'file') {
          // Files may have extension
          if (firstChild.extension) {
            expect(typeof firstChild.extension).toBe('string');
          }
        }
      }
    }
  });

  test('Children should be sorted by size (largest first)', async ({ request }) => {
    const response = await request.get('/api/scan?dir=0');
    const data = await response.json();

    if (data.root.children && data.root.children.length > 1) {
      const sizes = data.root.children.map((child: any) => child.size);

      // Check that array is sorted descending
      for (let i = 0; i < sizes.length - 1; i++) {
        expect(sizes[i]).toBeGreaterThanOrEqual(sizes[i + 1]);
      }
    }
  });
});
