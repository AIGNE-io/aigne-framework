# Function Agent

A `FunctionAgent` is a straightforward yet powerful agent that executes a specific, predefined JavaScript function. Unlike an `AIAgent` which uses a Large Language Model to generate responses, a `FunctionAgent` is deterministic: it takes an input, runs your code, and returns the output. This makes it the perfect tool for tasks that require reliable, predictable logic.

Think of a `FunctionAgent` as a way to wrap any piece of your existing code—be it a simple calculation, a data transformation, or a call to an external API—and make it available as a building block within the AIGNE ecosystem. These agents can then be used as specialized "tools" by other, more complex agents like a [Team Agent](./core-agents-team-agent.md).

## How It Works

The core of a `FunctionAgent` is its `process` function. When the agent is run, it simply passes the inputs to this function and returns the result. This simple execution flow allows you to seamlessly integrate any custom logic into your AI workflows.

Here's a diagram illustrating the process:

```d2
direction: down

Input: {
  label: "Input Data"
  shape: rectangle
}

Function-Agent: {
  label: "FunctionAgent"
  shape: rectangle

  JS-Function: {
    label: "Your JS 'process' Function"
    shape: rectangle
  }
}

Output: {
  label: "Function Result"
  shape: rectangle
}

Input -> Function-Agent: "1. run() is called"
Function-Agent -> Function-Agent.JS-Function: "2. Executes function with input"
Function-Agent.JS-Function -> Function-Agent: "3. Returns result"
Function-Agent -> Output: "4. Agent outputs the result"
```

## Basic Usage

Creating a `FunctionAgent` is as simple as defining a function. Let's create an agent that acts as a simple calculator.

```javascript Simple Calculator Agent icon=logos:javascript
import { FunctionAgent, AIGNE, Context } from '@aigne/core';
import { z } from 'zod';

// Define the input schema for validation
const calculatorInputSchema = z.object({
  a: z.number(),
  b: z.number(),
  operator: z.enum(['+', '-', '*', '/']),
});

// Define the agent
const calculatorAgent = new FunctionAgent({
  name: 'calculator',
  description: 'Performs a basic arithmetic operation.',
  input_schema: calculatorInputSchema,
  process: async (inputs) => {
    const { a, b, operator } = inputs;
    switch (operator) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '*':
        return a * b;
      case '/':
        if (b === 0) {
          throw new Error('Division by zero is not allowed.');
        }
        return a / b;
      default:
        throw new Error(`Invalid operator: ${operator}`);
    }
  },
});

// Example of how to run the agent
async function runCalculator() {
  const aigne = new AIGNE();
  const context = new Context();

  const result = await aigne.run(calculatorAgent, { a: 10, b: 5, operator: '*' }, context);

  console.log('Calculation Result:', result);
}

runCalculator();
```

In this example, we define an agent that takes two numbers and an operator. The `process` function contains the core logic, and the `input_schema` ensures that the inputs are valid before the function is ever called, preventing common errors.

### Example Response

When the agent is run, the framework wraps the return value from your `process` function into a standard output object.

```json Response icon=mdi:code-json
{
  "output": 50
}
```

## Constructor

The `FunctionAgent` constructor accepts a single configuration object to define its behavior.

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="true">
    <x-field-desc markdown>A unique name for the agent, used for identification and logging.</x-field-desc>
  </x-field>
  <x-field data-name="description" data-type="string" data-required="true">
    <x-field-desc markdown>A clear, human-readable description of what the agent does. This is crucial for when the agent is used as a tool by other agents.</x-field-desc>
  </x-field>
  <x-field data-name="input_schema" data-type="z.ZodObject" data-required="false">
    <x-field-desc markdown>A schema from the `zod` library to validate the agent's input. Using this is highly recommended to ensure data integrity and prevent runtime errors.</x-field-desc>
  </x-field>
  <x-field data-name="output_schema" data-type="z.ZodObject" data-required="false">
    <x-field-desc markdown>A `zod` schema to validate the agent's output. This is useful for ensuring the function returns data in the expected format.</x-field-desc>
  </x-field>
  <x-field data-name="process" data-type="(inputs: T_in, context: Context) => Promise<T_out>" data-required="true">
    <x-field-desc markdown>The asynchronous JavaScript function that contains the agent's core logic. It receives two arguments: `inputs` (the data to be processed, matching `input_schema`) and `context` (the shared context object for the run).</x-field-desc>
  </x-field>
</x-field-group>

## Using the Context Object

The `process` function also receives a `Context` object as its second argument. This object is powerful for observing the agent's execution and sharing state between different parts of your application.

Here is an example of an agent that uses the context's observer to log a message during its execution.

```javascript Logging Agent icon=logos:javascript
import { FunctionAgent, Context } from '@aigne/core';

const loggingAgent = new FunctionAgent({
  name: 'loggingAgent',
  description: 'Logs a message to the context observer.',
  process: async (inputs, context) => {
    const message = `Processing input: ${JSON.stringify(inputs)}`;

    // Use the observer to emit a log event
    context.observer.onLog({ message });

    return { status: 'logged', received: inputs };
  },
});

// Example runner
async function runLogger() {
  const aigne = new AIGNE();
  const context = new Context();

  // You can listen for events from the observer
  context.observer.on('log', (event) => {
    console.log('[LOG EVENT]:', event.message);
  });

  const result = await aigne.run(loggingAgent, { user: 'test-user', action: 'login' }, context);
  console.log('Agent Result:', result);
}

runLogger();
```

Now that you know how to build deterministic tools, you can explore the [AIAgent](./core-agents-ai-agent.md) for more dynamic, AI-driven tasks or learn how to orchestrate multiple agents with the [Team Agent](./core-agents-team-agent.md).