# Agent Runtime

## Overview

Agent Runtime is a specialized runtime engine designed for executing AI agents, serving as the core runtime environment for the Blocklet system. It can load, manage, and execute deployed Agent Blocklets, providing a unified execution platform for AI agents that supports complex reasoning, computation, and task execution.

## Features

- **Agent Execution Engine**: Core runtime environment for executing deployed Agent Blocklets
- **Dynamic Component Loading**: Supports runtime loading and management of Agent components

## Usage

### Starting the Service

```bash
# Development mode
npm run dev

# Or run directly
node index.js
```

### Environment Variables

- `BLOCKLET_PORT`: Service port number
- `DOCKER_HOST_SERVER_DIR`: Docker host directory mapping
- `DOCKER_CONTAINER_SERVER_DIR`: Docker container directory mapping

## API Interfaces

### Health Check

```
GET /api/health
```

Returns component runtime status information.

### Chat Interface

```
POST /api/chat
```