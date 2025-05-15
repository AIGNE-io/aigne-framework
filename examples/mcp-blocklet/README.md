# MCP Blocklet Demo

This demo demonstrates how to use [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) and MCP to interact with apps hosted on the [Blocklet platform](https://github.com/blocklet). The example now supports both one-shot and interactive chat modes, along with customizable model settings and pipeline input/output.

## Prerequisites

- [Node.js](https://nodejs.org) and npm installed on your machine
- An [OpenAI API key](https://platform.openai.com/api-keys) for interacting with OpenAI's services
- Optional dependencies (if running the example from source code):
  - [Bun](https://bun.sh) for running unit tests & examples
  - [Pnpm](https://pnpm.io) for package management

## Quick Start (No Installation Required)

```bash
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY # Set your OpenAI API key

# Run in one-shot mode (default)
npx -y @aigne/example-mcp-blocklet

# Run in interactive chat mode
npx -y @aigne/example-mcp-blocklet --chat

# Use pipeline input
echo "What are the features of this blocklet app?" | npx -y @aigne/example-mcp-blocklet
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
pnpm start # Run in one-shot mode (default)
```

or

```bash
pnpm start https://your-blocklet-app-url
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
echo "What are the features of this blocklet app?" | pnpm start
```

## License

This project is licensed under the MIT License.
