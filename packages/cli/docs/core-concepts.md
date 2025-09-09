---
labels: ["Reference"]
---

# Core Concepts

An AIGNE project provides a structured environment for developing, testing, and deploying AI agents. At its heart, a project is a directory containing configuration files that define your agents, the skills they can use, and the language models they connect to. This section breaks down these fundamental building blocks.

## Project Structure

When you create a new project using `aigne create`, it scaffolds a standard directory structure to keep your components organized. A typical project looks like this:

```text Project Structure icon=mdi:folder-open
my-agent-project/
├── aigne.yaml        # The main project configuration file.
├── agents/           # Directory for agent definition files.
│   └── chat.yaml     # Example agent definition.
└── skills/           # Directory for skill implementation files.
    └── sandbox.js    # Example skill implementation.
```

This structure separates configuration (`aigne.yaml`, `agents/`) from implementation (`skills/`), making your project modular and easy to manage.

## How It All Fits Together

The following diagram illustrates the relationship between the core components of an AIGNE project. The central `aigne.yaml` file orchestrates everything, defining which agents exist, what skills they can use, and which AI model powers their intelligence.

```d2
direction: down

aigne-yaml: {
  label: "aigne.yaml"
  shape: rectangle
}

agent: {
  label: "Agent\n(e.g., chat.yaml)"
  shape: rectangle
}

skill: {
  label: "Skill\n(e.g., sandbox.js)"
  shape: rectangle
}

chat-model: {
  label: "Chat Model\n(e.g., gpt-4o-mini)"
  shape: cylinder
}

aigne-yaml -> agent: "Defines"
aigne-yaml -> skill: "Registers"
aigne-yaml -> chat-model: "Configures"
agent -> skill: "Uses"
agent -> chat-model: "Communicates with"
```

To understand how an AIGNE project works, it's essential to grasp its two primary components: the central project configuration and the executable agents and skills. Explore them in more detail below.

<x-cards>
  <x-card data-title="Project Configuration (aigne.yaml)" data-icon="lucide:file-cog" data-href="/core-concepts/project-configuration">
    This is the main manifest for your project. It defines the chat model to be used, lists the available agents, and registers the skills that those agents can access.
  </x-card>
  <x-card data-title="Agents and Skills" data-icon="lucide:bot" data-href="/core-concepts/agents-and-skills">
    Agents are the core actors that perform tasks, defined by their instructions and capabilities. Skills are the tools agents use, implemented as functions (e.g., JavaScript modules) that provide specific functionalities.
  </x-card>
</x-cards>

---

With this foundational understanding, you're ready to dive deeper into how to configure your project.

**Next**: Learn more about the main configuration file in the [Project Configuration (aigne.yaml)](./core-concepts-project-configuration.md) guide.