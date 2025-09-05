---
labels: ["Reference"]
---

# Core Concepts

To build effectively with AIGNE, it's essential to understand the fundamental components of a project. This section introduces the key concepts: the project structure anchored by `aigne.yaml`, and the executable units known as Agents and Skills. These elements work together to create modular and capable AI applications.

```d2
direction: down

AIGNE-Project: {
  shape: package
  label: "AIGNE Project"

  aigne-yaml: {
    shape: document
    label: "aigne.yaml\n(Project Manifest)"
  }

  Agents: {
    shape: package
    chat-yaml: {
      shape: document
      label: "chat.yaml"
    }
  }

  Skills: {
    shape: package
    sandbox-js: {
      shape: document
      label: "sandbox.js"
    }
  }

  aigne-yaml -> Agents.chat-yaml: "Registers"
  aigne-yaml -> Skills.sandbox-js: "Registers"
  Agents.chat-yaml -> Skills.sandbox-js: "Uses"
}
```

## Project Structure and Configuration

The `aigne.yaml` file is the central manifest of every AIGNE project. It serves as the single source of truth for configuration, defining project metadata, specifying the default chat model, and registering all agents and skills. By managing these relationships in one place, `aigne.yaml` provides a clear and organized structure for complex projects.

For a complete breakdown of all available properties and configuration options, see the [Project Configuration (aigne.yaml)](./core-concepts-project-configuration.md) documentation.

## Agents and Skills

Agents and Skills are the primary executable components in an AIGNE project. They represent the logic and capabilities of your AI application.

### Agents
An **Agent** is an entity designed to perform tasks. It is defined by a set of instructions, can maintain a memory of its interactions, and utilizes one or more Skills to accomplish its goals. Agents are typically defined in their own YAML files (e.g., `chat.yaml`), which specify their behavior and the tools they have access to.

### Skills
A **Skill** is a reusable tool or function that an Agent can call upon. Skills provide specific, encapsulated capabilities, such as executing JavaScript code (`sandbox.js`) or interacting with a filesystem. This modular approach allows you to compose complex agent behaviors from simple, reusable, and testable components.

Here is an example of the default `chat` agent running, which uses its skills to respond to user input:

![An agent running in chat mode](../assets/run/run-default-template-project-in-chat-mode.png)

To learn how to define and structure these components, see the detailed [Agents and Skills](./core-concepts-agents-and-skills.md) guide.

## Next Steps

With a grasp of these core concepts, you are ready to explore the specifics of project configuration and how to build your own agents and skills. The following sections provide in-depth details for each component.

<x-cards data-columns="2">
  <x-card data-title="Project Configuration (aigne.yaml)" data-icon="lucide:file-cog" data-href="/core-concepts/project-configuration">
    Dive into the details of the main project configuration file and its properties.
  </x-card>
  <x-card data-title="Agents and Skills" data-icon="lucide:bot" data-href="/core-concepts/agents-and-skills">
    Learn the specifics of defining and creating the core executable components of your project.
  </x-card>
</x-cards>