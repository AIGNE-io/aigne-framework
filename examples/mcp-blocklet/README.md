# MCP Blocklet Demo

This demo demonstrates how to use [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) and MCP to interact with apps hosted on the [Blocklet platform](https://github.com/blocklet).

## Prerequisites

- [Node.js](https://nodejs.org) and npm installed on your machine
- An [OpenAI API key](https://platform.openai.com/api-keys) for interacting with OpenAI's services
- Optional dependencies (if running the example from source code):
  - [Bun](https://bun.sh) for running unit tests & examples
  - [Pnpm](https://pnpm.io) for package management

## Quick Start (No Installation Required)

```bash
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY # Set your OpenAI API key

npx -y @aigne/example-mcp-blocklet # Run the example
```

## Installation

### Clone the Repository

```bash
git clone https://github.com/AIGNE-io/aigne-framework
```

### Install Dependencies

```bash
cd aigne-framework/examples/mcp-blocklet

pnpm install
```

### Setup Environment Variables

Setup your OpenAI API key in the `.env.local` file:

```bash
OPENAI_API_KEY="" # Set your OpenAI API key here
BLOCKLET_APP_URL="" # Set your Blocklet app URL here
```

### Run the Example

```bash
pnpm start
```

## License

This project is licensed under the MIT License.
