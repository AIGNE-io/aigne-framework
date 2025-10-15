# Defining Agents with YAML

The AIGNE Framework supports a declarative approach for defining agents using YAML configuration files. This method separates the agent's definition (its properties, instructions, and skills) from the application's business logic, promoting better organization, reusability, and easier management of complex agentic systems.

This guide provides a comprehensive overview of the YAML syntax for defining various agent types and their properties.

## Basic Structure

Every agent definition, regardless of its type, is contained within a `.yaml` file. The `type` attribute is the primary discriminator that determines the agent's behavior and required properties. If the `type` is omitted, it defaults to `ai`.

Here is a fundamental example of an AI agent configuration:

```yaml chat.yaml
name: Basic Chat Agent
description: A simple agent that responds to user messages.
type: ai
instructions: "You are a helpful assistant. Respond to the user's message concisely."
input_key: message
skills:
  - my-skill.js
```

### Core Properties

The following properties are common across most agent types:

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="false">
    <x-field-desc markdown>A human-readable name for the agent.</x-field-desc>
  </x-field>
  <x-field data-name="description" data-type="string" data-required="false">
    <x-field-desc markdown>A brief description of the agent's purpose and capabilities.</x-field-desc>
  </x-field>
  <x-field data-name="type" data-type="string" data-required="false" data-default="ai">
    <x-field-desc markdown>Specifies the agent's type. Determines the required fields and behavior. Valid types include `ai`, `image`, `team`, `transform`, `mcp`, and `function`.</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="object | string" data-required="false">
    <x-field-desc markdown>Configuration for the chat model used by the agent, overriding any globally defined model. Can be a string or a detailed object.</x-field-desc>
  </x-field>
  <x-field data-name="skills" data-type="array" data-required="false">
    <x-field-desc markdown>A list of other agents or JavaScript/TypeScript functions that this agent can use as tools. Each skill is referenced by its file path.</x-field-desc>
  </x-field>
  <x-field data-name="inputSchema" data-type="object | string" data-required="false">
    <x-field-desc markdown>A JSON schema defining the expected input structure. Can be an inline object or a path to an external `.json` or `.yaml` file.</x-field-desc>
  </x-field>
  <x-field data-name="outputSchema" data-type="object | string" data-required="false">
    <x-field-desc markdown>A JSON schema for structuring the agent's output. Can be an inline object or a path to an external file. This is crucial for enabling structured output.</x-field-desc>
  </x-field>
  <x-field data-name="memory" data-type="boolean | object" data-required="false">
    <x-field-desc markdown>Enables statefulness for the agent. Set to `true` for default memory or provide a configuration object for specific providers.</x-field-desc>
  </x-field>
  <x-field data-name="hooks" data-type="array" data-required="false">
    <x-field-desc markdown>Defines lifecycle hooks (`onStart`, `onSuccess`, `onError`, `onEnd`) that trigger other agents at different stages of execution.</x-field-desc>
  </x-field>
</x-field-group>

## Loading External Prompts and Schemas

To maintain clean and modular configurations, you can load agent instructions and schemas from external files. This is particularly useful for complex prompts or reusable data structures.

### External Instructions

For `ai` and `image` agents, instructions can be lengthy. You can define them in a separate Markdown or text file and reference it using the `url` key.

```yaml chat-with-prompt.yaml
name: chat-with-prompt
description: An AI agent with instructions loaded from an external file.
type: ai
instructions:
  url: prompts/main-prompt.md
input_key: message
memory: true
skills:
  - skills/sandbox.js
```

The `main-prompt.md` file contains the raw text that will be used as the agent's system prompt.

```markdown prompts/main-prompt.md
You are a master programmer. When the user asks for code, provide a complete, runnable example and explain the key parts.
```

You can also construct a multi-part prompt with different roles:

```yaml multi-role-prompt.yaml
instructions:
  - role: system
    url: prompts/system-role.md
  - role: user
    content: "Here is an example of a good response:"
  - role: assistant
    url: prompts/example-response.md
```

### External Schemas

Similarly, `inputSchema` and `outputSchema` can reference external JSON or YAML files that define the schema structure.

```yaml structured-output-agent.yaml
name: JSON Extractor
type: ai
instructions: Extract the user's name and email from the text.
outputSchema: schemas/user-schema.yaml
```

The `user-schema.yaml` file would contain the JSON schema definition:

```yaml schemas/user-schema.yaml
type: object
properties:
  name:
    type: string
    description: The full name of the user.
  email:
    type: string
    description: The email address of the user.
required:
  - name
  - email
```

## Agent Type Specifics

The following sections detail the unique configuration properties for each agent type.

### AI Agent (`type: ai`)

The `AIAgent` is the most common type, designed for general-purpose interaction with language models.

```yaml ai-agent-example.yaml
type: ai
name: Customer Support AI
instructions:
  url: prompts/support-prompt.md
input_key: customer_query
output_key: response
# Enforce the model to call a specific skill
tool_choice: "sandbox"
outputSchema: schemas/support-response.yaml
skills:
  - sandbox.js
```

<x-field-group>
  <x-field data-name="instructions" data-type="string | object | array" data-required="false">
    <x-field-desc markdown>The system prompt or instructions for the AI model. Can be a simple string, a reference to an external file (`url`), or an array of message objects (`role`, `content`/`url`).</x-field-desc>
  </x-field>
  <x-field data-name="inputKey" data-type="string" data-required="false">
    <x-field-desc markdown>The key in the input object that contains the main user message to be sent to the model.</x-field-desc>
  </x-field>
  <x-field data-name="outputKey" data-type="string" data-required="false">
    <x-field-desc markdown>The key under which the AI's final text response will be placed in the output object.</x-field-desc>
  </x-field>
  <x-field data-name="toolChoice" data-type="string" data-required="false">
    <x-field-desc markdown>Forces the model to use a specific skill (tool). The value must match the name of a skill attached to the agent.</x-field-desc>
  </x-field>
</x-field-group>

### Team Agent (`type: team`)

The `TeamAgent` orchestrates a collection of child agents (defined under `skills`) to perform a multi-step task.

```yaml team-agent-example.yaml
type: team
name: Research and Write Team
# Agents will run one after another
mode: sequential
# The output of this team will be the collected outputs of all steps
include_all_steps_output: true
skills:
  - url: agents/researcher.yaml
  - url: agents/writer.yaml
  - url: agents/editor.yaml
```

<x-field-group>
  <x-field data-name="mode" data-type="string" data-required="false" data-default="sequential">
    <x-field-desc markdown>The execution mode for the team. Can be `sequential` (agents run in order) or `parallel` (agents run concurrently).</x-field-desc>
  </x-field>
  <x-field data-name="iterateOn" data-type="string" data-required="false">
    <x-field-desc markdown>The key in the input object containing an array. The team will execute its workflow for each item in the array.</x-field-desc>
  </x-field>
  <x-field data-name="reflection" data-type="object" data-required="false">
    <x-field-desc markdown>Configures a self-correction loop where a `reviewer` agent inspects the output and can trigger re-runs until the output is approved.</x-field-desc>
  </x-field>
</x-field-group>

### Image Agent (`type: image`)

The `ImageAgent` is specialized for generating images using an image model.

```yaml image-agent-example.yaml
type: image
name: Logo Generator
instructions: "A minimalist, flat-design logo for a tech startup named 'Innovate'."
# Pass through specific options to the image model provider
model_options:
  quality: hd
  style: vivid
```

<x-field-group>
  <x-field data-name="instructions" data-type="string | object" data-required="true">
    <x-field-desc markdown>The prompt describing the desired image. Unlike the AI agent, this is a mandatory field.</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>A key-value map of provider-specific options to control image generation (e.g., `quality`, `style`, `size`).</x-field-desc>
  </x-field>
</x-field-group>

### Transform Agent (`type: transform`)

The `TransformAgent` uses a [JSONata](https://jsonata.org/) expression to declaratively map, filter, or restructure JSON data without writing code.

```yaml transform-agent-example.yaml
type: transform
name: User Formatter
description: Extracts and formats user names from a list.
jsonata: "payload.users.{'name': firstName & ' ' & lastName}"
```

<x-field-group>
  <x-field data-name="jsonata" data-type="string" data-required="true">
    <x-field-desc markdown>The JSONata expression to execute against the input data.</x-field-desc>
  </x-field>
</x-field-group>

## Summary

Defining agents via YAML offers a powerful, declarative alternative to programmatic definition. It allows for clear separation of concerns, enhances reusability, and simplifies the management of agent configurations. By leveraging external files for prompts and schemas, you can build complex, modular, and maintainable AI systems.

For more hands-on examples, refer to the other guides in the [Advanced Topics](./developer-guide-advanced-topics.md) section.