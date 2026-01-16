# AFS Git Example

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

This example demonstrates how to create a chatbot that can interact with Git repositories using the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) and [AIGNE CLI](https://github.com/AIGNE-io/aigne-framework/blob/main/packages/cli/README.md). The example utilizes the `AFSGit` module to provide Git repository access to AI agents through the **AIGNE File System (AFS)** interface.

**AIGNE File System (AFS)** is a virtual file system abstraction that provides AI agents with unified access to various storage backends. For comprehensive documentation, see [AFS Documentation](../../afs/README.md).

## What You'll See

**User asks:** "What changed in the authentication code between main and develop?"

**Behind the scenes:**
1. LLM calls `afs_list` → lists branches (`/main`, `/develop`)
2. LLM calls `afs_read("/main/src/auth/index.ts")` → reads from main branch
3. LLM calls `afs_read("/develop/src/auth/index.ts")` → reads from develop branch
4. LLM compares and presents: "The develop branch added OAuth support with three new functions..."

**The power:** AI agents can intelligently navigate Git branches, compare code across versions, and search through repository history!

## Prerequisites

* [Node.js](https://nodejs.org) (>=20.0) and npm installed on your machine
* A Git repository to explore
* An [OpenAI API key](https://platform.openai.com/api-keys) for interacting with OpenAI's services
* Optional dependencies (if running the example from source code):
  * [Pnpm](https://pnpm.io) for package management
  * [Bun](https://bun.sh) for running unit tests & examples

## Quick Start (No Installation Required)

### Run the Example

```bash
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY

# Mount current Git repository (read-only by default)
npx -y @aigne/example-afs-git --interactive

# Mount a specific repository
npx -y @aigne/example-afs-git --path /path/to/repo --interactive

# Ask a specific question
npx -y @aigne/example-afs-git --input "What files changed in the last commit on main?"

# Limit to specific branches
npx -y @aigne/example-afs-git --branches main,develop --interactive

# Enable read-write mode with auto-commit
npx -y @aigne/example-afs-git --access-mode readwrite --auto-commit --interactive

# Read-write mode without auto-commit (manual commit control)
npx -y @aigne/example-afs-git --access-mode readwrite --interactive
```

## See It In Action

Here's what happens when you ask about code differences:

```
👤 You: "What changed in the authentication code between main and develop?"

🤖 Agent thinks: I should list the available branches first...
   → Calls: afs_list("/")

📁 Found branches:
   • /main
   • /develop
   • /feature-oauth

🤖 Agent thinks: Let me search for auth files in both branches...
   → Calls: afs_search("/main", "auth")
   → Calls: afs_search("/develop", "auth")

📄 Found files:
   • /main/src/auth/index.ts
   • /develop/src/auth/index.ts
   • /develop/src/auth/oauth.ts (new!)

🤖 Agent thinks: Let me read both versions...
   → Calls: afs_read("/main/src/auth/index.ts")
   → Calls: afs_read("/develop/src/auth/index.ts")

🤖 AI: "The develop branch has added OAuth support to the authentication system:

       Key Changes:
       • Added a new oauth.ts module with OAuth 2.0 flow
       • Updated index.ts with three new functions:
         - initOAuthFlow()
         - handleOAuthCallback()
         - refreshOAuthToken()
       • Added support for Google and GitHub providers

       The main branch still uses the original JWT-only authentication.
       Would you like me to explain how the OAuth flow works?"
```

**Key insight:** The agent can navigate between branches like directories, compare code, and identify what's new!

### Connect to an AI Model

As an example, running `npx -y @aigne/example-afs-git --input "What branches exist?"` requires an AI model. If this is your first run, you need to connect one.

- Connect via the official AIGNE Hub
- Connect via a self-hosted AIGNE Hub
- Connect via a third-party model provider (OpenAI, DeepSeek, etc.)

For detailed setup instructions, see [.env.local.example](./.env.local.example).

### Debugging

The `aigne observe` command starts a local web server to monitor and analyze agent execution data. It provides a user-friendly interface to inspect traces, view detailed call information, and understand your agent's behavior during runtime.

## Installation

### Clone the Repository

```bash
git clone https://github.com/AIGNE-io/aigne-framework
```

### Install Dependencies

```bash
cd aigne-framework/examples/afs-git

pnpm install
```

### Run the Example

```bash
# Run with current repository (read-only by default)
pnpm start

# Run with a specific repository
pnpm start --path /path/to/repo

# Run in interactive chat mode
pnpm start --interactive

# Limit to specific branches
pnpm start --branches main,develop --interactive

# Enable read-write mode with auto-commit
pnpm start --access-mode readwrite --auto-commit --interactive

# Read-write mode without auto-commit
pnpm start --access-mode readwrite --interactive
```

### Command Line Options

| Option | Description | Default | Example |
|--------|-------------|---------|---------|
| `--path` | Path to the git repository | Current directory | `--path /path/to/repo` |
| `--branches` | Comma-separated list of branches to access | All branches | `--branches main,develop` |
| `--access-mode` | Access mode: `readonly` or `readwrite` | `readonly` | `--access-mode readwrite` |
| `--auto-commit` | Automatically commit changes (requires `readwrite` mode) | `false` | `--auto-commit` |
| `--interactive` | Run in interactive chat mode | `false` | `--interactive` |
| `--input` | Single question to ask | - | `--input "What branches exist?"` |

## How It Works: 3 Simple Steps

### 1. Create AFSGit Module

```typescript
import { AFSGit } from "@aigne/afs-git";

const afsGit = new AFSGit({
  repoPath: process.cwd(),
  accessMode: 'readonly',  // or 'readwrite' for modifications
  branches: ['main', 'develop']  // optional: limit branches
});
```

### 2. Mount It as an AFS Module

```typescript
import { AFS } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";

const afs = new AFS()
  .mount(new AFSHistory({ storage: { url: ":memory:" } }))
  .mount(afsGit);  // Mounted at /modules/{repo-name}
```

### 3. Create an AI Agent

```typescript
import { AIAgent } from "@aigne/core";

const agent = AIAgent.from({
  instructions: "Help users navigate and understand Git repositories.",
  inputKey: "message",
  afs,  // Agent gets: afs_list, afs_read, afs_search
});
```

**That's it!** The agent can now intelligently navigate branches and search through repository files.

### What the Agent Can Do

**Read-Only Mode (default):**
- **`afs_list`** - List branches and files (with recursive depth control)
- **`afs_read`** - Read file contents from any branch
- **`afs_search`** - Fast search using git grep (regex support)

**Read-Write Mode:**
- **`afs_write`** - Create or modify files (uses git worktrees)
- **`afs_delete`** - Delete files with auto-commit
- **`afs_rename`** - Rename/move files with auto-commit

All operations use efficient git commands - no workspace pollution!

## Try These Examples

```bash
# List all branches
npx -y @aigne/example-afs-git --input "What branches exist?"

# Compare branches
npx -y @aigne/example-afs-git --input "What files are different between main and develop?"

# Search across branches
npx -y @aigne/example-afs-git --input "Find all TODO comments in the main branch"

# Code review
npx -y @aigne/example-afs-git --input "Review the authentication code in src/auth/"

# Interactive mode - ask follow-up questions
npx -y @aigne/example-afs-git --interactive
```

**In chat mode, try:**
- "What branches are available?"
- "Show me the README from the main branch"
- "Search for 'authentication' in the develop branch"
- "What files exist in /main/src?"
- "Compare the package.json between main and feature-oauth"
- "What TypeScript files changed recently?"

## Use Cases

### Code Review Assistance
Let AI help review code across branches:
```typescript
const afs = new AFS()
  .mount(new AFSGit({
    repoPath: './my-project',
    branches: ['main', 'feature-branch']
  }));
// Ask: "Review the changes in feature-branch compared to main"
```

### Multi-Branch Documentation
Access documentation from different versions:
```typescript
const afs = new AFS()
  .mount(new AFSGit({
    repoPath: './docs-repo',
    branches: ['v1.0', 'v2.0', 'latest']
  }));
// Ask: "What's the difference in API docs between v1.0 and v2.0?"
```

### Repository Analysis
Analyze code patterns across branches:
```typescript
const afs = new AFS()
  .mount(new AFSGit({
    repoPath: './codebase',
    accessMode: 'readonly'
  }));
// Ask: "Find all deprecated functions across all branches"
```

### Multi-Repository Access
Mount multiple repositories simultaneously:
```typescript
const afs = new AFS()
  .mount("/frontend", new AFSGit({ repoPath: './frontend' }))
  .mount("/backend", new AFSGit({ repoPath: './backend' }))
  .mount("/docs", new AFSGit({ repoPath: './docs' }));
// Agent can search across all repositories
```

### Automated Code Modifications (Read-Write Mode)
Let AI make commits with auto-commit:
```typescript
const afs = new AFS()
  .mount(new AFSGit({
    repoPath: './my-project',
    accessMode: 'readwrite',
    autoCommit: true,
    commitAuthor: {
      name: 'AI Agent',
      email: 'agent@example.com'
    }
  }));
// Ask: "Update the version in package.json to 2.0.0"
```

## Path Structure

```
/                              # Root - lists all branches
├── main/                      # Branch directory
│   ├── src/
│   │   └── index.ts          # Files: /main/src/index.ts
│   ├── package.json
│   └── README.md
├── develop/                   # Another branch
│   └── ...
└── feature-auth/              # Feature branch
    └── ...
```

## Advanced Features

### Branch Filtering
Only expose specific branches:
```typescript
const afsGit = new AFSGit({
  repoPath: './repo',
  branches: ['main', 'develop']  // Only these branches visible
});
```

### Read-Write with Manual Control
Make modifications without auto-commit:
```typescript
const afsGit = new AFSGit({
  repoPath: './repo',
  accessMode: 'readwrite',
  autoCommit: false  // Agent can write, you commit manually
});
```

### Efficient Search
Uses git grep for fast searching:
```typescript
// Agent automatically uses optimized git grep
await afsGit.search('/main/src', 'TODO');
// Much faster than reading every file!
```

## Related Examples

- [AFS LocalFS Example](../afs-local-fs/README.md) - Local file system access
- [AFS Memory Example](../afs-memory/README.md) - Conversational memory with user profiles
- [AFS MCP Server Example](../afs-mcp-server/README.md) - Integration with MCP servers

## Related Packages

- [@aigne/afs](../../afs/README.md) - AFS core package
- [@aigne/afs-git](../../afs/git/README.md) - AFSGit module documentation

## TypeScript Support

This package includes full TypeScript type definitions.

## License

[MIT](../../LICENSE.md)
