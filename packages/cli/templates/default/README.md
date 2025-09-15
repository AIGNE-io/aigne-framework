# AIGNE Default Template

This is the default project template for the AIGNE framework, providing a basic chat agent and JavaScript code execution functionality.

## Template Structure

- `aigne.yaml` - Project configuration file that defines the chat model used and references to agents
- `chat.yaml` - Chat agent configuration, including agent instructions and skills used
- `sandbox.js` - JavaScript code execution tool for running JavaScript code within conversations
- `sandbox.test.js` - Test file to verify the functionality of the code execution tool

## Quick Start

### Install AIGNE CLI

```bash
npm install -g aigne
```

### Setup Environment Variables

Copy the `.env.local.example` file to `.env.local` and set your OpenAI API key:

```shell
# OpenAI
MODEL="openai:gpt-4.1"
OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

### Start the Project

```bash
aigne run --input "Hello, what can you help me with?"
```

use the following command to pipe input from the terminal:

```bash
echo "Hello, what can you help me with?" | aigne run
```

use the following command to start an interactive chat session:

```bash
aigne run --chat
```

help:

```bash
aigne run -h # show help of project

aigne run chat -h # show help of agent
```

## Testing

Run the following command to execute test cases:

```bash
aigne test
```
