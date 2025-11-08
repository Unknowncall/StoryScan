# StoryScan - Quick Start Guide

## What Was Built

A beautiful, modern web-based disk usage visualizer inspired by DaisyDisk. It features:

- **Interactive D3.js treemap visualization** - Click to drill down into directories
- **Dark/Light mode toggle** - Beautiful gradients and smooth animations
- **Multi-directory support** - Switch between multiple mounted directories
- **Real-time statistics** - Total size, file count, folder count
- **Docker containerized** - Ready for Unraid deployment

## Technology Stack

- Next.js 14 (TypeScript)
- Tailwind CSS for styling
- D3.js for treemap visualization
- Framer Motion for animations
- Docker for deployment

## Quick Start

### Option 1: Docker (Recommended for Unraid)

1. **Build the image:**

```bash
docker build -t storyscan .
```

2. **Run the container:**

```bash
docker run -d \
  --name storyscan \
  -p 3000:3000 \
  -e SCAN_DIRECTORIES=/data/media,/data/downloads \
  -v /mnt/user/media:/data/media:ro \
  -v /mnt/user/downloads:/data/downloads:ro \
  storyscan
```

3. **Access the app:**
   Open your browser to `http://localhost:3000`

### Option 2: Docker Compose

1. **Edit docker-compose.yml** to configure your directories:

```yaml
environment:
  - SCAN_DIRECTORIES=/data/media,/data/downloads
volumes:
  - /mnt/user/media:/data/media:ro
  - /mnt/user/downloads:/data/downloads:ro
```

2. **Start the container:**

```bash
docker-compose up -d
```

3. **View logs:**

```bash
docker-compose logs -f
```

### Option 3: Local Development

1. **Install dependencies:**

```bash
npm install
```

2. **Create .env.local:**

```bash
echo "SCAN_DIRECTORIES=/Users/you/Documents,/Users/you/Downloads" > .env.local
```

3. **Run dev server:**

```bash
npm run dev
```

4. **Open browser:**
   Navigate to `http://localhost:3000`

## Configuration

### Environment Variables

- `SCAN_DIRECTORIES`: Comma-separated list of paths to scan
  - Example: `/data/media,/data/downloads,/data/backups`
  - These paths should match your Docker volume mounts
  - Default: `/data`

### Volume Mounts

**Important:** Always mount volumes as **read-only** (`:ro`) for safety.

Format: `host_path:container_path:ro`

Example:

```yaml
volumes:
  - /mnt/user/media:/data/media:ro
  - /mnt/user/downloads:/data/downloads:ro
```

The container paths (e.g., `/data/media`) must match what you specify in `SCAN_DIRECTORIES`.

## Unraid Installation

1. Go to **Docker** tab in Unraid
2. Click **Add Container**
3. Configure:
   - **Name:** storyscan
   - **Repository:** storyscan (or your registry)
   - **Network Type:** bridge
   - **Port:** `3000` → `3000`
   - **Add Path 1:** `/mnt/user/media` → `/data/media` (Read Only: Yes)
   - **Add Path 2:** `/mnt/user/downloads` → `/data/downloads` (Read Only: Yes)
   - **Add Variable:** `SCAN_DIRECTORIES` = `/data/media,/data/downloads`
4. Click **Apply**
5. Access at `http://your-unraid-ip:3000`

## Usage

1. **Select a directory** from the dropdown at the top
2. **Wait for scan** to complete (large directories may take time)
3. **Explore the treemap**:
   - Hover over any block to see details
   - Click on a directory to drill down
   - Use breadcrumbs to navigate back
4. **Toggle dark/light mode** with the button in the header
5. **Refresh scan** to update data

## Features Overview

### Treemap Visualization

- Color-coded by file type
- Size-proportional blocks
- Click to drill down into directories
- Hover for detailed information

### Statistics Dashboard

- Total disk usage
- Number of files
- Number of folders
- Last scan timestamp

### Directory Navigation

- Breadcrumb trail showing current path
- Click any breadcrumb to jump back
- Smooth animations between views

### Top Items List

- Shows the 10 largest items in current directory
- Quick overview of space usage

## Tested & Working

All features have been tested:

- ✅ Next.js builds successfully
- ✅ Development server runs correctly
- ✅ Docker image builds without errors
- ✅ Docker container runs and serves the app
- ✅ API endpoints return correct data
- ✅ Directory scanning works with mounted volumes
- ✅ TypeScript compilation successful
- ✅ Tailwind CSS configured properly

## Project Structure

````
StoryScan/
├── app/
│   ├── api/scan/route.ts      # Backend API for scanning
│   ├── page.tsx               # Main application page
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
├── components/
│   ├── Treemap.tsx            # D3.js visualization
│   ├── DirectorySelector.tsx  # Directory picker
│   ├── Breadcrumb.tsx         # Navigation
│   ├── Stats.tsx              # Statistics display
│   └── Loading.tsx            # Loading spinner
├── lib/utils.ts               # Utility functions
├── types/index.ts             # TypeScript types
├── Dockerfile                 # Multi-stage Docker build
├── docker-compose.yml         # Docker Compose config
└── claude.md                  # Full technical documentation

## Troubleshooting

### Port already in use
Change the port mapping:
```yaml
ports:
  - "3001:3000"  # Use 3001 instead
````

### Permission denied

Make sure Docker has read access to your directories, or check that mounted paths exist.

### Slow scanning

Large directories take time. Consider:

- Scanning smaller subdirectories
- Waiting for initial scan to complete
- The scan runs on-demand, so results are fresh

### Container won't start

Check logs:

```bash
docker logs storyscan
```

## Next Steps

You're all set! The application is ready to use. Some potential enhancements:

- Add file search functionality
- Export visualization as image
- File type breakdown charts
- Historical size tracking

For more details, see `claude.md` for full technical documentation.

Enjoy using StoryScan! 🎉
