# StoryScan

A beautiful, modern web-based disk usage visualizer designed for Unraid and other systems. Inspired by DaisyDisk, StoryScan provides an elegant interface to explore and understand your disk usage with interactive treemap visualizations.

## Features

- **Beautiful UI**: Modern, gradient-rich design with smooth animations
- **Interactive Treemap**: D3.js-powered visualization that lets you drill down into directories
- **Dark Mode**: Full dark mode support with smooth transitions
- **Multi-Directory Support**: Scan and switch between multiple configured directories
- **Real-time Stats**: See total size, file count, and folder count at a glance
- **Responsive**: Works on desktop, tablet, and mobile devices
- **Docker Ready**: Easy deployment with Docker and docker-compose

## Quick Start

### Using Docker Compose (Recommended)

1. Clone this repository:

```bash
git clone <repository-url>
cd storyscan
```

2. Edit `docker-compose.yml` to configure your directories:

```yaml
environment:
  - SCAN_DIRECTORIES=/data/media,/data/downloads,/data/backups
volumes:
  - /mnt/user/media:/data/media:ro
  - /mnt/user/downloads:/data/downloads:ro
  - /mnt/user/backups:/data/backups:ro
```

3. Start the container:

```bash
docker-compose up -d
```

4. Access the web interface at `http://localhost:3000`

### Using Docker Run

```bash
docker build -t storyscan .

docker run -d \
  --name storyscan \
  -p 3000:3000 \
  -e SCAN_DIRECTORIES=/data/media,/data/downloads \
  -v /mnt/user/media:/data/media:ro \
  -v /mnt/user/downloads:/data/downloads:ro \
  storyscan
```

## Configuration

### Environment Variables

- `SCAN_DIRECTORIES`: Comma-separated list of directories to scan (default: `/data`)

Example:

```bash
SCAN_DIRECTORIES=/data/media,/data/downloads,/data/backups
```

### Volume Mounts

Mount your directories as read-only (`:ro`) for safety:

```yaml
volumes:
  - /host/path:/container/path:ro
```

The container paths should match what you specify in `SCAN_DIRECTORIES`.

## Unraid Installation

1. In Unraid, go to **Docker** tab
2. Click **Add Container**
3. Configure as follows:
   - **Name**: storyscan
   - **Repository**: storyscan (or your registry)
   - **Network Type**: bridge
   - **Port**: 3000 → 3000
   - **Path 1**: `/mnt/user/media` → `/data/media` (read-only)
   - **Path 2**: `/mnt/user/downloads` → `/data/downloads` (read-only)
   - **Variable**: `SCAN_DIRECTORIES` = `/data/media,/data/downloads`

4. Click **Apply** and access at `http://your-unraid-ip:3000`

## Development

### Prerequisites

- Node.js 20+
- npm or yarn

### Local Development

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file:

```bash
SCAN_DIRECTORIES=/Users/yourname/Documents,/Users/yourname/Downloads
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Technology Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **D3.js**: Powerful treemap visualizations
- **Framer Motion**: Smooth animations
- **Lucide React**: Beautiful icons

## Screenshots

_Coming soon_

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
