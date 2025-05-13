# @aigne/cli

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/cli)](https://www.npmjs.com/package/@aigne/cli)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/cli)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE)

**English** | [中文](README.zh.md)

Command-line tool for [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework), providing convenient development and management capabilities.

## Introduction

`@aigne/cli` is the official command-line tool for [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework), designed to simplify the development, testing, and deployment processes for AIGNE applications. It provides a series of useful commands to help developers quickly create projects, run agents, test code, and deploy applications.

## Features

- **Project Creation**: Quickly create new AIGNE projects with predefined file structures and configurations
- **Agent Running**: Easily run and test AIGNE agents
- **Testing Support**: Built-in test command for unit testing and integration testing
- **MCP Services**: Support for launching agents as MCP servers for integration with external systems
- **Interactive Interface**: Beautiful command-line interface providing an intuitive user experience
- **Multi-model Support**: Support for OpenAI, Claude, XAI, and other model providers

## Installation

### Using npm

```bash
npm install -g @aigne/cli
```

### Using yarn

```bash
yarn global add @aigne/cli
```

### Using pnpm

```bash
pnpm add -g @aigne/cli
```

## Basic Commands

AIGNE CLI provides the following main commands:

```bash
# Display help information
aigne --help

# Create a new project
aigne create [path]

# Run an agent
aigne run [path]

# Run tests
aigne test [path]

# Start MCP server
aigne serve [path] --mcp
```

## Create Command

Create a new AIGNE project with agent configuration files.

```bash
# Create a project in the current directory (will prompt for project name)
aigne create

# Create a project at the specified path
aigne create my-project
```

The interactive creation process will ask for:
- Project name
- Project template (currently supports the default template)

## Run Command

Launch a chat loop with the specified agent.

```bash
# Run the agent in the current directory
aigne run

# Run the agent at the specified path
aigne run path/to/agents

# Run the agent from a remote URL
aigne run https://example.com/aigne-project
```

Available options:
- `--agent <agent>` - Specify the agent name to use (defaults to the first agent found)
- `--download-dir <dir>` - Specify the directory to download the package to (used in URL mode)
- `--model-provider <provider>` - Specify the model provider (openai, claude, xai)
- `--model-name <model>` - Specify the model name
- `--verbose` - Enable verbose logging

## Test Command

Run tests in the specified agents directory.

```bash
# Test the agents in the current directory
aigne test

# Test the agents at the specified path
aigne test path/to/agents
```

## Serve Command

Serve the agents in the specified directory as a MCP server.

```bash
# Start MCP server on default port 3000
aigne serve --mcp

# Start MCP server on specified port
aigne serve --mcp --port 3001

# Start MCP server for agents at specified path
aigne serve path/to/agents --mcp
```

## License

Elastic-2.0
