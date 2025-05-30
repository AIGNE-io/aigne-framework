# Creating Agents through JS Functions - Programmer's Favorite

**English** | [中文](function.zh.md)

Code is power! For programmers, nothing is more exciting than creating AI agents using familiar JavaScript. This approach gives you complete control and lets you implement any functionality you can imagine.

## Basic Structure - Concise yet Powerful Code Pattern

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

## Structure Explained - Every Line of Code Has Deep Meaning

* `export default async function xxx()`: Main function that exports the tool, this is your AI agent's brain! Receives input parameters and returns results
* `xxx.description`: Function description, giving your agent a clear identity introduction
* `xxx.input_schema`: JSON Schema definition for input parameters, telling AI what kind of data to expect
* `xxx.output_schema`: JSON Schema definition for output results, ensuring returned data format is standardized

## Agent Test Files - Quality Assurance Guardian

Quality is a programmer's life! AIGNE perfectly supports Node.js built-in testing framework, making it easy to write tests for agents. Test files are usually located in the same directory as the agent implementation file, named `xxx.test.js`.

### Basic Test Example - Quick Function Validation

```javascript
import assert from "node:assert";
import plus from "./plus.js";

assert.deepEqual(await plus({ a: 1, b: 2 }), { sum: 3 });
```

### Advanced Test Example - Comprehensive Coverage of Various Scenarios

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

**Perfect!** You've unlocked all the skills of JavaScript agents. Now you can:

✅ Create intelligent agents using familiar JavaScript syntax
✅ Implement complex business logic and algorithms
✅ Write comprehensive test cases to ensure quality
✅ Enjoy the perfect combination of programming fun and AI intelligence

**Programmer's Advantage:** Complete control, unlimited possibilities, code as documentation!

**Start coding!** Let your creativity become intelligent AI agents through code!
