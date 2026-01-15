# AFSGit

**AFSGit** is an AFS (Agentic File System) module that provides access to Git repository contents through a virtual file system interface. It allows AI agents to navigate different branches, read files, search content, and optionally make modifications using Git worktrees.

## Features

- **Branch Navigation**: Access all branches as top-level directories
- **Read Operations**: Read files using efficient git commands (no worktree needed)
- **Directory Listing**: List files recursively with depth control
- **Search**: Search content across branches using git grep
- **Write Operations**: Modify files with automatic git worktree management
- **Auto-commit**: Optional automatic commits for write operations
- **No Workspace Pollution**: Uses git worktrees for modifications, keeping main repository clean

## Installation

```bash
npm install @aigne/afs-git
```

## Usage

### Basic Setup (Read-Only)

```typescript
import { AFS } from "@aigne/afs";
import { AFSGit } from "@aigne/afs-git";

const afs = new AFS();

// Mount a git repository in read-only mode
afs.mount(new AFSGit({
  repoPath: '/path/to/repo',
  accessMode: 'readonly'  // default
}));
```

### Path Structure

```
/                              # Root - lists all branches
├── main/                      # Branch directory
│   ├── src/
│   │   └── index.ts          # Files accessible at /main/src/index.ts
│   ├── package.json
│   └── README.md
├── develop/                   # Another branch
│   └── ...
└── feature-auth/              # Feature branch
    └── ...
```

### Read-Only Operations

```typescript
// List all branches
const branches = await afs.list('/modules/git');
// Returns: ['/main', '/develop', '/feature-auth']

// List files in a branch
const files = await afs.list('/modules/git/main');
// Returns files at root of main branch

// List files recursively
const allFiles = await afs.list('/modules/git/main', { maxDepth: 10 });

// Read file content
const content = await afs.read('/modules/git/main/README.md');
console.log(content.data?.content);

// Search across branch
const results = await afs.search('/modules/git/main', 'TODO');
// Uses git grep for fast searching
```

### Read-Write Mode with Auto-Commit

```typescript
import { AFSGit } from "@aigne/afs-git";

const afsGit = new AFSGit({
  repoPath: '/path/to/repo',
  accessMode: 'readwrite',
  autoCommit: true,
  commitAuthor: {
    name: 'AI Agent',
    email: 'agent@example.com'
  }
});

afs.mount(afsGit);

// Write a new file (creates worktree automatically)
await afs.write('/modules/git/main/newfile.txt', {
  content: 'Hello World'
});
// Automatically committed with message "Update newfile.txt"

// Update existing file
await afs.write('/modules/git/main/src/index.ts', {
  content: updatedCode
});

// Delete file
await afs.delete('/modules/git/main/oldfile.txt');
// Automatically committed

// Rename/move file
await afs.rename('/modules/git/main/old.txt', '/modules/git/main/new.txt');
```

### Advanced Configuration

```typescript
const afsGit = new AFSGit({
  repoPath: '/path/to/repo',
  name: 'my-repo',
  description: 'My project repository',

  // Limit accessible branches
  branches: ['main', 'develop'],

  // Access control
  accessMode: 'readwrite',

  // Auto-commit settings
  autoCommit: true,
  commitAuthor: {
    name: 'AI Agent',
    email: 'agent@example.com'
  }
});

// Cleanup worktrees when done
await afsGit.cleanup();
```

## How It Works

### Read-Only Mode

In read-only mode, AFSGit uses direct git commands without creating worktrees:

- **List operations**: Uses `git ls-tree` to list files
- **Read operations**: Uses `git show` to read file content
- **Search operations**: Uses `git grep` for fast content search

This is extremely efficient as it doesn't require any file system operations.

### Read-Write Mode

When write operations are needed, AFSGit:

1. **Lazy Worktree Creation**: Creates a git worktree only when first write operation occurs
2. **Reuses Worktrees**: Subsequent operations on the same branch reuse the existing worktree
3. **Current Branch Optimization**: Uses main repository path for the currently checked-out branch
4. **Auto-commit**: Optionally commits each change automatically with descriptive messages

Worktrees are created in temporary directories and cleaned up when the module is unmounted.

## Configuration Options

### AFSGitOptions

```typescript
interface AFSGitOptions {
  // Required
  repoPath: string;              // Path to git repository

  // Optional
  name?: string;                 // Module name (default: repo basename)
  description?: string;          // Module description
  branches?: string[];           // Limit accessible branches
  accessMode?: 'readonly' | 'readwrite';  // Default: 'readonly'
  autoCommit?: boolean;          // Auto-commit changes (default: false)
  commitAuthor?: {               // Author for commits
    name: string;
    email: string;
  };
}
```

## Performance

- **Read operations**: Very fast, uses direct git commands
- **List operations**: Fast for shallow depths, may be slower for deep recursion
- **Search operations**: Fast, uses optimized git grep
- **Write operations**: First write to a branch creates worktree (slower), subsequent writes are fast

## Limitations

- Write operations are only supported on files, not directories
- Cannot write to root or branch root paths
- Cannot rename files across different branches
- Binary files are supported for read, but may require special handling for write

## Example: AI Agent Code Review

```typescript
import { AIGNE } from "@aigne/core";
import { AFS } from "@aigne/afs";
import { AFSGit } from "@aigne/afs-git";

const afs = new AFS();
afs.mount(new AFSGit({
  repoPath: process.cwd(),
  accessMode: 'readonly'
}));

const aigne = new AIGNE({});

// AI agent can now review code across branches
const agent = AIAgent.from({
  name: "CodeReviewer",
  instructions: "Review code and suggest improvements",
  afs
});

// Agent can list files, read code, search for patterns
await aigne.invoke(agent, {
  message: "Review the authentication code in src/auth/"
});
```

## License

This project is licensed under the [Elastic-2.0](../../LICENSE.md) License.
