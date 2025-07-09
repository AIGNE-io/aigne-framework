# Creating Agents through JS Functions

Using JavaScript functions to create AI agents provides developers with a flexible programming approach. Through familiar JavaScript syntax, you can implement complex business logic and custom functionality.

## Basic Structure

```javascript
export default async function plus({ a, b }) {
  return { sum: a + b };
}

plus.description = "This agent adds two numbers together.";

plus.input_schema = {
  type: "object",
  properties: {
    a: { type: "number", description: "First number" },
    b: { type: "number", description: "Second number" },
  },
  required: ["a", "b"],
};

plus.output_schema = {
  type: "object",
  properties: {
    sum: { type: "number", description: "Sum of a and b" },
  },
  required: ["sum"],
};
```

## Structure Description

* `export default async function xxx()`: Main exported function that receives input parameters and returns results
* `xxx.description`: Function description
* `xxx.input_schema`: JSON Schema definition for input parameters
* `xxx.output_schema`: JSON Schema definition for output results

## Test Files

AIGNE supports Node.js built-in testing framework, allowing you to write test cases for agents. Test files are usually located in the same directory as the agent implementation file, named `xxx.test.js`.

### Basic Test Example

```javascript
import assert from "node:assert";
import plus from "./plus.js";

assert.deepEqual(await plus({ a: 1, b: 2 }), { sum: 3 });
```

### Advanced Test Example

```javascript
import assert from "node:assert";
import { describe, it } from "node:test";
import plus from "./plus.js";

describe("Plus Agent", () => {
  it("should add two positive numbers", async () => {
    const result = await plus({ a: 5, b: 3 });
    assert.deepEqual(result, { sum: 8 });
  });

  it("should add negative numbers", async () => {
    const result = await plus({ a: -2, b: -3 });
    assert.deepEqual(result, { sum: -5 });
  });

  it("should handle zero", async () => {
    const result = await plus({ a: 0, b: 5 });
    assert.deepEqual(result, { sum: 5 });
  });

  it("should handle decimal numbers", async () => {
    const result = await plus({ a: 1.5, b: 2.5 });
    assert.deepEqual(result, { sum: 4 });
  });
});
```

***

Main advantages of creating agents through JavaScript functions:

* Use familiar JavaScript syntax
* Implement complex business logic and algorithms
* Write comprehensive test cases to ensure quality
* Complete control over code logic and execution flow

**Development Recommendation:** Start by implementing basic functionality, then gradually add error handling and edge case testing.
