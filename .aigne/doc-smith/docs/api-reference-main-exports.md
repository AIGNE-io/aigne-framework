# Main Exports

This section provides a comprehensive list of all top-level exports available directly from the `@aigne/core` package. These are the primary building blocks you will use when constructing your AI applications. Importing them is straightforward.

```typescript icon=logos:typescript
import { AIGNE, AIAgent, ChatModel, PromptBuilder } from '@aigne/core';
```

The following table details each export, categorized by its function within the framework.

| Export | Category | Description |
| :--- | :--- | :--- |
| **AIGNE** | Core Engine | The main class for orchestrating agents, managing context, and executing workflows. |
| **Context** | Core Engine | The central object for state management, passed between all agents in a workflow. |
| **Agent** | Agent Classes | The base class for creating all types of agents. |
| **AIAgent** | Agent Classes | An agent that interacts with a language model to perform tasks based on prompts. |
| **TeamAgent** | Agent Classes | An agent that orchestrates a group of other agents to work together. |
| **TransformAgent** | Agent Classes | An agent used to reshape and manipulate JSON data between other agents. |
| **ImageAgent** | Agent Classes | A specialized agent for generating images from text prompts using an image model. |
| **GuideRailAgent** | Agent Classes | An agent designed to enforce specific rules or constraints on the output of other agents. |
| **MCPAgent** | Agent Classes | The Master Control Program agent, responsible for high-level orchestration. |
| **UserAgent** | Agent Classes | An agent that represents and interacts with a human user. |
| **ChatModel** | Model Classes | A base class for creating integrations with various chat-based language models. |
| **ImageModel** | Model Classes | A base class for creating integrations with various image generation models. |
| **Model** | Model Classes | A foundational base class for all model types. |
| **MemoryAgent** | Memory | An agent that provides memory capabilities, allowing data to be stored and retrieved. |
| **Recorder** | Memory | A skill used by `MemoryAgent` to save information. |
| **Retriever** | Memory | A skill used by `MemoryAgent` to recall saved information. |
| **PromptBuilder** | Prompt Utilities | A utility for dynamically constructing complex prompts from templates and variables. |
| **Template** | Prompt Utilities | Represents a prompt template that can be processed by the `PromptBuilder`. |
| **parseJson** | Utilities | A utility function for safely parsing JSON strings. |
| **getRole** | Utilities | A utility function for handling and resolving roles within agent interactions. |
| **readStream** | Utilities | A utility function for reading and processing data streams. |
| **AgentOutput** | Types | A type definition for the standard output structure of an agent. |
| **AgentStream** | Types | A type definition for handling streaming outputs from agents. |