# @aigne/afs-explorer

AFS Explorer is a web-based file system explorer for the AIGNE Framework's Agentic File System (AFS). It provides a beautiful, user-friendly interface built with React, TypeScript, and Material-UI to browse, search, and view files in your AFS instances.

## Features

- 📁 Browse AFS file systems with an intuitive folder/file interface
- 🌲 **File tree navigation** - Explore directories in a collapsible tree view (left sidebar)
- 🔗 **URL-based routing** - Each directory has its own URL for easy bookmarking and sharing
- 🔍 Search files and directories across all mounted modules
- 👁️ View file contents with syntax highlighting for JSON/YAML
- 📊 Display file metadata (size, type, timestamps)
- 🎨 Modern, responsive UI built with Material-UI
- 📱 Mobile-friendly with responsive drawer navigation
- ⚡ Fast and efficient API based on Express

## Installation

```bash
pnpm add @aigne/afs-explorer
```

## Usage

### Basic Example

```typescript
import { AFS } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";
import { LocalFS } from "@aigne/afs-local-fs";
import { startExplorer } from "@aigne/afs-explorer";

// Create and configure your AFS instance
const afs = new AFS();
afs.mount(new AFSHistory({ storage: { url: "file:./memory.sqlite3" } }));
afs.mount(new LocalFS({ localPath: "./docs" }));

// Start the explorer server
const server = await startExplorer(afs, {
  port: 3000,
  host: "localhost",
});

console.log("AFS Explorer is running at http://localhost:3000");
```

### Custom Configuration

```typescript
import { ExplorerServer } from "@aigne/afs-explorer";
import { fileURLToPath } from "node:url";
import path from "node:path";

// For production: specify the path to the built frontend
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, "node_modules/@aigne/afs-explorer/dist");

const server = new ExplorerServer(afs, {
  port: 8080,
  host: "0.0.0.0", // Listen on all interfaces
  distPath, // Path to the built frontend files
});

await server.start();

// Later, stop the server
await server.stop();
```

**Note:** The `distPath` option is optional. If not provided, only the API endpoints will be available. In development, you can run the Vite dev server separately and use a proxy to access the API.

## Development

### Build the Frontend

```bash
pnpm build:web
```

This builds the React application into the `dist` directory.

### Build the Library

```bash
pnpm build:lib
```

This compiles the TypeScript server code.

### Build Everything

```bash
pnpm build
```

### Development Mode

For development, you can run the Vite dev server separately:

```bash
pnpm dev
```

This will start the Vite dev server on port 5173 with hot module replacement.

## API Endpoints

The explorer provides the following REST API endpoints:

- `GET /api/list?path={path}&maxDepth={depth}` - List directory contents (start from root `/`)
- `GET /api/read?path={path}` - Read file contents
- `GET /api/search?path={path}&query={query}` - Search files and directories

## Architecture

### Backend

The backend is built with Express and provides:
- RESTful API for AFS operations
- Static file serving for the React frontend
- CORS support for development

### Frontend

The frontend is a React application built with:
- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Material-UI (MUI)** - Professional UI components
- **Vite** - Fast build tool and dev server

## License

Elastic-2.0
