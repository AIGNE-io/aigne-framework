# Nano Banana

This document provides a step-by-step guide on how to create and run a chatbot with image generation capabilities using the AIGNE Framework. You will learn how to execute the example directly from the command line, connect it to various AI model providers, and debug its operation.

## Overview

The "Nano Banana" example demonstrates a practical application of the AIGNE Framework by combining a language model with an image generation model. An AI agent is configured to interpret a user's text prompt and produce a corresponding image. This example is designed for a quick start and can be run without any local installation.

The following diagram illustrates the workflow of the Nano Banana example, from user input to image generation:

```d2
direction: down

User: {
  shape: c4-person
}

CLI: {
  label: "CLI"
}

Nano-Banana-Example: {
  label: "Nano Banana Example\n(AI Agent)"
  shape: rectangle

  Language-Model: {
    label: "Language Model\n(Prompt Interpretation)"
    shape: rectangle
  }

  Image-Generation-Model: {
    label: "Image Generation Model\n(Image Creation)"
    shape: rectangle
  }
}

AI-Model-Provider: {
  label: "AI Model Provider\n(e.g., OpenAI)"
  shape: cylinder
}

User -> CLI: "1. Executes command\n(e.g., npx ... --input '...a cat')"
CLI -> Nano-Banana-Example: "2. Runs agent with text prompt"
Nano-Banana-Example.Language-Model -> AI-Model-Provider: "3. Processes prompt"
AI-Model-Provider -> Nano-Banana-Example.Image-Generation-Model: "4. Generates image based on processed prompt"
Nano-Banana-Example -> User: "5. Returns generated image"

```

## Prerequisites

To successfully run this example, the following components must be available on your system:

*   **Node.js**: Version 20.0 or later. Download from [nodejs.org](https://nodejs.org).
*   **npm**: Node Package Manager, which is included with the Node.js installation.
*   **AI Model Provider API Key**: Required for interacting with an AI service. An API key from a provider like [OpenAI](https://platform.openai.com/api-keys) is necessary.

## Quick Start (No Installation Required)

This example can be executed directly from your terminal using `npx`, which avoids the need for a local installation.

### Run with a Single Input

To generate an image based on a specific text prompt, use the `--input` flag. The command will execute once and output the result.

```bash Run with a single input icon=lucide:terminal
npx -y @aigne/example-nano-banana --input 'Draw an image of a lovely cat'
```

### Run in Interactive Chat Mode

For a continuous, conversational session, use the `--chat` flag. This will start an interactive mode where you can submit multiple prompts.

```bash Run in interactive mode icon=lucide:terminal
npx -y @aigne/example-nano-banana --chat
```

## Connecting to an AI Model

Upon first execution, the application will prompt you to connect to an AI model. There are several methods to establish this connection.

![A terminal prompt asks the user to select a connection method for an AI model.](/media/examples/nano-banana/run-example.png)

### 1. Connect via AIGNE Hub (Official)

This is the recommended method for new users.

1.  Select the first option to connect via the official AIGNE Hub.
2.  Your default web browser will open the AIGNE Hub connection page.
3.  Follow the on-screen instructions to complete the connection. New users are granted a number of free tokens for trial purposes.

![The AIGNE Hub connection page is displayed in a web browser.](/media/examples/images/connect-to-aigne-hub.png)

### 2. Connect via a Self-Hosted AIGNE Hub

If you or your organization operates a private AIGNE Hub instance, use this option.

1.  Choose the second option in the terminal.
2.  Enter the URL of your self-hosted AIGNE Hub when prompted.
3.  Follow the subsequent prompts to finalize the connection.

To deploy a self-hosted AIGNE Hub, you can install it from the [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ).

![The terminal prompts for the URL of a self-hosted AIGNE Hub.](/media/examples/images/connect-to-self-hosted-aigne-hub.png)

### 3. Connect via a Third-Party Model Provider

You can connect directly to a third-party model provider, such as OpenAI, by configuring an API key as an environment variable.

For example, to use OpenAI, set the `OPENAI_API_KEY` variable in your shell:

```bash Set OpenAI API key icon=lucide:terminal
export OPENAI_API_KEY="your-openai-api-key-here"
```

After setting the environment variable, execute the run command again. For details on configuring other providers, refer to the [Model Configuration](./models-configuration.md) guide.

## Installation and Local Execution

For users who wish to inspect or modify the source code, the example can be run from a local copy of the repository.

### 1. Clone the Repository

Use `git` to clone the AIGNE Framework repository to your local machine.

```bash Clone the repository icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. Install Dependencies

Navigate to the example's directory and use `pnpm` to install the required dependencies.

```bash Install dependencies icon=lucide:terminal
cd aigne-framework/examples/nano-banana
pnpm install
```

### 3. Run the Example

Execute the `start` script defined in the project to run the application.

```bash Run the local example icon=lucide:terminal
pnpm start
```

## Debugging

The AIGNE Framework includes `aigne observe`, a command-line tool that launches a local web server for monitoring and analyzing agent executions.

1.  **Start the Observation Server**: In your terminal, run the `aigne observe` command.

    ![The 'aigne observe' command is executed in a terminal.](/media/examples/images/aigne-observe-execute.png)

2.  **View Executions**: The command will output a URL. Open this URL in your browser to access the observation interface, which lists recent agent runs.

    ![The AIGNE Observe web interface shows a list of recent agent executions.](/media/examples/images/aigne-observe-list.png)

3.  **Inspect Execution Details**: Click on an execution to view its detailed trace, including calls to models and tools. This interface is invaluable for debugging, performance analysis, and understanding agent behavior.

## Summary

This guide has detailed the process for running an image-generating chatbot using the AIGNE Framework. You have learned how to execute the example with `npx`, connect to AI models, run from source, and utilize the `aigne observe` tool for debugging.

For further information on related topics, please consult the following documentation:

<x-cards data-columns="2">
  <x-card data-title="Image Agent" data-icon="lucide:image" data-href="/developer-guide/agents/image-agent">
    Learn more about the specific configurations for generating images.
  </x-card>
  <x-card data-title="AIGNE CLI" data-icon="lucide:terminal" data-href="https://github.com/AIGNE-io/aigne-framework/blob/main/packages/cli/README.md">
    Explore the full capabilities of the AIGNE command-line interface.
  </x-card>
</x-cards>