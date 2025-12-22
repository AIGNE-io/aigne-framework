# Memory DID Spaces Example

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

This example demonstrates how to create a chatbot with DID Spaces memory capabilities using the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) and [AIGNE CLI](https://github.com/AIGNE-io/aigne-framework/blob/main/packages/cli/README.md). The example utilizes the `DIDSpacesMemory` plugin to provide persistence across chat sessions using DID Spaces.

## Prerequisites

* [Node.js](https://nodejs.org) (>=20.0) and npm installed on your machine
* An [OpenAI API key](https://platform.openai.com/api-keys) for interacting with OpenAI's services
* DID Spaces credentials for memory persistence
* Optional dependencies (if running the example from source code):
  * [Pnpm](https://pnpm.io) for package management
  * [Bun](https://bun.sh) for running unit tests & examples

## Quick Start (No Installation Required)

### Run the Example

```bash
# Run the memory test example
npx -y @aigne/example-memory-did-spaces
```

### Connect to an AI Model

As an example, running `npx -y @aigne/example-memory-did-spaces` requires an AI model. If this is your first run, you need to connect one.

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
cd aigne-framework/examples/memory-did-spaces

pnpm install
```

### Run the Example

```bash
pnpm start
```

The example will:

1. Test DID Spaces memory with 3 simple tests (store profile, recall preferences, create portfolio)
2. Display all results in the console with proper markdown formatting
3. Automatically save a complete markdown report file
4. Show you the filename where results are saved for easy viewing

## How DID Spaces Memory Works

This example uses the `DIDSpacesMemory` plugin from `@aigne/agent-library` to persist conversation history using DID Spaces. The memory is stored in a decentralized manner, allowing the chatbot to remember previous interactions across different chat sessions.

Key features of the DID Spaces memory implementation:

* Conversations are stored in DID Spaces for decentralized persistence
* The chatbot can recall previous interactions even after restarting
* Secure and private memory storage using DID technology
* You can test this by chatting with the bot, closing the session, and starting a new one

## Example Usage

The example demonstrates memory persistence by:

1. Storing user profile information (name, profession, investment preferences)
2. Recalling stored information in subsequent interactions
3. Creating personalized recommendations based on remembered data

All conversation history is persisted in DID Spaces across sessions.

## Configuration

The example uses a pre-configured DID Spaces endpoint and authentication. In a production environment, you would:

1. Set up your own DID Spaces instance
2. Configure proper authentication credentials
3. Update the URL and auth parameters in the code

```typescript
memory: new DIDSpacesMemory({
  url: "YOUR_DID_SPACES_URL",
  auth: {
    authorization: "Bearer YOUR_TOKEN",
  },
});
```
