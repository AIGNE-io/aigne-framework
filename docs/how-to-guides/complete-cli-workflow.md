# Complete AIGNE CLI Workflow Guide

This guide will take you through the complete AIGNE CLI workflow, from creating a project to configuring Agents, running and deploying services. Through this end-to-end process, you will master the complete skills of developing and deploying AI Agents using AIGNE CLI.

## Overview

AIGNE CLI provides a complete set of command-line tools that enable you to:

* 🚀 **Quick Project Creation** - Use `aigne create` to create new AIGNE projects
* ⚙️ **Configure Agents** - Define Agent behavior and capabilities through YAML files
* ▶️ **Run and Test** - Use `aigne run` to run Agents and perform interactive testing
* 🌐 **Deploy Services** - Use `aigne serve-mcp` to deploy Agents as MCP servers
* 📊 **Monitor and Observe** - Use `aigne observe` to monitor Agent runtime status

## Prerequisites

Before getting started, please ensure you have:

1. **Install Node.js** - Version v20 or higher
2. **Install AIGNE CLI** - Global installation of CLI tools
3. **Prepare API Keys** - Obtain API keys from your chosen AI model providers

### Install AIGNE CLI

```bash
npm install -g @aigne/cli
```

Verify installation:

```bash
aigne --version
```

## Create New Project

Use the `aigne create` command to create a new AIGNE project:

```bash
# Interactive project creation
aigne create

# Or specify project name
aigne create my-ai-assistant
```

After executing the command, the CLI will prompt you to enter the project name, then automatically create the project directory and basic configuration files.

### Project Structure

The created project contains the following basic structure:

```
my-ai-assistant/
├── aigne.yaml          # Main configuration file
├── chat.yaml           # Example Agent configuration
├── .env.local.example  # Environment variables example
└── README.md           # Project documentation
```

## Configure Environment Variables

Copy the environment variables example file and configure your API keys:

```bash
cd my-ai-assistant
cp .env.local.example .env.local
```

Edit the `.env.local` file and add your API keys:

```bash
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Or other model provider keys
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
# GOOGLE_API_KEY=your_google_api_key_here
```

## Configure Main Project File

Edit the `aigne.yaml` file to configure global project settings:

```yaml
# Configure default chat model
chat_model:
  provider: openai         # Model provider
  name: gpt-4o-mini        # Model name
  temperature: 0.7         # Control output randomness

# Specify Agent configuration files in the project
agents:
  - chat.yaml              # Basic chat Agent
  - poem.yaml              # Poetry creation Agent (optional)
```

## Create and Configure Agent

### Basic Agent Configuration

Edit the `chat.yaml` file to define your Agent:

```yaml
name: chat
description: Intelligent chat assistant
instructions: |
  You are a friendly, professional AI assistant. You can:
  - Answer various questions
  - Provide useful advice
  - Help solve problems
  - Engage in natural conversation

  Please always maintain a polite, accurate, and helpful attitude.
input_key: message
memory: true              # Enable conversation memory
```

### Advanced Agent Configuration

Create a more complex Agent, for example `poem.yaml`:

```yaml
name: poem
description: Poetry creation assistant
instructions: |
  You are a poetry creation expert. You can:
  - Create poems in various styles
  - Analyze and comment on poetry
  - Provide poetry creation techniques

  Please use expressive language and maintain poetic and artistic qualities.
  Please create a {{style}} style poem with the theme of {{topic}}.

# Define input data structure
input_schema:
  type: object
  properties:
    topic:
      type: string
      description: Poetry theme
    style:
      type: string
      description: Poetry style (such as modern, classical, etc.)
  required:
    - topic
    - style

memory: true
```

## Run Agent

### Basic Running

Use the `aigne run` command to run your Agent:

```bash
# Run default Agent
aigne run

# Run specific Agent
aigne run --entry-agent poem

# Enable chat mode for interaction
aigne run --chat
```

### Single Query Mode

```bash
# Directly provide input for single query
aigne run --input "Hello, please introduce yourself"

# Use specific model
aigne run --model openai:gpt-4.1 --input "Explain the basic concepts of machine learning"

# Use specific Agent and input
aigne run --entry-agent poem --input-topic "Spring" --input-style "Modern"
```

### Adjust Model Parameters

```bash
# Set lower temperature for more deterministic output
aigne run --temperature 0.2 --entry-agent poem --input-topic "Autumn" --input-style "Classical"
```

### Enable Debug Mode

```bash
# Enable verbose logging
aigne run --log-level debug --chat
```

## Start Monitoring Service

During development and testing, you can start the monitoring service to observe Agent runtime status:

```bash
# Start monitoring service (default port 7890)
aigne observe

# Use custom port
aigne observe --port 8080

# Public access
aigne observe --host 0.0.0.0
```

After the monitoring service starts, you can visit `http://localhost:7890` in your browser to view Agent runtime data and performance metrics.

## Deploy as MCP Server

When your Agent development is complete and tested, you can deploy it as an MCP server:

```bash
# Start MCP server (default port 3000)
aigne serve-mcp

# Use custom configuration
aigne serve-mcp --host 0.0.0.0 --port 8080 --pathname /api/agents
```

You can then connect to this server in MCP-supported clients for interaction and invocation (note that aigne serve-mcp only supports streamable http protocol).

## Summary

Through this guide, you have mastered the complete AIGNE CLI workflow. From project creation to production deployment, AIGNE CLI provides a complete toolchain that enables you to efficiently develop and deploy AI Agents.

Remember, successful AI Agent development requires:

* Clear requirement definition
* Reasonable architecture design
* Continuous monitoring and optimization

Now you can start building your own AI Agent projects! 🚀
