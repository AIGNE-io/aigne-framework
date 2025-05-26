# 🚀 Quick Start

[English](./quick-start.md) | [中文](./quick-start.zh.md)

The AIGNE Framework lets you build powerful AI Agents and workflows with minimal code. Follow the steps below to experience AI magic right away and enjoy the fun of "write a little, achieve a lot"! ✨

## Environment Requirements

Before starting the installation, please ensure your local environment meets the following conditions:

* [Node.js](https://nodejs.org) v22.14.0 or higher
* Support for any package manager: npm/[yarn](https://yarnpkg.com)/[pnpm](https://pnpm.io)

## Installation 🛠️

First step, install dependencies! With just one command, you'll instantly have all the capabilities to build AI Agents. Supports npm/yarn/pnpm, choose whichever you prefer.

The AIGNE Framework depends on the core package `@aigne/core` and model packages (such as `@aigne/openai`). You can choose the appropriate installation command based on your package manager. After installation, you can start building your own Agents.

```bash
npm install @aigne/core @aigne/openai
```

You can also use yarn or pnpm:

```bash
yarn add @aigne/core @aigne/openai
# or
pnpm add @aigne/core @aigne/openai
```

## Create Your First Agent 🎉

Next, we'll build a simple but fully functional AI Agent step by step. Each step below is an important part of the building process.

### Import Necessary Modules

First, we need to import the core components and model implementations of the AIGNE framework:

```ts file="../../docs-examples/test/quick-start.test.ts" region="example-quick-start-basic" only_imports
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
```

Here we import two core components:

* `AIAgent` - Class for creating and configuring AI Agents
* `AIGNE` - The main framework class responsible for coordinating Agents and models
* `OpenAIChatModel` - OpenAI chat model implementation for handling actual AI interactions

### Create AIGNE Instance

Next, we need to create an AIGNE instance and configure it to use OpenAI's model:

```ts file="../../docs-examples/test/quick-start.test.ts" region="example-quick-start-create-aigne" exclude_imports
const aigne = new AIGNE({
  model: new OpenAIChatModel({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
  }),
});
```

This code:

* Creates an AIGNE framework instance
* Configures it to use OpenAI's `gpt-4o-mini` model
* Gets the API key from the environment variable `OPENAI_API_KEY` (make sure you've set this environment variable)

You can choose different models as needed, such as `gpt-4o`, `o1`, or other OpenAI-supported models.

### Create Agent

Now, let's create a simple AI Agent:

```ts file="../../docs-examples/test/quick-start.test.ts" region="example-quick-start-create-agent" exclude_imports
const agent = AIAgent.from({
  instructions: "You are a helpful assistant",
});
```

Here:

* Use the `AIAgent.from()` method to create an Agent
* Set the Agent's behavior guidelines through the `instructions` parameter
* This simple instruction tells the AI it should play the role of a helpful assistant

You can customize instructions as needed to make the Agent play different roles or focus on specific domain tasks.

### Run Agent

Now we can invoke the Agent to handle user requests:

```ts file="../../docs-examples/test/quick-start.test.ts" region="example-quick-start-invoke" exclude_imports
const result = await aigne.invoke(agent, "What is AIGNE?");
console.log(result);
// Output: { $message: "AIGNE is a platform for building AI agents." }
```

This code:

* Uses the `aigne.invoke()` method to call the Agent
* Passes in the previously created Agent instance and the user's question
* Asynchronously waits for the response and outputs the result
* The output result is contained in the `$message` field

The `invoke` method is the primary way to interact with Agents, returning a Promise containing the AI response.

### Streaming Mode

For long responses or scenarios requiring real-time display of generated content, AIGNE supports streaming output:

```ts file="../../docs-examples/test/quick-start.test.ts" region="example-quick-start-streaming" exclude_imports
const stream = await aigne.invoke(agent, "What is AIGNE?", { streaming: true });

let response = "";
for await (const chunk of stream) {
  console.log(chunk);
  if (chunk.delta.text?.$message) response += chunk.delta.text.$message;
}
console.log(response);
// Output:  "AIGNE is a platform for building AI agents."
```

This code:

* Enables streaming output by setting the `{ streaming: true }` option
* Uses a `for await...of` loop to process each response chunk
* Appends the `delta.text.$message` from each chunk to the final response
* Finally outputs the complete response

Streaming output is particularly useful for building real-time chat interfaces or applications that need to progressively display long responses.

### Complete Example

Below is a complete example that includes all the above steps:

```ts file="../../docs-examples/test/quick-start.test.ts" region="example-quick-start-basic"
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const aigne = new AIGNE({
  model: new OpenAIChatModel({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
  }),
});

const agent = AIAgent.from({
  instructions: "You are a helpful assistant",
});

const result = await aigne.invoke(agent, "What is AIGNE?");
console.log(result);
// Output: { $message: "AIGNE is a platform for building AI agents." }

const stream = await aigne.invoke(agent, "What is AIGNE?", { streaming: true });

let response = "";
for await (const chunk of stream) {
  console.log(chunk);
  if (chunk.delta.text?.$message) response += chunk.delta.text.$message;
}
console.log(response);
// Output:  "AIGNE is a platform for building AI agents."
```
