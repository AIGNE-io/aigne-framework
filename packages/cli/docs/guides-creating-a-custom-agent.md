# Creating a Custom Agent

This guide provides a step-by-step tutorial on creating a new agent using JavaScript and integrating it as a reusable skill within your AIGNE project. Skills are the fundamental executable components that can be orchestrated by higher-level agents.

Following this guide, you will learn to:
- Write a JavaScript function that acts as an agent.
- Define its interface using standard JSON schemas.
- Register the new agent as a skill in your project configuration.

---

## Step 1: Create the JavaScript Skill File

First, create a new JavaScript file for your agent. It's good practice to keep your skills in a dedicated directory, such as `skills/`. Let's create a simple agent that takes a name and returns a greeting.

Create a file named `greeter.js`:

```javascript
// skills/greeter.js
import vm from "node:vm";

export default async function greeter({ name }) {
  const result = `Hello, ${name}!`;
  return { greeting: result };
}
```

This file exports a single default asynchronous function. The function accepts an object with a `name` property and returns an object containing the `greeting`.

## Step 2: Define Metadata and Schemas

For the AIGNE engine to understand how to use your agent, you must attach metadata to the function. This includes a description, an input schema, and an output schema.

Modify your `greeter.js` file to include these properties:

```javascript
import vm from "node:vm";

export default async function greeter({ name }) {
  const result = `Hello, ${name}!`;
  return { greeting: result };
}

// A human-readable description of what the agent does.
greeter.description = "This agent generates a friendly greeting.";

// Defines the expected input structure.
greeter.input_schema = {
  type: "object",
  properties: {
    name: { type: "string", description: "The name of the person to greet" },
  },
  required: ["name"],
};

// Defines the expected output structure.
greeter.output_schema = {
  type: "object",
  properties: {
    greeting: { type: "string", description: "The resulting greeting message" },
  },
  required: ["greeting"],
};
```

- `description`: A clear, concise explanation of the agent's purpose.
- `input_schema`: A JSON Schema object that validates the input. It specifies that the input must be an object with a required string property called `name`.
- `output_schema`: A JSON Schema object that describes the output. It specifies that the agent will return an object with a required string property called `greeting`.

## Step 3: Integrate the Skill into Your Project

Now that you've created the skill, you need to make your AIGNE project aware of it. You do this by adding the file path to the `skills` list in your `aigne.yaml` configuration file.

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
  - greeter.js # Add your new skill here
```

By adding `greeter.js` to the `skills` list, it becomes available for use by any agent within the project.

## Step 4: Run Your Agent

With the skill created and registered, you can now execute it directly using the `aigne run` command. This is useful for testing your skill in isolation.

To run the `greeter` skill, you would use the following command, providing the required `name` input:

```bash
aigne run greeter.js --input '{"name": "World"}'
```

**Expected Output:**

```json
{
  "greeting": "Hello, World!"
}
```

---

## Next Steps

You have successfully created and integrated a custom JavaScript agent. This skill can now be composed into more complex workflows by other agents in your project.

- To learn more about how agents and skills are structured and interact, see the [Agents and Skills](./core-concepts-agents-and-skills.md) documentation.
- For more advanced execution options, refer to the [`aigne run`](./command-reference-run.md) command reference.