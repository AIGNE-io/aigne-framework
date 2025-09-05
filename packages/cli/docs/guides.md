---
labels: ["Reference"]
---

# Guides

This section provides practical, step-by-step tutorials to help you accomplish common development tasks with `@aigne/cli`. These guides are designed to give you hands-on experience with key workflows, from creating your first agent to deploying it for production use.

We recommend having a basic understanding of the topics covered in the [Core Concepts](./core-concepts.md) section before diving in.

The typical development lifecycle with `@aigne/cli` can be visualized as follows:

```d2
direction: down

# Define Shapes
Create-Project: {
  label: "1. Create Project\n(aigne create)"
  shape: rectangle
}

Develop-Agent: {
  label: "2. Develop Agent\n(Write JS/TS Code)"
  shape: rectangle
}

Local-Testing: {
  label: "3. Test Locally\n(aigne run & aigne test)"
  shape: rectangle
}

Deploy-Agent: {
  label: "4. Deploy Agent\n(aigne deploy)"
  shape: rectangle
}

Production-Service: {
  label: "Production Service\n(Blocklet)"
  shape: cylinder
}

Remote-Execution: {
  label: "Run Remotely\n(aigne run --url)"
  shape: rectangle
}


# Define Flow
Create-Project -> Develop-Agent: "Scaffold"
Develop-Agent -> Local-Testing: "Iterate & Test"
Local-Testing -> Develop-Agent: "Refine"

Local-Testing -> Deploy-Agent: "Ready for Production"
Deploy-Agent -> Production-Service: "Publish"

Local-Testing -> Remote-Execution: "Alternative Execution"
```

<x-cards>
  <x-card data-title="Creating a Custom Agent" data-href="/guides/creating-a-custom-agent" data-icon="lucide:file-plus-2">
    Learn how to build a custom agent from scratch. This guide covers scaffolding a new project using `aigne create`, defining agent logic in JavaScript, and integrating it as a skill within your `aigne.yaml` configuration.
  </x-card>
  <x-card data-title="Running Remote Agents" data-href="/guides/running-remote-agents" data-icon="lucide:globe">
    Discover how to execute AIGNE projects directly from a remote URL, such as a Git repository or a tarball. This guide covers the `aigne run --url` command, useful for testing and running agents without a local setup.
  </x-card>
  <x-card data-title="Deploying Agents" data-href="/guides/deploying-agents" data-icon="lucide:rocket">
    Take your AIGNE application from development to production. This guide walks you through the process of deploying your project as a Blocklet to a specified endpoint using the `aigne deploy` command, making your agent accessible as a service.
  </x-card>
</x-cards>

After following these guides, you will be more familiar with the core capabilities of `@aigne/cli`. For a comprehensive overview of all commands and their options, please refer to the [Command Reference](./command-reference.md).