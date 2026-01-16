# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Package management (pnpm workspaces)
pnpm install              # Install all dependencies
pnpm build                # Build all library packages (@aigne/*)
pnpm lint                 # Run biome + per-package linting
pnpm lint:fix             # Auto-fix lint issues
pnpm test                 # Run all tests
pnpm test:coverage        # Run tests with coverage

# Per-package commands (from package directory)
pnpm test                 # Run package tests (uses bun test)
pnpm build                # Build single package
```

### Running a Single Test
```bash
cd packages/core && bun --cwd test test <test-file>.test.ts
```

### Running Examples
```bash
cd examples/<example-name> && bun <script-name>.ts
```

## Tooling

- **Package manager**: pnpm with workspaces
- **Runtime**: bun (for scripts, examples, and tests)
- **Linting/Formatting**: Biome - run `pnpm lint:fix` before committing
- **Testing**: bun:test

## Architecture Overview

AIGNE Framework is a functional AI application framework with multi-model support and pluggable workflow patterns.

### Core Concepts

**AIGNE** (`packages/core/src/aigne/aigne.ts`) - Central orchestrator that coordinates agents, manages execution context, and handles message passing between agents.

**Agent** (`packages/core/src/agents/agent.ts`) - Base class for all processing units. Key agent types:
- `AIAgent` - LLM-powered agent with instructions, skills, input/output key mapping
- `TeamAgent` - Orchestrates multiple agents in sequential, parallel, or reflection modes
- `MCPAgent` - Integrates with Model Context Protocol servers
- `TransformAgent` - Transforms data without LLM calls
- `GuideRailAgent` - Validates inputs/outputs against rules

**Workflow Patterns** (via `TeamAgent` ProcessMode):
- `sequential` - Pipeline processing, output flows to next agent
- `parallel` - Concurrent execution, results merged
- Reflection mode - Iterative refinement with reviewer agent

### Package Structure

```
packages/
├── core/            # AIGNE, agents, prompts, memory, utilities
├── cli/             # Command-line interface
├── agent-library/   # Pre-built specialized agents
└── transport/       # Communication protocols

models/              # LLM provider implementations
├── openai/          # OpenAI API
├── anthropic/       # Anthropic/Claude API
├── gemini/          # Google Gemini
├── bedrock/         # AWS Bedrock
├── ollama/          # Local models via Ollama
└── ...              # deepseek, xai, open-router, etc.

afs/                 # Agentic File System modules
├── core/            # AFS base implementation
├── history/         # Conversation history storage
├── local-fs/        # Local filesystem access
├── user-profile-memory/ # User profile persistence
└── sqlite/          # SQLite storage backend

examples/            # Reference implementations for each workflow pattern
```

### Key Patterns

**Agent Creation** - Use `AIAgent.from()` static method:
```typescript
const agent = AIAgent.from({
  name: "AgentName",
  instructions: "System prompt",
  skills: [functionOrAgent],
  inputKey: "message",      // Extract from input
  outputKey: "response",    // Key for text output
});
```

**Skill Registration** - Functions or agents can be skills:
```typescript
function myTool(params: { query: string }) { return { result: "..." }; }
const agent = AIAgent.from({ skills: [myTool, otherAgent] });
```

**Agent Handoff** - Return another agent to transfer control:
```typescript
function transferToSpecialist() { return specialistAgent; }
```

**AFS Integration** - Virtual filesystem for agent data access:
```typescript
const afs = new AFS();
afs.mount(new AFSHistory({ storage: { url: "file:./memory.sqlite3" } }));
afs.mount(new LocalFS({ localPath: "/docs" }));
```

## Coverage Handling

This repo has special handling for Bun's coverage gap where only files imported during test execution are tracked, leading to artificially high coverage percentages for untested files.

### coverage.test.ts Pattern

Each package contains a `test/coverage.test.ts` file that imports all source modules:

```typescript
import { test } from "bun:test";
import { importAllModules } from "../../../scripts/test-utils/import-all-modules.ts";

test("import all modules for coverage tracking", async () => {
  await importAllModules("../src");
});
```

When adding a new package, create this file to ensure accurate coverage metrics.

### Post-Processing Coverage Reports

After running coverage, clean the lcov reports to remove build artifacts:

```bash
node scripts/clean-coverage.cjs --all
```

This removes entries for `lib/`, `dist/`, `node_modules/`, test infrastructure, and `.d.ts` files from lcov.info files (workaround for Bun's incomplete `coveragePathIgnorePatterns`).

### Configuration Files

- `bunfig.toml` - Bun test coverage ignore patterns
- `codecov.yml` - Codecov reporting configuration
- `scripts/clean-coverage.cjs` - lcov post-processor
