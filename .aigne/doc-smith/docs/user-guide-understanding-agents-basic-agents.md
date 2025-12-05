# Basic Agents

Think of a basic agent as a specialized digital assistant, like a helpful chatbot or a focused data entry clerk. Each agent is designed to perform one specific type of task and do it well. It operates based on a clear set of instructions, receives a specific input to work on, and produces a result.

These single-purpose agents are the fundamental building blocks of AIGNE. While simple on their own, they can be combined to handle much more complex workflows, which we will explore in the [Agent Teams](./user-guide-understanding-agents-agent-teams.md) section.

## The Anatomy of an Agent

Every basic agent, regardless of its function, is defined by a few core components. Understanding these parts helps clarify how an agent knows what to do.

<x-cards data-columns="2">
  <x-card data-title="Instructions" data-icon="lucide:book-marked">
    This is the agent's permanent rulebook or job description. It's a detailed guide that tells the agent who it is, what its purpose is, and how it should behave. For example, the instructions for a customer service agent might be: "You are a friendly and helpful assistant. Your goal is to answer customer questions accurately."
  </x-card>
  <x-card data-title="Input" data-icon="lucide:arrow-right-to-line">
    This is the specific piece of information or the task you give the agent at a particular moment. If the agent is a chatbot, the input would be the user's question, like "What are your business hours?".
  </x-card>
  <x-card data-title="Output" data-icon="lucide:arrow-left-from-line">
    This is the result the agent produces after processing the input according to its instructions. For the chatbot example, the output would be the answer: "Our business hours are from 9 AM to 5 PM, Monday to Friday."
  </x-card>
  <x-card data-title="Skills" data-icon="lucide:sparkles">
    These are special tools or abilities an agent can use to perform its task. For instance, a "Weather Agent" might have a skill that allows it to access real-time weather data from an external service.
  </x-card>
</x-cards>

## How an Agent Works

The process is straightforward. A user provides an input to an agent. The agent then consults its core instructions to understand the context and rules, uses any skills it might have if necessary, and generates an output.

<!-- DIAGRAM_IMAGE_START:flowchart:16:9 -->
![Basic Agents](assets/diagram/user-guide-understanding-agents-basic-agents-01.jpg)
<!-- DIAGRAM_IMAGE_END -->

## Example: A Simple Chat Agent

Let's look at a practical example of a "Chat Agent." This agent is designed to be a helpful assistant that answers questions. Its configuration would look something like this:

| Property | Value | Description |
| :--- | :--- | :--- |
| **Name** | `chat` | A simple identifier for the agent. |
| **Description** | `Chat agent` | A brief explanation of its purpose. |
| **Instructions**| `You are a helpful assistant...` | This tells the agent to be friendly and informative. |
| **Input Key** | `message` | The agent expects the user's question to be labeled as "message". |
| **Output Key** | `message` | The agent will label its answer as "message". |

When you send this agent an input like `message: "How does an agent work?"`, it follows its instructions to be helpful and provides a clear, informative answer based on its programming.

## Summary

A basic agent is a single-task digital worker defined by its instructions, the input it receives, and the output it produces. They are the essential, foundational components of AIGNE. While powerful for specific tasks, their true potential is unlocked when they are assembled into [Agent Teams](./user-guide-understanding-agents-agent-teams.md) to tackle more complex challenges.