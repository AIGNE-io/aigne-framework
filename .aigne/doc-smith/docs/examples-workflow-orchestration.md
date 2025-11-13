# Workflow Orchestration

This document provides a technical walkthrough for building a sophisticated processing pipeline by coordinating multiple specialized AI agents. By following this example, you will learn to construct a workflow where an orchestrator agent delegates tasks—such as research, writing, and fact-checking—to a team of agents that work together to accomplish a complex goal.

## Overview

In this example, we create a multi-agent system designed to conduct in-depth research on a given topic and compile a detailed report. The workflow is managed by an `OrchestratorAgent`, which directs a team of specialized agents to perform specific sub-tasks in parallel.

The flow of information is as follows:

1.  An initial request is sent to the `Orchestrator` agent.
2.  The `Orchestrator` breaks down the request into tasks and distributes them to specialized agents like `Finder`, `Writer`, `Proofreader`, `Fact Checker`, and `Style Enforcer`.
3.  These agents execute their tasks concurrently. For instance, the `Finder` uses web scraping tools to gather information, while the `Writer` begins structuring the report.
4.  The outputs from all agents are sent to a `Synthesizer` agent.
5.  The `Synthesizer` consolidates the information and produces the final, comprehensive report.

This workflow can be visualized with the following diagram:```d2
direction: down

Request: {
  label: "Initial Request"
  shape: oval
}

Orchestrator: {
  label: "Orchestrator Agent"
  shape: rectangle
}

Specialized-Agents: {
  label: "Specialized Agents (Concurrent Execution)"
  shape: rectangle
  grid-columns: 3
  style: {
    stroke-dash: 2
  }

  Finder: {
    shape: rectangle
  }

  Writer: {
    shape: rectangle
  }

  Proofreader: {
    shape: rectangle
  }

  Fact-Checker: {
    label: "Fact Checker"
    shape: rectangle
  }

  Style-Enforcer: {
    label: "Style Enforcer"
    shape: rectangle
  }
}

Synthesizer: {
  label: "Synthesizer Agent"
  shape: rectangle
}

Report: {
  label: "Final Report"
  shape: oval
}

Request -> Orchestrator: "1. Send request"
Orchestrator -> Specialized-Agents: "2. Distribute tasks"
Specialized-Agents -> Synthesizer: "4. Send outputs"
Synthesizer -> Report: "5. Produce final report"
```

## Prerequisites

Before running the example, ensure the following requirements are met:

*   **Node.js**: Version 20.0 or higher must be installed.
*   **OpenAI API Key**: An API key is required for agents to interact with the language model. Obtain one from the [OpenAI API keys page](https://platform.openai.com/api-keys).

## Quick Start

You can run this example directly from the command line without a manual installation process using `npx`.

### Run the Example

The script can be executed in a default one-shot mode or an interactive chat mode.

```bash Run in one-shot mode icon=lucide:terminal
npx -y @aigne/example-workflow-orchestrator
```

```bash Run in interactive chat mode icon=lucide:terminal
npx -y @aigne/example-workflow-orchestrator --chat
```

Input can also be provided directly via a standard pipeline:

```bash Use pipeline input icon=lucide:terminal
echo "Research ArcBlock and compile a report about their products and architecture" | npx -y @aigne/example-workflow-orchestrator
```

### Connect to an AI Model

On the first run, the script will prompt you to connect to an AI model provider.

![Connect to a model provider](./run-example.png)

There are three connection options:

1.  **AIGNE Hub (Official)**: This is the recommended option. Your browser will open the official AIGNE Hub for you to log in and connect. New users receive a complimentary token grant.
2.  **AIGNE Hub (Self-Hosted)**: If you host your own instance of AIGNE Hub, select this option and enter its URL to establish a connection.
3.  **Third-Party Model Provider**: You can connect directly to a provider like OpenAI by configuring the appropriate environment variable with your API key.

To use OpenAI, for instance, set the `OPENAI_API_KEY` environment variable:

```bash Set OpenAI API Key icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

After configuring the model, execute the run command again.

## Installation from Source

For developers who wish to modify or inspect the source code, follow these steps to run the example from a local repository.

### 1. Clone the Repository

```bash Clone the repository icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. Install Dependencies

Navigate to the example's directory and install the required packages using `pnpm`.

```bash Install dependencies icon=lucide:terminal
cd aigne-framework/examples/workflow-orchestrator
pnpm install
```

### 3. Run the Example

Use the `pnpm start` command to execute the script from the source directory.

```bash Run in one-shot mode icon=lucide:terminal
pnpm start
```

To run in interactive chat mode, add the `--chat` flag. The extra `--` is necessary to pass arguments through the `pnpm` script runner.

```bash Run in interactive chat mode icon=lucide:terminal
pnpm start -- --chat
```

## Code Implementation

The following TypeScript code demonstrates how to define and orchestrate the team of agents. It initializes two specialized agents—a `finder` and a `writer`—and uses an `OrchestratorAgent` to manage their execution.

The `finder` agent is equipped with `puppeteer` and `filesystem` skills, enabling it to browse the web and save information. The `writer` agent is responsible for compiling the final report and writing it to the filesystem.

```typescript orchestrator-workflow.ts icon=logos:typescript
import { OrchestratorAgent } from "@aigne/agent-library/orchestrator/index.js";
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
  modelOptions: {
    parallelToolCalls: false, // puppeteer can only run one task at a time
  },
});

const puppeteer = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-puppeteer"],
  env: process.env as Record<string, string>,
});

const filesystem = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem", import.meta.dir],
});

const finder = AIAgent.from({
  name: "finder",
  description: "Find the closest match to a user's request",
  instructions: `You are an agent that can find information on the web.
You are tasked with finding the closest match to the user's request.
You can use puppeteer to scrape the web for information.
You can also use the filesystem to save the information you find.

Rules:
- do not use screenshot of puppeteer
- use document.body.innerText to get the text content of a page
- if you want a url to some page, you should get all link and it's title of current(home) page,
then you can use the title to search the url of the page you want to visit.
  `,
  skills: [puppeteer, filesystem],
});

const writer = AIAgent.from({
  name: "writer",
  description: "Write to the filesystem",
  instructions: `You are an agent that can write to the filesystem.
  You are tasked with taking the user's input, addressing it, and
  writing the result to disk in the appropriate location.`,
  skills: [filesystem],
});

const agent = OrchestratorAgent.from({
  skills: [finder, writer],
  maxIterations: 3,
  tasksConcurrency: 1, // puppeteer can only run one task at a time
});

const aigne = new AIGNE({ model });

const result = await aigne.invoke(
  agent,
  `\
Conduct an in-depth research on ArcBlock using only the official website\
(avoid search engines or third-party sources) and compile a detailed report saved as arcblock.md. \
The report should include comprehensive insights into the company's products \
(with detailed research findings and links), technical architecture, and future plans.`,
);
console.log(result);
```

When invoked, the `AIGNE` instance passes the prompt to the `OrchestratorAgent`, which coordinates the `finder` and `writer` agents to produce the final report based on the provided instructions.

## Command-Line Options

The script accepts several command-line arguments to customize its behavior and the model's generation parameters.

| Parameter | Description | Default |
| :--- | :--- | :--- |
| `--chat` | Run in interactive chat mode. | Disabled |
| `--model <provider[:model]>` | Specify the AI model to use. Format is 'provider\[:model]'. Examples: 'openai' or 'openai:gpt-4o-mini'. | `openai` |
| `--temperature <value>` | Set the temperature for model generation. | Provider default |
| `--top-p <value>` | Set the top-p sampling value. | Provider default |
| `--presence-penalty <value>` | Set the presence penalty value. | Provider default |
| `--frequency-penalty <value>` | Set the frequency penalty value. | Provider default |
| `--log-level <level>` | Set the logging verbosity. Accepts `ERROR`, `WARN`, `INFO`, `DEBUG`, or `TRACE`. | `INFO` |
| `--input`, `-i <input>` | Specify input directly as a command-line argument. | None |

### Usage Example

```bash Set logging level icon=lucide:terminal
pnpm start -- --log-level DEBUG
```

## Debugging

To monitor and analyze agent executions, use the `aigne observe` command. This launches a local web server with a user-friendly interface to inspect traces, view detailed call information, and understand the agent's runtime behavior.

First, start the observation server in your terminal:
![Start aigne observe](../images/aigne-observe-execute.png)

The interface provides a list of recent executions. You can select an execution to drill down into its detailed traces.
![View execution list](../images/aigne-observe-list.png)

This tool is essential for debugging, performance tuning, and gaining insight into how agents process information and interact with models and tools.

## Summary

This example illustrates the functionality of the `OrchestratorAgent` in coordinating multiple specialized agents to solve a complex problem. By decomposing a large task into smaller, manageable sub-tasks and assigning them to agents with the appropriate skills, you can build robust and scalable AI-driven workflows.

To explore other workflow patterns, refer to the following examples:
<x-cards data-columns="2">
  <x-card data-title="Sequential Workflow" data-href="/examples/workflow-sequential" data-icon="lucide:arrow-right">Build step-by-step processing pipelines with guaranteed execution order.</x-card>
  <x-card data-title="Concurrent Workflow" data-href="/examples/workflow-concurrency" data-icon="lucide:git-compare-arrows">Optimize performance by processing multiple tasks simultaneously.</x-card>
</x-cards>