# Getting Started

This guide will help you create your first AIGNE project and run an agent.

## Prerequisites

- Node.js (v18 or higher recommended)
- A package manager (npm, yarn, or pnpm)
- An API key for your preferred LLM provider (e.g., OPENAI_API_KEY)

## 1. Create a New Project

Use the `create` command to generate a new project structure:

```bash
aigne create my-first-agent
```

Follow the interactive prompts:
1.  **Project Name**: Confirm `my-first-agent` or enter a different name.
2.  **Template**: Select `default`.

The CLI will create the directory and install necessary files.

## 2. Configure Environment

Navigate to your project directory:
```bash
cd my-first-agent
```

Create a `.env` file (or copy `.env.example`) and add your API keys:
```bash
# .env
OPENAI_API_KEY=sk-...
```

## 3. Run the Agent

Start the agent in interactive chat mode:

```bash
aigne run --chat
```

This will launch the chat interface in your terminal where you can interact with your agent.

---
**Related:** [Command Reference](/commands/index.md)
