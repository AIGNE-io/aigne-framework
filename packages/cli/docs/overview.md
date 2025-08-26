---
labels: ["Reference"]
---

# Overview

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/packages/cli/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/packages/cli/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/packages/cli/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>

  <center>Your command center for agent development</center>
</p>

`@aigne/cli` is the official command-line tool for the [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework). It provides a comprehensive suite of commands to streamline the entire lifecycle of agent development, from initial project creation to testing, deployment, and monitoring.

The CLI is designed to provide a structured and efficient workflow for building, testing, and serving AI agents. The following diagram illustrates a typical development cycle:

```mermaid
flowchart TD
    A["aigne create"] --> B["Develop Agents & Skills"];
    B --> C{"Local Iteration"};
    C -- "Run & Debug" --> D["aigne run"];
    C -- "Test" --> E["aigne test"];
    D --> B;
    E --> B;
    B --> F{"Ready for Integration?"};
    F -- "Expose as API" --> G["aigne serve-mcp"];
    F -- "Analyze Performance" --> H["aigne observe"];
    G --> I["Integrate with External Systems"];
    H --> B;
```

## Key Features

`@aigne/cli` equips you with the necessary tools to manage your agent projects effectively:

*   **Project Scaffolding**: Use [`aigne create`](./command-reference-create.md) to quickly set up a new AIGNE project with a standardized file structure and configuration.
*   **Interactive Agent Execution**: Run and test your agents in a local, interactive chat loop using [`aigne run`](./command-reference-run.md). This command supports executing agents from your local file system or directly from a remote URL.
*   **Automated Testing**: Use [`aigne test`](./command-reference-test.md) to run unit and integration tests for your agents and skills, ensuring code quality and reliability.
*   **API Server Deployment**: Expose your agents as a service with [`aigne serve-mcp`](./command-reference-serve-mcp.md). This command starts a server that conforms to the Model Context Protocol (MCP), allowing for standardized integration with external systems.
*   **Execution Observability**: Launch a local monitoring service with [`aigne observe`](./command-reference-observe.md) to view and analyze detailed execution traces of your agent's behavior, which simplifies debugging and optimization.
*   **Multi-Model Support**: Flexibly switch between different AI model providers like OpenAI, Claude, and XAI to find the best fit for your application's needs.

![Running an agent in chat mode](../assets/run/run-default-template-project-in-chat-mode.png)

---

Ready to get started? Proceed to the [Getting Started](./getting-started.md) guide to install the CLI and build your first agent.