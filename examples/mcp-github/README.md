# GitHub MCP Server Integration

This is a demonstration of using [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) and [GitHub MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/github) to interact with GitHub repositories. The example now supports both one-shot and interactive chat modes, along with customizable model settings and pipeline input/output.

```mermaid
flowchart LR

in(In)
out(Out)
agent(AI Agent)
github(GitHub MCP Agent)
searchRepos(Search Repositories)
getContents(Get Contents)
createFile(Create/Update File)
issue(Issues & PRs)

in --> agent <--> github

subgraph MCP Agent
  github <--> searchRepos
  github <--> getContents
  github <--> createFile
  github <--> issue
end

agent --> out

classDef inputOutput fill:#f9f0ed,stroke:#debbae,stroke-width:2px,color:#b35b39,font-weight:bolder;
classDef processing fill:#F0F4EB,stroke:#C2D7A7,stroke-width:2px,color:#6B8F3C,font-weight:bolder;

class in inputOutput
class out inputOutput
class agent processing
class github processing
class searchRepos processing
class getContents processing
class createFile processing
class issue processing
```

Following is a sequence diagram of the workflow to search for repositories and access contents:

```mermaid
sequenceDiagram
participant User
participant AI as AI Agent
participant G as GitHub MCP Agent
participant SR as Search Repositories
participant GC as Get Contents

User ->> AI: Search for repositories related to 'modelcontextprotocol'
AI ->> G: Use search_repositories function
G ->> SR: Execute search with query='modelcontextprotocol'
SR ->> G: Return repository list results
G ->> AI: Formatted repository information
AI ->> User: Found these repositories: modelcontextprotocol/servers, etc.
User ->> AI: Get README from the servers repo
AI ->> G: Use get_file_contents function
G ->> GC: Access README.md in modelcontextprotocol/servers
GC ->> G: Return file content
G ->> AI: Formatted file content
AI ->> User: Here's the README content: ...
```

## Prerequisites

- [Node.js](https://nodejs.org) and npm installed on your machine
- An [OpenAI API key](https://platform.openai.com/api-keys) for interacting with OpenAI's services
- [GitHub Personal Access Token](https://github.com/settings/tokens) with appropriate permissions
- Optional dependencies (if running the example from source code):
  - [Bun](https://bun.sh) for running unit tests & examples
  - [Pnpm](https://pnpm.io) for package management

## Quick Start (No Installation Required)

```bash
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY # Set your OpenAI API key
export GITHUB_TOKEN=YOUR_GITHUB_TOKEN # Set your GitHub token

npx -y @aigne/example-mcp-github # Run the example
```

## Installation

### Clone the Repository

```bash
git clone https://github.com/AIGNE-io/aigne-framework
```

### Install Dependencies

```bash
cd aigne-framework/examples/mcp-github

pnpm install
```

### Setup Environment Variables

Setup your API keys in the `.env.local` file:

```bash
OPENAI_API_KEY="" # Set your OpenAI API key here
GITHUB_TOKEN="" # Set your GitHub Personal Access Token here
```

### Run the Example

```bash
pnpm start # Run in one-shot mode (default)

# Run in interactive chat mode
pnpm start -- --chat

# Use pipeline input
echo "Search for repositories related to 'modelcontextprotocol'" | pnpm start
```

### Run Options

The example supports the following command-line parameters:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--chat` | Run in interactive chat mode | Disabled (one-shot mode) |
| `--model-provider <provider>` | Model provider to use (e.g., openai, anthropic) | openai |
| `--model-name <model>` | Model name to use | gpt-4o-mini (for openai) |
| `--temperature <value>` | Temperature for model generation | Provider default |
| `--top-p <value>` | Top-p sampling value | Provider default |
| `--presence-penalty <value>` | Presence penalty value | Provider default |
| `--frequency-penalty <value>` | Frequency penalty value | Provider default |
| `--log-level <level>` | Set logging level (ERROR, WARN, INFO, DEBUG, TRACE) | INFO |
| `--input`, `-i <input>` | Specify input directly | None |

#### Examples

```bash
# Run in chat mode (interactive)
pnpm start -- --chat

# Set logging level
pnpm start -- --log-level DEBUG

# Use pipeline input
echo "Search for repositories related to 'modelcontextprotocol'" | pnpm start
```

## Example

The following example demonstrates how to use the GitHub MCP server to search for repositories:

```typescript
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

// Load environment variables
const { OPENAI_API_KEY, GITHUB_TOKEN } = process.env;

// Initialize OpenAI model
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// Initialize GitHub MCP agent
const githubMCPAgent = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-github"],
  env: {
    GITHUB_TOKEN,
  },
});

// Create AIGNE
const aigne = new AIGNE({
  model,
  skills: [githubMCPAgent],
});

// Create AI agent with GitHub-specific instructions
const agent = AIAgent.from({
  instructions: `\
## GitHub Interaction Assistant
You are an assistant that helps users interact with GitHub repositories.
You can perform various GitHub operations like:
1. Searching repositories
2. Getting file contents
3. Creating or updating files
4. Creating issues and pull requests
5. And many more GitHub operations

Always provide clear, concise responses with relevant information from GitHub.
`,
});

// Example: Search for repositories
const result = await aigne.invoke(
  agent,
  "Search for repositories related to 'modelcontextprotocol'"
);

console.log(result);
// Output:
// I found several repositories related to 'modelcontextprotocol':
//
// 1. **modelcontextprotocol/servers** - MCP servers for various APIs and services
// 2. **modelcontextprotocol/modelcontextprotocol** - The main ModelContextProtocol repository
// ...

// Shutdown the aigne when done
await aigne.shutdown();
```

## Available GitHub Operations

The GitHub MCP server provides a wide range of operations including:

1. **Repository Operations**:

   - Search repositories
   - Create repositories
   - Get repository information

2. **File Operations**:

   - Get file contents
   - Create or update files
   - Push multiple files in a single commit

3. **Issue and PR Operations**:

   - Create issues
   - Create pull requests
   - Add comments
   - Merge pull requests

4. **Search Operations**:

   - Search code
   - Search issues
   - Search users

5. **Commit Operations**:
   - List commits
   - Get commit details

## License

This project is licensed under the MIT License.
