This document provides a comprehensive guide to using the `TransformAgent`, a specialized agent designed for data transformation using JSONata expressions. You will learn how to configure and use this agent to perform tasks like data format conversion, field mapping, and API response normalization.

## Overview

The `TransformAgent` is a specialized agent that transforms input data into a desired output format using [JSONata](https://jsonata.org/) expressions. It provides a declarative and powerful way to handle structured data manipulation without writing complex custom logic.

This agent is particularly useful for:
-   API response normalization and field mapping
-   Database query result transformation
-   Configuration data restructuring
-   Converting data formats (e.g., snake_case to camelCase)
-   Performing aggregation and calculation operations
-   Filtering and conditional data processing

## How It Works

The `TransformAgent` processes incoming data by applying a user-defined JSONata expression. The core logic involves taking a structured input message, evaluating it against the expression, and returning a new message with the transformed structure and data.

```d2
direction: down

Input-Data: {
  label: "Structured Input\n(e.g., API Response, DB Result)"
  shape: rectangle
}

TransformAgent: {
  label: "TransformAgent"
  shape: rectangle

  Transformation-Engine: {
    label: "Transformation Engine"
    shape: rectangle
  }

  JSONata-Expression: {
    label: "JSONata Expression\n(User-defined logic)"
    shape: rectangle
    style: {
      stroke: "#888"
      stroke-width: 2
      stroke-dash: 4
    }
  }
}

Output-Data: {
  label: "Transformed Output\n(Normalized Data)"
  shape: rectangle
}

Input-Data -> TransformAgent.Transformation-Engine: "1. Receives data"
TransformAgent.JSONata-Expression -> TransformAgent.Transformation-Engine: "2. Applies logic"
TransformAgent.Transformation-Engine -> Output-Data: "3. Returns transformed data"
```

## Configuration

To use the `TransformAgent`, you need to define its configuration in a YAML file. Here are the key fields:

| Field           | Type                                                               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`          | `string`                                                           | Specifies the agent type. Must be set to `transform`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `name`          | `string`                                                           | A unique name for the agent instance.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `description`   | `string`                                                           | A brief description of the agent's purpose.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `input_schema`  | `object`                                                           | Defines the expected structure of the input data using JSON Schema.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `output_schema` | `object`                                                           | Defines the expected structure of the output data using JSON Schema.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `jsonata`       | `string`                                                           | A [JSONata](https://jsonata.org/) expression that specifies how to transform the input data into the output format. This is the core of the agent's logic. <br><br> **Common Patterns:**<ul><li>**Field Mapping:** `{ "newField": oldField }`</li><li>**Array Transformation:** `items.{ "name": product_name }`</li><li>**Calculations:** `$sum(items.price)`</li><li>**Conditional Logic:** `condition ? value1 : value2`</li></ul> For more details, refer to the [official JSONata documentation](https://docs.jsonata.org/overview.html) and experiment in the [JSONata Playground](https://try.jsonata.org/). |

## Example

This example demonstrates how to configure a `TransformAgent` to convert user data from `snake_case` to `camelCase`.

### Configuration (`transform.yaml`)

```yaml
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

### Usage

When the agent receives an input message matching the `input_schema`, it applies the `jsonata` expression to transform the data.

**Input Data:**

```json
{
  "user_id": "usr_12345",
  "user_name": "John Doe",
  "created_at": "2023-10-27T10:00:00Z"
}
```

**Output Data:**

After processing, the agent will produce the following output, which conforms to the `output_schema`:

```json
{
  "userId": "usr_12345",
  "userName": "John Doe",
  "createdAt": "2023-10-27T10:00:00Z"
}
```