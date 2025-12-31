# Memory Example

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

This example demonstrates how to create a chatbot with **long-term memory** using the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework). The chatbot can remember user information across conversations and recall details shared in previous interactions.

The example uses two powerful AFS (Agentic File System) modules:
- **AFSHistory**: Automatically records all conversations for context
- **UserProfileMemory**: Intelligently extracts and stores user information (name, interests, location, etc.)

**Agentic File System (AFS)** is a virtual file system abstraction that provides AI agents with unified access to various storage backends. For comprehensive documentation, see [AFS Documentation](../../afs/README.md).

## Prerequisites

* [Node.js](https://nodejs.org) (>=20.0) and npm installed on your machine
* An [OpenAI API key](https://platform.openai.com/api-keys) for interacting with OpenAI's services
* Optional dependencies (if running the example from source code):
  * [Pnpm](https://pnpm.io) for package management
  * [Bun](https://bun.sh) for running unit tests & examples

## Quick Start (No Installation Required)

```bash
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY # Set your OpenAI API key

# First conversation - introduce yourself
npx -y @aigne/example-afs-memory --input "I'm Bob, and I like blue color"
# Response: Nice to meet you, Bob — I've saved that your favorite color is blue...

# Second conversation - the bot remembers you!
npx -y @aigne/example-afs-memory --input "Tell me all info about me you known"
# Response: Here's what I currently have stored about you:
#   * Name: Bob
#   * Interests / favorite color: blue

# Run in interactive chat mode
npx -y @aigne/example-afs-memory --interactive
```

### Connect to an AI Model

As an example, running `npx -y @aigne/example-afs-memory --input "I'm Bob, and I like blue color"` requires an AI model. If this is your first run, you need to connect one.

![run example](./run-example.png)

- Connect via the official AIGNE Hub

Choose the first option and your browser will open the official AIGNE Hub page. Follow the prompts to complete the connection. If you're a new user, the system automatically grants 400,000 tokens for you to use.

![connect to official aigne hub](../images/connect-to-aigne-hub.png)

- Connect via a self-hosted AIGNE Hub

Choose the second option, enter the URL of your self-hosted AIGNE Hub, and follow the prompts to complete the connection. If you need to set up a self-hosted AIGNE Hub, visit the Blocklet Store to install and deploy it: [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ?utm_source=www.arcblock.io&utm_medium=blog_link&utm_campaign=default&utm_content=store.blocklet.dev#:~:text=%F0%9F%9A%80%20Get%20Started%20in%20Minutes).

![connect to self hosted aigne hub](../images/connect-to-self-hosted-aigne-hub.png)

- Connect via a third-party model provider

Using OpenAI as an example, you can configure the provider's API key via environment variables. After configuration, run the example again:

```bash
export OPENAI_API_KEY="" # Set your OpenAI API key here
```
For more details on third-party model configuration (e.g., OpenAI, DeepSeek, Google Gemini), see [.env.local.example](./.env.local.example).

After configuration, run the example again.

### Debugging

The `aigne observe` command starts a local web server to monitor and analyze agent execution data. It provides a user-friendly interface to inspect traces, view detailed call information, and understand your agent’s behavior during runtime. This tool is essential for debugging, performance tuning, and gaining insight into how your agent processes information and interacts with tools and models.

Start the observation server.

![aigne-observe-execute](../images/aigne-observe-execute.png)

View a list of recent executions.

![aigne-observe-list](../images/aigne-observe-list.png)

## Installation

### Clone the Repository

```bash
git clone https://github.com/AIGNE-io/aigne-framework
```

### Install Dependencies

```bash
cd aigne-framework/examples/afs-memory

pnpm install
```

### Setup Environment Variables

Setup your OpenAI API key in the `.env.local` file:

```bash
OPENAI_API_KEY="" # Set your OpenAI API key here
```

#### Using Different Models

You can use different AI models by setting the `MODEL` environment variable along with the corresponding API key. The framework supports multiple providers:

* **OpenAI**: `MODEL="openai:gpt-4.1"` with `OPENAI_API_KEY`
* **Anthropic**: `MODEL="anthropic:claude-3-7-sonnet-latest"` with `ANTHROPIC_API_KEY`
* **Google Gemini**: `MODEL="gemini:gemini-2.0-flash"` with `GEMINI_API_KEY`
* **AWS Bedrock**: `MODEL="bedrock:us.amazon.nova-premier-v1:0"` with AWS credentials
* **DeepSeek**: `MODEL="deepseek:deepseek-chat"` with `DEEPSEEK_API_KEY`
* **OpenRouter**: `MODEL="openrouter:openai/gpt-4o"` with `OPEN_ROUTER_API_KEY`
* **xAI**: `MODEL="xai:grok-2-latest"` with `XAI_API_KEY`
* **Ollama**: `MODEL="ollama:llama3.2"` with `OLLAMA_DEFAULT_BASE_URL`

For detailed configuration examples, please refer to the `.env.local.example` file in this directory.

### Run the Example

```bash
# Run in interactive mode
pnpm start

# Run with a single message
pnpm start --input "I'm Bob, and I like blue color"
```

### Example Conversation Flow

```bash
# First conversation - introduce yourself
$ pnpm start --input "I'm Bob, and I like blue color"
Response: Nice to meet you, Bob — I've saved that your favorite color is blue.
If you'd like, I can remember more about you (location, hobbies, projects, etc.)...

# Second conversation - the bot remembers you!
$ pnpm start --input "Tell me all info about me you known"
Response: Here's what I currently have stored about you:
  * Name: Bob
  * Interests / favorite color: blue

Would you like to add or update anything (location, hobbies, projects, family, etc.)?
```

## How Memory Works

This example uses two complementary memory modules that work together to provide intelligent, personalized conversations:

### 1. AFSHistory Module - Conversation Context

**Purpose**: Records every conversation turn to provide recent context.

**How it works**:
- Automatically saves each user message and AI response pair
- Stores conversations with timestamps and unique IDs
- Enables the AI to reference recent conversations

**Example**:
```bash
# First conversation
$ pnpm start --input "I'm Bob, and I like blue color"
Response: Nice to meet you, Bob — I've saved that your favorite color is blue...

# The conversation is automatically saved to history.sqlite3
```

### 2. UserProfileMemory Module - User Information Extraction

**Purpose**: Intelligently extracts and stores structured user information from conversations.

**How it works**:
1. **Listens** to conversation history events
2. **Analyzes** each conversation using AI to identify user information
3. **Extracts** relevant details (name, interests, location, family, projects, etc.)
4. **Stores** in a structured JSON profile in user_profile.sqlite3
5. **Updates** incrementally using JSON Patch operations

**What it remembers**:
- Name and personal details
- Location (country, city, address)
- Interests and hobbies
- Family members and relationships
- Projects and work
- Languages spoken
- Birthday and other personal info

**Example**:
```bash
# After Bob introduces himself, the profile is automatically created:
{
  "name": [{ "name": "Bob" }],
  "interests": [{ "content": "blue color" }]
}

# In the next conversation, the bot can recall this information:
$ pnpm start --input "Tell me all info about me you known"
Response: Here's what I currently have stored about you:
  * Name: Bob
  * Interests / favorite color: blue
```

### 3. Memory Injection - How the AI Uses Memory

When you send a message, the system automatically:

**Step 1: Inject User Profile into System Prompt**
```text
You are a friendly chatbot

<related-memories>
User Profile Memory: This contains structured information about the user...

- name:
    - name: Bob
  interests:
    - content: blue color
</related-memories>
```

**Step 2: Add Recent Conversation History**
```json
[
  {
    "role": "system",
    "content": "You are a friendly chatbot... [profile injected here]"
  },
  {
    "role": "user",
    "content": "I'm Bob and I like blue color"
  },
  {
    "role": "assistant",
    "content": "Nice to meet you, Bob..."
  },
  {
    "role": "user",
    "content": "Tell me all info about me you known"
  }
]
```

**Step 3: AI Generates Personalized Response**

The AI can now:
- Address the user by name
- Reference their interests
- Provide personalized recommendations
- Maintain context across sessions

### Key Design Benefits

1. **Automatic**: No manual profile management needed
2. **Intelligent**: AI determines what's important to remember
3. **Incremental**: Profile updates gradually over time
4. **Persistent**: Memory survives across multiple conversations
5. **Structured**: Information is organized in a consistent format
6. **Privacy-Aware**: All data stored locally in SQLite

## Related Examples

- [AFS LocalFS Example](../afs-local-fs/README.md) - File system access with AI agents
- [AFS MCP Server Example](../afs-mcp-server/README.md) - Mount MCP servers as AFS modules

## Related Packages

- [@aigne/afs](../../afs/README.md) - AFS core package
- [@aigne/afs-user-profile-memory](../../afs/user-profile-memory/README.md) - User profile memory module

## TypeScript Support

This package includes full TypeScript type definitions.

## License

[MIT](../../LICENSE.md)
