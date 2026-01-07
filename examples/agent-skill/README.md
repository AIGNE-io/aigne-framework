# Agent Skill Example

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

This example demonstrates how to create an AI agent with **custom Agent Skills** using the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework). Agent Skills are specialized capabilities that extend your agent's functionality, allowing it to perform specific tasks like writing assistance, code review, file organization, and more.

This example includes:
- **Custom Agent Skill**: A built-in Writing Helper for composing and improving text
- **Claude Code Skills Integration**: Access to official Claude Code Agent Skills from your local installation
- **Skill Management System**: Automatic discovery and loading of skills from multiple sources

## What's Included

### Custom Skills

#### Writing Helper (`writing-helper`)
A versatile writing assistant included in this example that helps with:
- **Writing from scratch**: Emails, letters, reports, social media posts, creative writing
- **Text improvement**: Grammar, clarity, conciseness, and flow
- **Tone transformation**: Make text more professional, casual, empathetic, or persuasive
- **Templates**: Ready-to-use formats for common writing tasks
- **Localization support**: Adapt writing style for different English variants

### Claude Code Skills Integration

This example also integrates with **Claude Code Agent Skills** if you have them installed. These are professional-grade skills maintained by Anthropic, including:

- **doc-coauthoring**: Structured workflow for co-authoring documentation
- **xlsx**: Comprehensive spreadsheet creation, editing, and analysis
- **pdf**: PDF manipulation toolkit for extracting, creating, and merging PDFs
- **pptx**: Presentation creation and editing
- **frontend-design**: Create distinctive, production-grade frontend interfaces
- **And many more**: See your `~/.claude/plugins/marketplaces/anthropic-agent-skills/skills` directory

The agent automatically discovers and loads skills from both sources:
1. Custom skills from the local `./skills` directory
2. Claude Code skills from `~/.claude/plugins/marketplaces/anthropic-agent-skills/skills`

## Prerequisites

* [Node.js](https://nodejs.org) (>=20.0) and npm installed on your machine
* An AI model connection (OpenAI, Anthropic, or AIGNE Hub)
* Optional dependencies (if running the example from source code):
  * [Pnpm](https://pnpm.io) for package management
  * [Bun](https://bun.sh) for running unit tests & examples
* Optional: [Claude Code](https://claude.ai/code) installed for access to official Agent Skills

## Quick Start (No Installation Required)

```bash
# Run the agent with skill manager (agent chooses the right skill)
npx -y @aigne/example-agent-skill --interactive

# Run with a specific task (agent auto-selects the appropriate skill)
npx -y @aigne/example-agent-skill --input "Write a professional email thanking my team"

# Explicitly invoke a specific skill using slash command
npx -y @aigne/example-agent-skill --input "/writing-helper Write a thank you note"

# Run a skill directly as a standalone agent (no agent wrapper)
npx -y aigne run ~/.claude/plugins/marketplaces/anthropic-agent-skills/skills/doc-coauthoring --interactive
```

### Connect to an AI Model

As an example, running `npx -y @aigne/example-agent-skill` requires an AI model. If this is your first run, you need to connect one.

![run example](../afs-memory/run-example.png)

- Connect via the official AIGNE Hub

Choose the first option and your browser will open the official AIGNE Hub page. Follow the prompts to complete the connection. If you're a new user, the system automatically grants 400,000 tokens for you to use.

![connect to official aigne hub](../images/connect-to-aigne-hub.png)

- Connect via a self-hosted AIGNE Hub

Choose the second option, enter the URL of your self-hosted AIGNE Hub, and follow the prompts to complete the connection. If you need to set up a self-hosted AIGNE Hub, visit the Blocklet Store to install and deploy it: [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ?utm_source=www.arcblock.io&utm_medium=blog_link&utm_campaign=default&utm_content=store.blocklet.dev#:~:text=%F0%9F%9A%80%20Get%20Started%20in%20Minutes).

![connect to self hosted aigne hub](../images/connect-to-self-hosted-aigne-hub.png)

- Connect via a third-party model provider

Using Anthropic as an example, you can configure the provider's API key via environment variables. After configuration, run the example again:

```bash
export ANTHROPIC_API_KEY="" # Set your Anthropic API key here
```
For more details on third-party model configuration (e.g., OpenAI, DeepSeek, Google Gemini), see [.env.local.example](./.env.local.example).

After configuration, run the example again.

### Debugging

The `aigne observe` command starts a local web server to monitor and analyze agent execution data. It provides a user-friendly interface to inspect traces, view detailed call information, and understand your agent's behavior during runtime. This tool is essential for debugging, performance tuning, and gaining insight into how your agent processes information and interacts with tools and models.

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
cd aigne-framework/examples/agent-skill

pnpm install
```

### Run the Example

```bash
# Run in interactive mode
pnpm start --interactive

# Run with a single message
pnpm start --input "Write a professional email thanking my team for completing the project"

# Explicitly invoke a specific skill using slash command
pnpm start --input "/writing-helper Write a thank you note to my mentor"
```

#### Using Slash Commands to Select Skills

When running the agent, you can explicitly choose which skill to use by prefixing your input with `/skill-name`:

```bash
# Use the writing-helper skill explicitly
pnpm start --input "/writing-helper Make this email more professional: Hey team, we did it!"

# Use a Claude Code skill (if installed)
pnpm start --input "/doc-coauthoring Help me write a technical specification document"

# In interactive mode, you can also use slash commands
pnpm start --interactive
> /writing-helper Write a formal invitation email
> /xlsx Create a budget spreadsheet with categories
```

**Benefits of using slash commands:**
- **Direct control**: Choose exactly which skill handles your request
- **Faster routing**: Skip the agent's skill selection process
- **Predictable results**: Know which skill's style and approach will be used
- **Mixed workflow**: Use different skills in the same conversation session

**When the agent auto-selects vs explicit skill invocation:**
- Without `/`: The agent analyzes your input and chooses the most appropriate skill
- With `/skill-name`: The specified skill is invoked directly with your remaining input

### Running Agent Skills as Standalone Agents

Agent Skills are not just tools for agents—they can also be run as **standalone agents** using the AIGNE CLI. This allows you to use a skill directly without configuring an agent wrapper.

#### Running a Skill Directory

You can run any Agent Skill directory directly by pointing to its path:

```bash
# Run the writing-helper skill as a standalone agent
aigne run ./skills/writing-helper --interactive

# Run with a single input
aigne run ./skills/writing-helper --input "Write a professional thank you email"

# Run a Claude Code skill (if installed)
aigne run ~/.claude/plugins/marketplaces/anthropic-agent-skills/skills/doc-coauthoring --interactive
```

#### How It Works

When you run a skill directory:
1. AIGNE CLI reads the `SKILL.md` file
2. The skill's instructions become the agent's system prompt
3. You interact directly with the skill as an agent
4. No agent routing or skill selection overhead

#### Benefits of Running Skills as Standalone Agents

- **Simplicity**: No need to configure an agent wrapper—just run the skill
- **Portability**: Skills are self-contained and can be shared as directories
- **Direct Control**: Interact with a specific skill without going through an agent manager
- **Fast Development**: Quickly test skills during development
- **Easy Distribution**: Share a skill directory and users can run it immediately

#### Example: Running the Writing Helper

```bash
# Navigate to the example directory
cd examples/agent-skill

# Run the writing-helper skill directly
aigne run ./skills/writing-helper --interactive

# The skill responds as a focused writing assistant
> Write a formal apology email to a client for a delayed delivery

[The skill generates the email immediately without routing through an agent]
```

#### When to Use This Approach

**Use as a standalone agent when:**
- You want to use a single, specific skill repeatedly
- You're developing and testing a new skill
- You want to distribute a skill for others to use directly
- You need predictable, focused behavior without agent decision-making

**Use within an agent when:**
- You want the agent to choose the right skill automatically
- You need multiple skills working together
- You want a conversational agent that can handle various tasks
- You need context sharing between different skill invocations

## How Agent Skills Work

Agent Skills extend your AI agent's capabilities by providing specialized knowledge and instructions for specific tasks. This example demonstrates two types of skills:

### 1. Custom Agent Skills (Local)

**Location**: `./skills/` directory in your project

**How it works**:
1. Create a directory for your skill (e.g., `./skills/writing-helper/`)
2. Add a `SKILL.md` file with front-matter metadata
3. The skill loader automatically discovers and registers it
4. The agent can invoke the skill as needed

**Skill Definition Format**:
```markdown
---
name: skill-name
description: Brief description of what this skill does
---

# Skill Title

Detailed instructions for the AI agent on how to use this skill...

## Capabilities
- Feature 1
- Feature 2

## Usage Examples
...
```

**Example**: The included `writing-helper` skill provides comprehensive writing assistance:
```yaml
# In chat.yaml, the skill is loaded from:
afs:
  modules:
    - module: local-fs
      options:
        agentSkills: true
        name: custom-skills
        localPath: ./skills
```

### 2. Claude Code Skills Integration

**Location**: `~/.claude/plugins/marketplaces/anthropic-agent-skills/skills/`

**How it works**:
1. Install [Claude Code](https://claude.ai/code) on your machine
2. Claude Code includes a marketplace of professional-grade skills
3. Configure the agent to load skills from the Claude Code directory
4. Skills are automatically discovered and made available to your agent

**Configuration**:
```yaml
# In chat.yaml
afs:
  modules:
    - module: local-fs
      options:
        agentSkills: true
        name: skills
        localPath: ~/.claude/plugins/marketplaces/anthropic-agent-skills/skills
        description: Contains Claude's official Agent Skills
```

**Available Claude Code Skills** (if installed):
- `doc-coauthoring`: Co-author documentation with structured workflows
- `xlsx`: Create and analyze spreadsheets with formulas
- `pdf`: Extract, create, and manipulate PDF documents
- `pptx`: Create and edit presentations
- `frontend-design`: Build production-grade web interfaces
- `canvas-design`: Create visual designs and posters
- `algorithmic-art`: Generate algorithmic art using p5.js
- And many more...

### 3. Skill Discovery and Loading

The agent uses the **Agent Skill Manager** to coordinate skills:

**Step 1: Configure AFS Modules**
```yaml
afs:
  modules:
    # Custom skills
    - module: local-fs
      options:
        agentSkills: true  # Mark this as a skills source
        name: custom-skills
        localPath: ./skills

    # Claude Code skills
    - module: local-fs
      options:
        agentSkills: true  # Mark this as a skills source
        name: skills
        localPath: ~/.claude/plugins/marketplaces/anthropic-agent-skills/skills
```

**Step 2: Automatic Discovery**
- The skill loader scans all AFS modules marked with `agentSkills: true`
- It searches for `SKILL.md` files recursively
- Each skill is parsed and registered with the agent

**Step 3: Skill Invocation**

There are two ways to invoke skills:

**Option A: Automatic Skill Selection**
```text
User: "Write a professional email"
  ↓
Agent analyzes request
  ↓
Agent identifies writing-helper skill is relevant
  ↓
Agent invokes skill with user's context
  ↓
Skill returns formatted response
  ↓
Agent presents result to user
```

**Option B: Explicit Skill Selection with Slash Commands**
```text
User: "/writing-helper Write a professional email"
  ↓
Agent detects slash command
  ↓
Agent directly invokes writing-helper skill
  ↓
Skill receives remaining input: "Write a professional email"
  ↓
Skill returns formatted response
  ↓
Agent presents result to user
```

**Key Difference:**
- **Without `/`**: Agent decides which skill to use based on your input
- **With `/skill-name`**: You explicitly choose which skill handles your request

### 4. Creating Your Own Skills

To add a new custom skill:

**Step 1: Create Skill Directory**
```bash
mkdir -p ./skills/my-skill
```

**Step 2: Create SKILL.md**
```bash
cat > ./skills/my-skill/SKILL.md << 'EOF'
---
name: my-skill
description: A brief description of what your skill does
---

# My Skill

You are an expert at [specific task]. Help users by:
- Capability 1
- Capability 2
- Capability 3

## Usage Guidelines
Provide clear instructions on how the AI should behave when using this skill...

## Examples
Show example interactions...
EOF
```

**Step 3: Run the Agent**
```bash
pnpm start --interactive
```

The skill is automatically discovered and available!

### Key Design Benefits

1. **Modular**: Skills are self-contained and reusable
2. **Discoverable**: Automatic registration without code changes
3. **Extensible**: Easy to add new skills without modifying the core agent
4. **Shareable**: Skills can be packaged and distributed
5. **Compatible**: Works with both custom and Claude Code skills
6. **Maintainable**: Each skill is independently documented and versioned

## Project Structure

```
examples/agent-skill/
├── aigne.yaml              # Main configuration
├── chat.yaml              # Agent configuration with skills
├── skills/                # Custom agent skills directory
│   └── writing-helper/    # Writing assistant skill
│       └── SKILL.md       # Skill definition
├── .aigne/               # Runtime data (history, cache)
├── .env.local.example    # Example environment configuration
└── package.json          # Dependencies and scripts
```

## Configuration

The agent is configured in [chat.yaml](chat.yaml) with:

### Agent Type
```yaml
type: "@aigne/agent-library/agent-skill-manager"
```
The Agent Skill Manager coordinates multiple skills and handles skill invocation.

### Built-in Skills
```yaml
skills:
  - type: "@aigne/agent-library/ask-user-question"
  - type: "@aigne/agent-library/bash"
    sandbox: false
    permissions:
      default_mode: ask
```

### AFS Modules for Skills
```yaml
afs:
  modules:
    # Custom skills from local directory
    - module: local-fs
      options:
        agentSkills: true
        name: custom-skills
        localPath: ./skills

    # Claude Code skills (if installed)
    - module: local-fs
      options:
        agentSkills: true
        name: skills
        localPath: ~/.claude/plugins/marketplaces/anthropic-agent-skills/skills
```

## License

[MIT](../../LICENSE.md)
