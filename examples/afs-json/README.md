# AFS JSON Example

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

This example demonstrates how to create a chatbot that can interact with JSON and YAML files as a virtual file system using the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) and [AIGNE CLI](https://github.com/AIGNE-io/aigne-framework/blob/main/packages/cli/README.md). The example utilizes the `AFSJSON` module to provide JSON/YAML file access to AI agents through the **AIGNE File System (AFS)** interface.

**AIGNE File System (AFS)** is a virtual file system abstraction that provides AI agents with unified access to various storage backends. For comprehensive documentation, see [AFS Documentation](../../afs/README.md).

**Note:** The AFSJSON module supports both JSON and YAML formats. File format is automatically detected based on the file extension (.json, .yaml, .yml).

## What You'll See

**User asks:** "What's the email of the second user?"

**Behind the scenes:**
1. LLM calls `afs_list` → lists JSON structure as directories/files
2. Sees `/users` directory with `/users/0`, `/users/1`, `/users/2` subdirectories
3. LLM calls `afs_read("/users/1/email")` → reads the email property
4. LLM presents: "The email is alice@example.com"

**The power:** AI agents can navigate JSON structures as if they were directories, making complex data queries simple and intuitive!

## Prerequisites

* [Node.js](https://nodejs.org) (>=20.0) and npm installed on your machine
* A JSON or YAML file to explore
* An [OpenAI API key](https://platform.openai.com/api-keys) for interacting with OpenAI's services
* Optional dependencies (if running the example from source code):
  * [Pnpm](https://pnpm.io) for package management
  * [Bun](https://bun.sh) for running unit tests & examples

## Quick Start (No Installation Required)

### Run the Example

```bash
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY

# Mount a JSON file (read-write by default)
npx -y @aigne/example-afs-json --path ./config.json --interactive

# Mount a YAML file
npx -y @aigne/example-afs-json --path ./config.yaml --interactive

# Ask a specific question
npx -y @aigne/example-afs-json --path ./data.json --input "What users are in the JSON file?"

# YAML file example
npx -y @aigne/example-afs-json --path ./settings.yml --input "What's the database host?"

# Read-only mode (works with both JSON and YAML)
npx -y @aigne/example-afs-json --path ./config.json --access-mode readonly --interactive
```

## See It In Action

Here's what happens when you ask about JSON data:

```
Given JSON file (users.json):
{
  "users": [
    { "name": "Bob", "email": "bob@example.com", "age": 30 },
    { "name": "Alice", "email": "alice@example.com", "age": 25 },
    { "name": "Charlie", "email": "charlie@example.com", "age": 35 }
  ],
  "config": {
    "appName": "MyApp",
    "version": "1.0.0"
  }
}

👤 You: "What's the email of the second user?"

🤖 Agent thinks: Let me explore the JSON structure...
   → Calls: afs_list("/")

📁 Found structure:
   • /users (directory - array)
   • /config (directory - object)

🤖 Agent thinks: Users is an array, let me check its contents...
   → Calls: afs_list("/users")

📄 Found items:
   • /users/0 (first user)
   • /users/1 (second user)
   • /users/2 (third user)

🤖 Agent thinks: Let me read the email of the second user...
   → Calls: afs_read("/users/1/email")

🤖 AI: "The email of the second user is alice@example.com"
```

**Key insight:** JSON structures become navigable file systems - arrays are directories with numeric indices, objects are directories with property names!

### Connect to an AI Model

As an example, running `npx -y @aigne/example-afs-json --input "What's in this JSON?"` requires an AI model. If this is your first run, you need to connect one.

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
cd aigne-framework/examples/afs-json

pnpm install
```

### Run the Example

```bash
# Run with a JSON file
pnpm start --path ./data.json

# Run in interactive chat mode
pnpm start --path ./config.json --interactive

# Read-only mode (no modifications allowed)
pnpm start --path ./config.json --access-mode readonly --interactive
```

### Command Line Options

| Option | Description | Default | Example |
|--------|-------------|---------|---------|
| `--path` | Path to the JSON or YAML file | Required | `--path ./data.json` or `--path ./config.yaml` |
| `--access-mode` | Access mode: `readonly` or `readwrite` | `readwrite` | `--access-mode readonly` |
| `--interactive` | Run in interactive chat mode | `false` | `--interactive` |
| `--input` | Single question to ask | - | `--input "What's in this file?"` |

**Supported file formats:**
- `.json` - JSON files
- `.yaml` - YAML files
- `.yml` - YAML files

File format is automatically detected from the extension.

## How It Works: 3 Simple Steps

### 1. Create AFSJSON Module

```typescript
import { AFSJSON } from "@aigne/afs-json";

// Works with JSON files
const afsJson = new AFSJSON({
  jsonPath: './data.json',
  name: 'data',             // optional: module name
  accessMode: 'readwrite'   // or 'readonly'
});

// Also works with YAML files
const afsYaml = new AFSJSON({
  jsonPath: './config.yaml',  // or './config.yml'
  name: 'config',
  accessMode: 'readwrite'
});
```

### 2. Mount It as an AFS Module

```typescript
import { AFS } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";

const afs = new AFS()
  .mount(new AFSHistory({ storage: { url: ":memory:" } }))
  .mount(afsJson);  // Mounted at /modules/data
```

### 3. Create an AI Agent

```typescript
import { AIAgent } from "@aigne/core";

const agent = AIAgent.from({
  instructions: "Help users query and modify JSON data.",
  inputKey: "message",
  afs,  // Agent gets: afs_list, afs_read, afs_write, afs_search
});
```

**That's it!** The agent can now navigate JSON structures like a file system.

### What the Agent Can Do

**Read Operations:**
- **`afs_list`** - List JSON structure (objects/arrays as directories)
- **`afs_read`** - Read property values or nested structures
- **`afs_search`** - Search for values in the JSON

**Write Operations (readwrite mode):**
- **`afs_write`** - Update or create properties
- **`afs_delete`** - Delete properties or array elements
- **`afs_rename`** - Rename properties

All write operations automatically save to the file in its original format (JSON or YAML)!

## Path Structure

```json
// Given this JSON:
{
  "users": [
    { "name": "Bob", "email": "bob@example.com" },
    { "name": "Alice", "email": "alice@example.com" }
  ],
  "config": {
    "theme": "dark",
    "lang": "en"
  }
}

// Mapped to AFS paths:
/                           # Root
├── users/                  # Array (directory)
│   ├── 0/                  # First user (directory)
│   │   ├── name            # File: "Bob"
│   │   └── email           # File: "bob@example.com"
│   └── 1/                  # Second user (directory)
│       ├── name            # File: "Alice"
│       └── email           # File: "alice@example.com"
└── config/                 # Object (directory)
    ├── theme               # File: "dark"
    └── lang                # File: "en"
```

## Try These Examples

```bash
# Query user data (JSON)
npx -y @aigne/example-afs-json --path ./users.json --input "How many users are there?"

# Query YAML configuration
npx -y @aigne/example-afs-json --path ./config.yaml --input "What's the database host?"

# Read specific values
npx -y @aigne/example-afs-json --path ./config.json --input "What's the app version?"

# Search for values in YAML
npx -y @aigne/example-afs-json --path ./settings.yml --input "Find all email addresses"

# Update values (readwrite mode)
npx -y @aigne/example-afs-json --path ./config.json --input "Update the theme to light"

# Update YAML file
npx -y @aigne/example-afs-json --path ./config.yaml --input "Change the database port to 3306"

# Interactive mode - ask follow-up questions
npx -y @aigne/example-afs-json --path ./data.json --interactive
```

**In chat mode, try:**
- "What properties are in the root?"
- "Show me all users"
- "What's the email of the first user?"
- "List all configuration settings"
- "Update the version to 2.0.0"
- "Add a new user named David"

## Use Cases

### Configuration Management
Let AI help manage app configurations (JSON or YAML):
```typescript
// JSON configuration
const afs = new AFS()
  .mount(new AFSJSON({
    jsonPath: './config.json',
    accessMode: 'readwrite'
  }));

// YAML configuration (common in Kubernetes, Docker Compose)
const afs = new AFS()
  .mount(new AFSJSON({
    jsonPath: './config.yaml',
    accessMode: 'readwrite'
  }));
// Ask: "Update the database port to 5432"
```

### Data Analysis
Query complex JSON data structures:
```typescript
const afs = new AFS()
  .mount(new AFSJSON({
    jsonPath: './analytics.json',
    accessMode: 'readonly'
  }));
// Ask: "What's the total revenue for last month?"
```

### API Response Exploration
Navigate large API responses:
```typescript
const afs = new AFS()
  .mount(new AFSJSON({
    jsonPath: './api-response.json',
    accessMode: 'readonly'
  }));
// Ask: "Find all error messages in the response"
```

### Settings Editor
Interactive settings modification:
```typescript
const afs = new AFS()
  .mount(new AFSJSON({
    jsonPath: './user-settings.json',
    accessMode: 'readwrite'
  }));
// Ask: "Enable dark mode and set font size to 14"
```

### Multi-File Access
Mount multiple JSON and YAML files:
```typescript
const afs = new AFS()
  .mount("/users", new AFSJSON({ jsonPath: './users.json' }))
  .mount("/config", new AFSJSON({ jsonPath: './config.yaml' }))
  .mount("/data", new AFSJSON({ jsonPath: './data.json' }))
  .mount("/k8s", new AFSJSON({ jsonPath: './deployment.yml' }));
// Agent can query across all files regardless of format
```

## How JSON Maps to Paths

### Objects as Directories
```json
{ "name": "Bob", "age": 30 }
```
→ `/name` (file), `/age` (file)

### Arrays as Directories
```json
["apple", "banana", "orange"]
```
→ `/0` (file: "apple"), `/1` (file: "banana"), `/2` (file: "orange")

### Nested Structures
```json
{
  "user": {
    "profile": {
      "name": "Bob"
    }
  }
}
```
→ `/user/profile/name` (file: "Bob")

### Arrays of Objects
```json
{
  "users": [
    { "name": "Bob", "email": "bob@example.com" },
    { "name": "Alice", "email": "alice@example.com" }
  ]
}
```
→ `/users/0/name` (file: "Bob")
→ `/users/0/email` (file: "bob@example.com")
→ `/users/1/name` (file: "Alice")
→ `/users/1/email` (file: "alice@example.com")

## Advanced Features

### Read-Only Mode
Prevent accidental modifications:
```typescript
const afsJson = new AFSJSON({
  jsonPath: './config.json',
  accessMode: 'readonly'  // No write/delete operations allowed
});
```

### Auto-Save on Write
Changes are automatically saved to the JSON file:
```typescript
// When agent calls afs_write, the JSON file is updated immediately
await afs.write('/config/theme', { content: 'dark' });
// config.json is now updated with theme: "dark"
```

### Array Operations
AI can intelligently modify arrays:
```typescript
// Add new array element
// Ask: "Add a new user named David with email david@example.com"

// Delete array element (indices shift automatically)
// Ask: "Remove the second user"

// Update array element
// Ask: "Update the first user's email to newemail@example.com"
```

## Related Examples

- [AFS LocalFS Example](../afs-local-fs/README.md) - Local file system access
- [AFS Git Example](../afs-git/README.md) - Git repository access
- [AFS Memory Example](../afs-memory/README.md) - Conversational memory with user profiles
- [AFS MCP Server Example](../afs-mcp-server/README.md) - Integration with MCP servers

## Related Packages

- [@aigne/afs](../../afs/README.md) - AFS core package
- [@aigne/afs-json](../../afs/json/README.md) - AFSJSON module documentation

## TypeScript Support

This package includes full TypeScript type definitions.

## License

[MIT](../../LICENSE.md)
