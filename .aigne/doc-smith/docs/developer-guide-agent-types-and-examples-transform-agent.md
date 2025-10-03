# Transform Agent

The `TransformAgent` is a specialized agent that reshapes and manipulates JSON data using [JSONata](https://jsonata.org/) expressions. It acts as a data transformation layer between other agents, making it invaluable for tasks like converting data formats, renaming fields, or restructuring API responses before they are passed to another agent in a workflow.

This agent provides a declarative way to handle complex data manipulations through simple expressions, eliminating the need to write custom processing logic in JavaScript or TypeScript.

## Core Concept: JSONata

`TransformAgent` leverages the power of JSONata, a lightweight query and transformation language designed specifically for JSON data. With JSONata, you can define how input data should be mapped, filtered, aggregated, and restructured into the desired output format.

Key features of JSONata include:
- **Field Mapping**: `{ "newField": oldField }`
- **Array Transformation**: `items.{ "name": product_name, "price": price }`
- **Calculations**: `$sum(items.price)`, `$count(items)`
- **Conditional Logic**: `is_active ? "Active" : "Inactive"`
- **String and Number Functions**: `$uppercase(name)`, `$round(price, 2)`

To learn more about its syntax and capabilities, refer to the official [JSONata Documentation](https://jsonata.org/) or experiment with expressions in the interactive [JSONata Playground](https://try.jsonata.org/).

## Configuration Example

You can define a `TransformAgent` declaratively using YAML. This example demonstrates a common use case: converting object keys from `snake_case` to `camelCase`.

```yaml transform.yaml icon=mdi:file-yaml
type: transform
name: transform-agent
description: |
  A Transform Agent that processes input data using JSONata expressions.
input_schema:
  type: object
  properties:
    user_id:
      type: string
      description: The ID of the user.
    user_name:
      type: string
      description: The name of the user.
    created_at:
      type: string
      description: The creation date of the user.
  required:
    - user_id
    - user_name
    - created_at
output_schema:
  type: object
  properties:
    userId:
      type: string
      description: The ID of the user.
    userName:
      type: string
      description: The name of the user.
    createdAt:
      type: string
      description: The creation date of the user.
  required:
    - userId
    - userName
    - createdAt
jsonata: |
  {
    "userId": user_id,
    "userName": user_name,
    "createdAt": created_at
  }
```

In this configuration:
- The `input_schema` defines the expected incoming data structure.
- The `output_schema` defines the desired outgoing data structure.
- The `jsonata` expression provides the mapping logic to transform the input fields to the output fields.

## Programmatic Usage

You can also create and use a `TransformAgent` directly in your code. The `TransformAgent.from()` factory method provides a convenient way to instantiate the agent.

```typescript icon=logos:typescript-icon
import { TransformAgent } from "@aigne/core";

// Define input and output message types for clarity
interface UserInput {
  user_id: string;
  user_name: string;
  created_at: string;
}

interface UserOutput {
  userId: string;
  userName: string;
  createdAt: string;
}

async function runTransform() {
  // 1. Create a TransformAgent instance
  const snakeToCamelAgent = TransformAgent.from<UserInput, UserOutput>({
    name: "snake-to-camel-case-transformer",
    description: "Converts user data keys from snake_case to camelCase.",
    jsonata: `{
      "userId": user_id,
      "userName": user_name,
      "createdAt": created_at
    }`,
  });

  // 2. Define the input data
  const inputData: UserInput = {
    user_id: "usr_12345",
    user_name: "Jane Doe",
    created_at: "2023-10-27T10:00:00Z",
  };

  // 3. Process the data through the agent
  const result = await snakeToCamelAgent.process(inputData);

  // 4. Log the transformed output
  console.log(result);
  // Expected output:
  // {
  //   userId: 'usr_12345',
  //   userName: 'Jane Doe',
  //   createdAt: '2023-10-27T10:00:00Z'
  // }
}

runTransform();
```

## Agent Options

When creating a `TransformAgent`, you can provide the following options.

<x-field-group>
  <x-field data-name="jsonata" data-type="string" data-required="true">
    <x-field-desc markdown>The JSONata expression string for data transformation. This expression defines how input data is converted to output data. See the [JSONata Documentation](https://jsonata.org/) for complete syntax.</x-field-desc>
  </x-field>
  <x-field data-name="name" data-type="string" data-required="true" data-desc="A unique name for the agent instance."></x-field>
  <x-field data-name="description" data-type="string" data-required="true" data-desc="A brief description of the agent's purpose."></x-field>
  <x-field data-name="input_schema" data-type="object" data-required="false" data-desc="A JSON schema defining the expected input message structure."></x-field>
  <x-field data-name="output_schema" data-type="object" data-required="false" data-desc="A JSON schema defining the expected output message structure."></x-field>
</x-field-group>

## Summary

The `TransformAgent` is a powerful and efficient tool for handling data manipulation within your AI workflows. By offloading data restructuring to a dedicated agent, you can keep your other agents, such as the [AI Agent](./developer-guide-agent-types-and-examples-ai-agent.md) or [Function Agent](./developer-guide-agent-types-and-examples-function-agent.md), focused on their core logic. This separation of concerns leads to cleaner, more maintainable, and more reusable agent designs.