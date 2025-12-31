---
labels: ["Reference"]
---

# Creating a Custom Agent

This guide provides a step-by-step tutorial on creating a new JavaScript agent and integrating it into your AIGNE project as a skill. Agents are the core executable components that give your application its unique capabilities. By creating custom agents, you can extend the functionality of your AI to perform specialized tasks, interact with external APIs, or manipulate local data.

### Prerequisites

Before you start, make sure you have an AIGNE project set up. If you don't, please follow our [Getting Started](./getting-started.md) guide to create one first.

### Step 1: Create the Skill File

A skill in AIGNE is a JavaScript module that exports a primary function and some metadata. This function contains the logic your agent will execute.

Let's create a simple agent that generates a greeting. Create a new file named `greeter.js` in the root of your AIGNE project and add the following code:

```javascript greeter.js icon=logos:javascript
export default async function greet({ name }) {
  const message = `Hello, ${name}!`;
  console.log(message);
  return { message };
}

greet.description = "A simple agent that returns a greeting message.";

greet.input_schema = {
  type: "object",
  properties: {
    name: { type: "string", description: "The name to include in the greeting." },
  },
  required: ["name"],
};

greet.output_schema = {
  type: "object",
  properties: {
    message: { type: "string", description: "The complete greeting message." },
  },
  required: ["message"],
};
```

Let's break down this file:

- **`export default async function greet({ name })`**: This is the main function of your agent. It takes a single object as an argument, which contains the inputs defined in `input_schema`. It returns an object that must conform to the constraints defined by the `output_schema`.
- **`greet.description`**: A plain-text description of what the agent does. This is crucial, as the main language model uses this description to understand when and how to use your tool.
- **`greet.input_schema`**: A JSON Schema object that defines the expected input for your agent. This ensures that data passed to your function is valid.
- **`greet.output_schema`**: A JSON Schema object that defines the expected output from your agent.

### Step 2: Integrate the Skill into Your Project

Now that you've created the skill, you need to register it in your project's configuration file so the main chat agent can use it.

1.  Open the `aigne.yaml` file in the root of your project.
2.  Add your new `greeter.js` file to the `skills` list.

```yaml aigne.yaml icon=mdi:file-cog-outline
chat_model:
  provider: openai
  name: gpt-4o-mini
  temperature: 0.8
agents:
  - chat.yaml
skills:
  - sandbox.js
  - filesystem.yaml
  - greeter.js # Add your new skill here
```

By adding your script to this list, you make it available as a tool that the primary chat agent can invoke during a conversation.

### Step 3: Test Your Agent Directly

With the skill created and registered, it's time to test it. You can execute any skill file directly from the command line using `aigne run`.

Run the following command in your terminal:

```bash icon=mdi:console
aigne run ./greeter.js --input '{"name": "AIGNE Developer"}'
```

This command executes your `greeter.js` script and passes the JSON string from the `--input` flag as an argument to the exported function. You should see the following output, confirming your agent works as expected:

```json icon=mdi:code-json
{
  "result": {
    "message": "Hello, AIGNE Developer!"
  }
}
```

### Step 4: Use Your Agent in Chat Mode

The real power of skills is unlocked when the main AI agent can decide to use them dynamically. To see this in action, run your project in interactive chat mode:

```bash icon=mdi:console
aigne run --interactive
```

Once the chat session starts, ask the AI to use your new tool. For example:

```
> Use the greeter skill to say hello to the world.
```

The AI will recognize the request, find the `greeter` skill based on its description, and execute it with the correct parameters. It will then use the output from your skill to formulate its response.

### Next Steps

Congratulations! You've successfully created a custom JavaScript agent, integrated it as a skill, and tested its functionality. You can now build more complex agents to connect to APIs, manage files, or perform any other task you can script.

To learn how to share your project with others, check out our guide on [Deploying Agents](./guides-deploying-agents.md).