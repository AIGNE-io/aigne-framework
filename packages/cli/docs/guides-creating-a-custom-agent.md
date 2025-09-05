---
labels: ["Reference"]
---

# Creating a Custom Agent

This guide provides a step-by-step tutorial on creating a new agent using JavaScript and integrating it as a reusable skill within your AIGNE project. Skills are the fundamental, executable components that can be orchestrated by higher-level agents to perform specific tasks.

Following this guide, you will learn to:
- Write a JavaScript function that acts as a skill.
- Define its interface using standard JSON schemas for input and output.
- Register the new skill in your project configuration.
- Test the skill directly and use it within a larger agent.

## How It Works: An Overview

Before diving in, it's helpful to understand how a custom skill fits into the AIGNE ecosystem. The diagram below illustrates the relationship between your custom skill file, the project configuration, and the AIGNE runtime engine. When you run your project, the engine loads your skill, making it available for the Large Language Model (LLM) to use when responding to user prompts.

```d2
direction: down

"AIGNE-Project-Structure": {
    label: "AIGNE Project Structure"
    shape: package

    "Configuration": {
        shape: document
        label: "aigne.yaml"
    }

    "Custom-Skill": {
        shape: document
        label: "skills/calculator.js"
    }

    "Agent": {
        shape: document
        label: "chat.yaml"
    }

    "Configuration" -> "Custom-Skill": "Registers"
    "Configuration" -> "Agent": "Provides skills to"
}

"Execution-Flow": {
    "User": {
        shape: person
    }
    
    "CLI": {
        label: "aigne run --chat"
        shape: rectangle
    }

    "AIGNE-Engine": {
        label: "AIGNE Engine"
        shape: hexagon
    }

    "LLM": {
        label: "LLM"
        shape: cloud
    }

    "User" -> "CLI": "1. Runs command"
    "CLI" -> "AIGNE-Engine": "2. Starts session"
    "AIGNE-Engine" -> "AIGNE-Project-Structure": "3. Loads project"
    "AIGNE-Engine" <-> "LLM": "4. Orchestrates"
    "LLM" -> "AIGNE-Project-Structure.Custom-Skill": "5. Selects & uses skill"
}

```

## Step 1: Create the JavaScript Skill File

First, create a new JavaScript file for your agent. It is a common practice to organize custom skills in a dedicated directory, such as `skills/`. We will create a simple agent that adds two numbers.

Create a file named `calculator.js` in a `skills/` directory within your project:

```javascript
// skills/calculator.js
export default async function calculator({ a, b }) {
  const result = a + b;
  return { result };
}
```

This file exports a single default asynchronous function. The function accepts an object with `a` and `b` properties and returns an object containing their sum in the `result` property.

## Step 2: Define Metadata and Schemas

For the AIGNE engine to understand how to use your skill, you must attach metadata to the function. This includes a `description`, an `input_schema`, and an `output_schema`.

Modify your `calculator.js` file to include these properties:

```javascript
// skills/calculator.js
export default async function calculator({ a, b }) {
  const result = a + b;
  return { result };
}

// A human-readable description of what the skill does.
calculator.description = "This skill calculates the sum of two numbers.";

// Defines the expected input structure using JSON Schema.
calculator.input_schema = {
  type: "object",
  properties: {
    a: { type: "number", description: "The first number" },
    b: { type: "number", description: "The second number" },
  },
  required: ["a", "b"],
};

// Defines the expected output structure using JSON Schema.
calculator.output_schema = {
  type: "object",
  properties: {
    result: { type: "number", description: "The sum of the two numbers" },
  },
  required: ["result"],
};
```

- **`description`**: A clear explanation of the skill's purpose. This helps language models understand when to use it.
- **`input_schema`**: A JSON Schema object that validates the input. It specifies that the input must be an object with two required number properties, `a` and `b`.
- **`output_schema`**: A JSON Schema object that describes the output. It specifies that the skill will return an object with a required number property called `result`.

## Step 3: Integrate the Skill into Your Project

Now that the skill is defined, you need to register it with your AIGNE project. Add the file path to the `skills` list in your `aigne.yaml` configuration file.

```yaml
# aigne.yaml

chat_model:
  provider: openai
  name: gpt-4o-mini
  temperature: 0.8
agents:
  - chat.yaml
skills:
  - sandbox.js
  - filesystem.yaml
  - skills/calculator.js # Add your new skill here
```

By adding `skills/calculator.js` to the `skills` list, it becomes available for use by any agent in the project, such as the default `chat.yaml` agent.

## Step 4: Test Your Skill

You can execute the skill directly from the command line using `aigne run`. This is useful for testing its logic in isolation before integrating it into a more complex workflow.

To run the `calculator` skill, provide the required inputs using the `--input` flag:

```bash
aigne run skills/calculator.js --input '{"a": 15, "b": 27}'
```

**Expected Output:**

The command will print the JSON output from your skill.

```json
{
  "result": 42
}
```

This confirms that your skill is working as expected. Now you can use it as part of a larger agent.

When you run the main chat agent, it will now be able to use your calculator to answer questions. Start a session with `aigne run --chat` and ask a question like "What is 25 + 75?" The agent will identify that the `calculator` skill can solve this and use it to provide the answer.

![Running a project in chat mode](../assets/run/run-default-template-project-in-chat-mode.png)
*The interactive chat session where you can test your new skill.*

---

## Next Steps

You have successfully created, integrated, and tested a custom JavaScript skill. This skill can now be composed into more complex workflows by other agents in your project.

- To learn more about how agents and skills are structured and interact, see the [Agents and Skills](./core-concepts-agents-and-skills.md) documentation.
- For more advanced execution options, refer to the [`aigne run`](./command-reference-run.md) command reference.