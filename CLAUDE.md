# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AIGNE Framework is a functional AI application development framework for building AI-powered applications with TypeScript. It combines functional programming features, powerful AI capabilities, and modular design principles.

**Key Characteristics:**
- Monorepo managed with pnpm workspaces
- TypeScript-first with comprehensive type definitions
- Supports multiple AI models (OpenAI, Gemini, Claude, Bedrock, DeepSeek, Ollama, XAI, OpenRouter)
- Built-in MCP (Model Context Protocol) support
- Virtual file system (AFS) for AI agent data access
- Test runner: Bun
- Linter/Formatter: Biome
- Node.js >= 20.15 required

## Repository Structure

```
aigne-framework/
├── packages/           # Core framework packages
│   ├── core/          # Main framework (@aigne/core)
│   ├── cli/           # Command-line interface (@aigne/cli)
│   ├── agent-library/ # Pre-built agents
│   ├── sqlite/        # SQLite utilities
│   ├── secrets/       # Secrets management
│   └── transport/     # Transport layer
├── models/            # AI model implementations
│   ├── openai/        # OpenAI integration
│   ├── anthropic/     # Claude/Anthropic integration
│   ├── bedrock/       # AWS Bedrock integration
│   ├── gemini/        # Google Gemini integration
│   ├── deepseek/      # DeepSeek integration
│   ├── ollama/        # Ollama integration
│   ├── xai/           # XAI integration
│   └── open-router/   # OpenRouter integration
├── afs/               # Agentic File System modules
│   ├── core/          # AFS core (@aigne/afs)
│   ├── history/       # Conversation history module
│   ├── local-fs/      # Local filesystem module
│   └── user-profile-memory/ # User profile module
├── examples/          # Example implementations
│   ├── workflow-*/    # Workflow pattern examples
│   ├── mcp-*/         # MCP integration examples
│   └── afs-*/         # AFS usage examples
├── memory/            # Memory implementations
├── observability/     # Observability tools
└── blocklets/         # Blocklet integrations
```

## Development Commands

### Package Management
```bash
pnpm install              # Install all dependencies
pnpm update:deps          # Update all dependencies to latest
```

### Building
```bash
pnpm build                # Build all library packages (@aigne/*)
pnpm build:libs           # Same as pnpm build
pnpm build:docs           # Generate TypeDoc documentation
pnpm clean                # Clean all build outputs
```

### Testing
```bash
pnpm test                 # Run all tests (uses bun)
pnpm test:coverage        # Run tests with coverage reports
```

### Linting
```bash
pnpm lint                 # Run biome check and typescript checks
pnpm lint:fix             # Auto-fix linting issues
```

### Working with Individual Packages
```bash
# Build only specific packages (from project root)
pnpm -F @aigne/core build
pnpm -F @aigne/cli build

# Run tests in a specific package
cd packages/core && bun test
cd packages/cli && bun test
```

## Code Architecture

### Core Concepts

**AIGNE Class (`packages/core/src/aigne/`)**
- Central orchestrator that manages model instances and agent execution
- Provides `invoke()` method to create user-facing agent instances
- Handles model lifecycle and configuration

**Agents (`packages/core/src/agents/`)**
- `AIAgent`: General-purpose conversational agents with instructions and skills
- `TransformAgent`: Data transformation agents
- `TeamAgent`: Multi-agent collaboration
- `MCPAgent`: MCP server integration
- `ImageAgent`/`VideoAgent`: Multimodal agents
- `GuideRailAgent`: Output validation and filtering

**Workflow Patterns**
Agents can be composed into workflow patterns:
- **Sequential**: Step-by-step processing pipelines
- **Concurrency**: Parallel task execution
- **Router**: Content-based routing to specialized handlers
- **Handoff**: Agent-to-agent transfer with skills
- **Reflection**: Self-evaluation and iterative improvement
- **Code Execution**: Dynamic code generation and execution
- **Orchestration**: Multi-agent coordination

**AFS (Agentic File System) (`afs/`)**
- Virtual filesystem abstraction for AI agents
- Modules mounted at `/modules/{module-name}` (e.g., `/modules/history`, `/modules/local-fs`)
- Operations: list, read, write, search, exec
- Provides unified access to local files, conversation history, user profiles
- Automatically registers as tools for AI agents

**Memory (`packages/core/src/memory/`)**
- Manages conversation state and context
- Supports different storage backends (SQLite, in-memory)
- Used by agents to maintain session history

**Prompts (`packages/core/src/prompt/`)**
- Template system using Nunjucks
- `PromptBuilder`: Constructs prompts with context, examples, and formatting

### Build System

**TypeScript Configuration:**
- Each package has its own `tsconfig.json` and build scripts
- Multi-target builds: ESM (`lib/esm`), CJS (`lib/cjs`), and TypeScript declarations (`lib/dts`)
- Build scripts in `packages/*/scripts/tsconfig.build.*.json`

**Package Exports:**
- Dual ESM/CJS support via package.json `exports` field
- Subpath exports for internal modules (e.g., `@aigne/core/agents/*`)

## CLI Tool (`@aigne/cli`)

The AIGNE CLI (`packages/cli`) provides these commands:

```bash
aigne create [name]        # Create new AIGNE project from template
aigne run <file>           # Run an agent file
aigne serve-mcp <file>     # Serve as MCP server
aigne app [command]        # Manage AIGNE apps
aigne hub [command]        # Manage agent hubs (create, delete, list, status)
aigne deploy               # Deploy to Blocklet server
aigne observe              # Start observability UI
aigne eval                 # Run evaluation tests
```

Templates are located in `packages/cli/templates/`.

## Testing Conventions

- Tests use **Bun** as the test runner
- Test files located in `*/test/` directories
- Each package has its own test suite
- Coverage reports generated with `--coverage` flag
- Examples serve as end-to-end tests

## Code Style

**Biome Configuration (`biome.json`):**
- Line width: 100 characters
- Indent style: 2 spaces
- Quote style: double quotes
- Import extensions required (`.js` for imports, even in `.ts` files)
- Strict rules for unused variables/imports/parameters
- Pre-commit hooks auto-format via lint-staged

**TypeScript:**
- Use `.js` extensions in import statements (resolved by TypeScript)
- Avoid `@ts-ignore` (use `@ts-expect-error` with explanation if needed)
- No `any` without justification

## Release Process

- Uses **release-please** for automated version management
- Follows **Conventional Commits** specification
- Commit format: `<type>(<scope>): <subject>`
  - Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
  - Breaking changes: use `!` (e.g., `feat!: breaking change`)
- Release PRs automatically created when commits merged to `main`
- CI automatically publishes packages after release PR merged

## Model Integration

When adding or working with AI model integrations:
- Model implementations in `models/` directory
- Must implement `ChatModel` interface from `@aigne/core`
- Support streaming and non-streaming responses
- Handle function calling (skills/tools)
- Examples: `models/openai/`, `models/anthropic/`

## MCP (Model Context Protocol)

- MCP servers can be integrated as agents via `MCPAgent`
- AFS modules can mount MCP servers (see `afs/core` MCP module support)
- Examples: `examples/mcp-github/`, `examples/mcp-puppeteer/`, `examples/mcp-sqlite/`
- Serve agents as MCP servers with `aigne serve-mcp`

## Common Patterns

**Creating an Agent:**
```typescript
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const model = new OpenAIChatModel({ apiKey: process.env.OPENAI_API_KEY });
const aigne = new AIGNE({ model });

const agent = AIAgent.from({
  name: "Assistant",
  instructions: "You are a helpful assistant",
  inputKey: "message",
  outputKey: "response"
});

const userAgent = aigne.invoke(agent);
const result = await userAgent.invoke({ message: "Hello" });
```

**Using AFS:**
```typescript
import { AFS } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";
import { LocalFS } from "@aigne/afs-local-fs";

const afs = new AFS();
afs.mount(new AFSHistory({ storage: { url: "file:./memory.sqlite3" } }));
afs.mount(new LocalFS({ localPath: "./docs" }));

// Pass to agent
const agent = AIAgent.from({
  // ... agent config
  afs,  // Agent gets filesystem access as tools
});
```

## Important Notes

- Always run commands from repository root unless working on a specific package
- Examples are not just documentation—they're actively used for testing
- When adding features, add corresponding examples in `examples/`
- Use workspace protocol (`workspace:^`) for internal dependencies in package.json
- SQLite-based modules (AFS history, memory) create `.sqlite3` files—add to `.gitignore` if needed
