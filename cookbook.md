# AIGNE Framework Cookbook

**English** | [中文](./cookbook.zh.md)

## Table of Contents

* [AIGNE Framework Cookbook](#aigne-framework-cookbook)
  * [Table of Contents](#table-of-contents)
  * [Introduction](#introduction)
  * [Installation](#installation)
    * [Installing AIGNE Framework](#installing-aigne-framework)
  * [Core Concepts](#core-concepts)
    * [Chat Model](#chat-model)
    * [Agent](#agent)
    * [Workflow](#workflow)
    * [AIGNE](#aigne)
  * [Workflow Patterns](#workflow-patterns)
    * [Code Execution Workflow](#code-execution-workflow)
    * [Sequential Workflow](#sequential-workflow)
    * [Concurrency Workflow](#concurrency-workflow)
    * [Reflection Workflow](#reflection-workflow)
    * [Handoff Workflow](#handoff-workflow)
    * [Router Workflow](#router-workflow)
    * [Orchestrator Workflow](#orchestrator-workflow)
  * [MCP Server Integration](#mcp-server-integration)
    * [Puppeteer MCP Server](#puppeteer-mcp-server)
    * [SQLite MCP Server](#sqlite-mcp-server)
  * [Usage Patterns and Best Practices](#usage-patterns-and-best-practices)
    * [Choosing the Right Workflow Pattern](#choosing-the-right-workflow-pattern)
    * [Designing Effective Agent Prompts](#designing-effective-agent-prompts)
    * [Combining Multiple Workflow Patterns](#combining-multiple-workflow-patterns)
  * [Frequently Asked Questions](#frequently-asked-questions)

## Introduction

AIGNE Framework is a framework for building applications based on Large Language Models (LLMs). It provides a series of tools and abstractions that enable developers to easily create complex AI workflows. This Cookbook aims to help developers understand the core concepts of AIGNE Framework and demonstrate through examples how to use different workflow patterns to solve real-world problems.

## Installation

To get started with AIGNE Framework, you need to install the relevant dependencies.

### Installing AIGNE Framework

**npm**

```bash
npm install @aigne/core

# If you need advanced Agents from Agent Library
npm install @aigne/agent-library

# Install LLM libraries as needed
npm install openai @anthropic-ai/sdk @google/generative-ai
```

**yarn**

```bash
yarn add @aigne/core

# If you need advanced Agents from Agent Library
yarn add @aigne/agent-library

# Install LLM libraries as needed
yarn add openai @anthropic-ai/sdk @google/generative-ai
```

**pnpm**

```bash
pnpm install @aigne/core

# If you need advanced Agents from Agent Library
pnpm install @aigne/agent-library

# Install LLM libraries as needed
pnpm install openai @anthropic-ai/sdk @google/generative-ai
```

## Core Concepts

### Chat Model

In AIGNE Framework, ChatModel is an abstract base class for interacting with Large Language Models (LLMs). It provides a unified interface to handle different underlying model implementations, including:

* **OpenAIChatModel**: For communicating with OpenAI's GPT series models
* **ClaudeChatModel**: For communicating with Anthropic's Claude series models
* **XAIChatModel**: For communicating with X.AI's Grok series models

ChatModel can be used directly, but it's generally recommended to use it through AIGNE to gain more advanced features like tool integration, error handling, and state management.

**Example**:

```typescript file="../packages/core/test/agents/model-simple-usage.test.ts"
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "../_mocks/mock-models.js";

// Initialize OpenAI model
const model = new OpenAIChatModel();

// Use with AIGNE
const aigne = new AIGNE({ model });

// Or use with AIAgent directly
const agent = AIAgent.from({
  model,
  instructions: "You are a helpful assistant.",
});

const result = await aigne.invoke(agent, "Hello");

console.log(result);
// Output:
// {
//   $message: "Hello! How can I assist you today?",
// }
```

For more information, refer to the [ChatModel API documentation](./apis/chat-model.md).

### Agent

In AIGNE Framework, Agents are the basic building blocks of workflows. Each Agent has specific instructions and capabilities to process inputs and produce outputs. The framework provides several types of Agents:

* **AIAgent**: Agents using large language models, capable of understanding and generating natural language
* **FunctionAgent**: Agents that execute specific functions, typically used to interact with external systems
* **MCPAgent**: Agents that connect to Model Context Protocol (MCP) servers, providing additional capabilities

### Workflow

AIGNE Framework supports multiple workflow patterns, each suitable for different scenarios:

* **Sequential Workflow**: Agents execute in sequence
* **Concurrency Workflow**: Multiple Agents execute in parallel
* **Reflection Workflow**: Agents improve outputs through feedback loops
* **Handoff Workflow**: Agents transfer tasks between each other
* **Router Workflow**: Dynamically select Agents based on input
* **Orchestrator Workflow**: Organize multiple Agents to work together

### AIGNE

The AIGNE is the runtime environment for workflows, responsible for coordinating communication and execution flow between Agents.

```typescript
const aigne = new AIGNE({ model });
```

## Workflow Patterns

### Code Execution Workflow

**Scenario**: Need to dynamically execute code to solve problems, such as calculations or algorithm implementations

**Workflow Process**:

1. User provides a problem
2. Coder Agent generates code
3. Sandbox Agent executes the code
4. Coder returns the result

**Example**:

```typescript file="../examples/workflow-code-execution/usages.ts"
import { AIAgent, AIGNE, FunctionAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { z } from "zod";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

const sandbox = FunctionAgent.from({
  name: "evaluateJs",
  description: "A js sandbox for running javascript code",
  inputSchema: z.object({
    code: z.string().describe("The code to run"),
  }),
  process: async (input: { code: string }) => {
    const { code } = input;
    // biome-ignore lint/security/noGlobalEval: <explanation>
    const result = eval(code);
    return { result };
  },
});

const coder = AIAgent.from({
  name: "coder",
  instructions: `\
You are a proficient coder. You write code to solve problems.
Work with the sandbox to execute your code.
`,
  skills: [sandbox],
});

const aigne = new AIGNE({ model });

const result = await aigne.invoke(coder, "10! = ?");
console.log(result);
// Output:
// {
//   $message: "The value of \\(10!\\) (10 factorial) is 3,628,800.",
// }
```

### Sequential Workflow

**Scenario**: Need to process data through multiple steps in sequence, such as content generation pipeline

**Workflow Process**:

1. Execute multiple Agents in sequence
2. Each Agent's output serves as input for the next Agent
3. The final output is the result of the last Agent

**Example**:

```typescript file="../examples/workflow-sequential/usages.ts"
import { AIAgent, AIGNE, ProcessMode, TeamAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

const conceptExtractor = AIAgent.from({
  instructions: `\
You are a marketing analyst. Give a product description, identity:
- Key features
- Target audience
- Unique selling points

Product description:
{{product}}`,
  outputKey: "concept",
});

const writer = AIAgent.from({
  instructions: `\
You are a marketing copywriter. Given a block of text describing features, audience, and USPs,
compose a compelling marketing copy (like a newsletter section) that highlights these points.
Output should be short (around 150 words), output just the copy as a single text block.

Product description:
{{product}}

Below is the info about the product:
{{concept}}`,
  outputKey: "draft",
});

const formatProof = AIAgent.from({
  instructions: `\
You are an editor. Given the draft copy, correct grammar, improve clarity, ensure consistent tone,
give format and make it polished. Output the final improved copy as a single text block.

Product description:
{{product}}

Below is the info about the product:
{{concept}}

Draft copy:
{{draft}}`,
  outputKey: "content",
});

const aigne = new AIGNE({ model });

const result = await aigne.invoke(
  TeamAgent.from({
    skills: [conceptExtractor, writer, formatProof],
    mode: ProcessMode.sequential,
  }),
  {
    product: "AIGNE is a No-code Generative AI Apps Engine",
  },
);

console.log(result);

// Output:
// {
//   concept: "**Product Description: AIGNE - No-code Generative AI Apps Engine**\n\nAIGNE is a cutting-edge No-code Generative AI Apps Engine designed to empower users to seamlessly create ...",
//   draft: "Unlock the power of creation with AIGNE, the revolutionary No-code Generative AI Apps Engine! Whether you're a small business looking to streamline operations, an entrepreneur ...",
//   content: "Unlock the power of creation with AIGNE, the revolutionary No-Code Generative AI Apps Engine! Whether you are a small business aiming to streamline operations, an entrepreneur ...",
// }
```

### Concurrency Workflow

**Scenario**: Need to execute multiple independent tasks in parallel and then aggregate results

**Workflow Process**:

1. Execute multiple Agents simultaneously
2. Collect results from all Agents
3. Return an object containing all results

**Example**:

```typescript file="../examples/workflow-concurrency/usages.ts"
import { AIAgent, AIGNE, ProcessMode, TeamAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

const featureExtractor = AIAgent.from({
  instructions: `\
You are a product analyst. Extract and summarize the key features of the product.

Product description:
{{product}}`,
  outputKey: "features",
});

const audienceAnalyzer = AIAgent.from({
  instructions: `\
You are a market researcher. Identify the target audience for the product.

Product description:
{{product}}`,
  outputKey: "audience",
});

const aigne = new AIGNE({ model });

const result = await aigne.invoke(
  TeamAgent.from({
    skills: [featureExtractor, audienceAnalyzer],
    mode: ProcessMode.parallel,
  }),
  {
    product: "AIGNE is a No-code Generative AI Apps Engine",
  },
);

console.log(result);

// Output:
// {
//   features: "**Product Name:** AIGNE\n\n**Product Type:** No-code Generative AI Apps Engine\n\n...",
//   audience: "**Small to Medium Enterprises (SMEs)**: \n   - Businesses that may not have extensive IT resources or budget for app development but are looking to leverage AI to enhance their operations or customer engagement.\n\n...",
// }
```

### Reflection Workflow

**Scenario**: Need to improve output through multiple iterations, such as code review and fixes

**Workflow Process**:

1. Initial Agent generates a solution
2. Review Agent evaluates the solution
3. If review fails, return to initial Agent for improvements
4. If review passes, return the final result

**Example**:

```typescript file="../examples/workflow-reflection/usages.ts"
import { AIAgent, AIGNE, UserInputTopic, UserOutputTopic } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";
import { z } from "zod";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

const coder = AIAgent.from({
  subscribeTopic: [UserInputTopic, "rewrite_request"],
  publishTopic: "review_request",
  instructions: `\
You are a proficient coder. You write code to solve problems.
Work with the reviewer to improve your code.
Always put all finished code in a single Markdown code block.
For example:
\`\`\`python
def hello_world():
    print("Hello, World!")
\`\`\`

Respond using the following format:

Thoughts: <Your comments>
Code: <Your code>

Previous review result:
{{feedback}}

User's question:
{{question}}
`,
  outputSchema: z.object({
    code: z.string().describe("Your code"),
  }),
});

const reviewer = AIAgent.from({
  subscribeTopic: "review_request",
  publishTopic: (output) =>
    output.approval ? UserOutputTopic : "rewrite_request",
  instructions: `\
You are a code reviewer. You focus on correctness, efficiency and safety of the code.

The problem statement is: {{question}}
The code is:
\`\`\`
{{code}}
\`\`\`

Previous feedback:
{{feedback}}

Please review the code. If previous feedback was provided, see if it was addressed.
`,
  outputSchema: z.object({
    approval: z.boolean().describe("APPROVE or REVISE"),
    feedback: z.object({
      correctness: z.string().describe("Your comments on correctness"),
      efficiency: z.string().describe("Your comments on efficiency"),
      safety: z.string().describe("Your comments on safety"),
      suggested_changes: z
        .string()
        .describe("Your comments on suggested changes"),
    }),
  }),
  includeInputInOutput: true,
});

const aigne = new AIGNE({ model, agents: [coder, reviewer] });
aigne.publish(
  UserInputTopic,
  "Write a function to find the sum of all even numbers in a list.",
);

const { message } = await aigne.subscribe(UserOutputTopic);
console.log(message);
// Output:
// {
//   code: "def sum_of_even_numbers(numbers):\n    \"\"\"Function to calculate the sum of all even numbers in a list.\"\"\"\n    return sum(number for number in numbers if number % 2 == 0)",
//   approval: true,
//   feedback: {
//     correctness: "The function correctly calculates the sum of all even numbers in the given list. It properly checks for evenness using the modulus operator and sums the valid numbers.",
//     efficiency: "The implementation is efficient as it uses a generator expression which computes the sum in a single pass over the list. This minimizes memory usage as compared to creating an intermediate list of even numbers.",
//     safety: "The function does not contain any safety issues. However, it assumes that all elements in the input list are integers. It would be prudent to handle cases where the input contains non-integer values (e.g., None, strings, etc.).",
//     suggested_changes: "Consider adding type annotations to the function for better clarity and potential type checking, e.g. `def sum_of_even_numbers(numbers: list[int]) -> int:`. Also, include input validation to ensure 'numbers' is a list of integers.",
//   },
// }
```

### Handoff Workflow

**Scenario**: Need to switch between different Agents based on interaction state, such as transferring customer service

**Workflow Process**:

1. Initial Agent handles user request
2. If transfer is needed, initial Agent passes control to another Agent
3. New Agent takes over the conversation and continues processing

**Example**:

```typescript file="../examples/workflow-handoff/usages.ts"
import { AIAgent, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

function transferToB() {
  return agentB;
}

const agentA = AIAgent.from({
  name: "AgentA",
  instructions: "You are a helpful agent.",
  outputKey: "A",
  skills: [transferToB],
});

const agentB = AIAgent.from({
  name: "AgentB",
  instructions: "Only speak in Haikus.",
  outputKey: "B",
});

const aigne = new AIGNE({ model });

const userAgent = aigne.invoke(agentA);

const result1 = await userAgent.invoke("transfer to agent b");
console.log(result1);
// Output:
// {
//   B: "Transfer now complete,  \nAgent B is here to help.  \nWhat do you need, friend?",
// }

const result2 = await userAgent.invoke("It's a beautiful day");
console.log(result2);
// Output:
// {
//   B: "Sunshine warms the earth,  \nGentle breeze whispers softly,  \nNature sings with joy.  ",
// }
```

### Router Workflow

**Scenario**: Need to automatically select appropriate handling Agent based on user input, such as customer service routing

**Workflow Process**:

1. Router Agent analyzes user request
2. Automatically selects the most suitable handling Agent
3. Selected Agent processes the request and returns result

**Example**:

```typescript file="../examples/workflow-router/usages.ts"
import { AIAgent, AIAgentToolChoice, AIGNE } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

const productSupport = AIAgent.from({
  name: "product_support",
  description: "Agent to assist with any product-related questions.",
  instructions: `You are an agent capable of handling any product-related questions.
  Your goal is to provide accurate and helpful information about the product.
  Be polite, professional, and ensure the user feels supported.`,
  outputKey: "product_support",
});

const feedback = AIAgent.from({
  name: "feedback",
  description: "Agent to assist with any feedback-related questions.",
  instructions: `You are an agent capable of handling any feedback-related questions.
  Your goal is to listen to the user's feedback, acknowledge their input, and provide appropriate responses.
  Be empathetic, understanding, and ensure the user feels heard.`,
  outputKey: "feedback",
});

const other = AIAgent.from({
  name: "other",
  description: "Agent to assist with any general questions.",
  instructions: `You are an agent capable of handling any general questions.
  Your goal is to provide accurate and helpful information on a wide range of topics.
  Be friendly, knowledgeable, and ensure the user feels satisfied with the information provided.`,
  outputKey: "other",
});

const triage = AIAgent.from({
  name: "triage",
  instructions: `You are an agent capable of routing questions to the appropriate agent.
  Your goal is to understand the user's query and direct them to the agent best suited to assist them.
  Be efficient, clear, and ensure the user is connected to the right resource quickly.`,
  skills: [productSupport, feedback, other],
  toolChoice: AIAgentToolChoice.router, // Set toolChoice to "router" to enable router mode
});

const aigne = new AIGNE({ model });

const result1 = await aigne.invoke(triage, "How to use this product?");
console.log(result1);
// {
//   product_support: "I’d be happy to help you with that! However, I need to know which specific product you’re referring to. Could you please provide me with the name or type of product you have in mind?",
// }

const result2 = await aigne.invoke(triage, "I have feedback about the app.");
console.log(result2);
// {
//   feedback: "Thank you for sharing your feedback! I'm here to listen. Please go ahead and let me know what you’d like to share about the app.",
// }

const result3 = await aigne.invoke(triage, "What is the weather today?");
console.log(result3);
// {
//   other: "I can't provide real-time weather updates. However, you can check a reliable weather website or a weather app on your phone for the current conditions in your area. If you tell me your location, I can suggest a few sources where you can find accurate weather information!",
// }
```

### Orchestrator Workflow

**Scenario**: Need to coordinate multiple specialized Agents to complete complex tasks, such as research report generation

**Workflow Process**:

1. Orchestrator Agent analyzes task and determines required subtasks
2. Calls specialized Agents to execute each subtask
3. Synthesizes all results into final output

**Example**:

```typescript file="../examples/workflow-orchestrator/usage.ts"
import { OrchestratorAgent } from "@aigne/agent-library/orchestrator/index.js";
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
  modelOptions: {
    parallelToolCalls: false, // puppeteer can only run one task at a time
  },
});

const puppeteer = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-puppeteer"],
  env: process.env as Record<string, string>,
});

const filesystem = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem", import.meta.dir],
});

const finder = AIAgent.from({
  name: "finder",
  description: "Find the closest match to a user's request",
  instructions: `You are an agent that can find information on the web.
You are tasked with finding the closest match to the user's request.
You can use puppeteer to scrape the web for information.
You can also use the filesystem to save the information you find.

Rules:
- do not use screenshot of puppeteer
- use document.body.innerText to get the text content of a page
- if you want a url to some page, you should get all link and it's title of current(home) page,
then you can use the title to search the url of the page you want to visit.
  `,
  skills: [puppeteer, filesystem],
});

const writer = AIAgent.from({
  name: "writer",
  description: "Write to the filesystem",
  instructions: `You are an agent that can write to the filesystem.
  You are tasked with taking the user's input, addressing it, and
  writing the result to disk in the appropriate location.`,
  skills: [filesystem],
});

const agent = OrchestratorAgent.from({
  skills: [finder, writer],
  maxIterations: 3,
  tasksConcurrency: 1, // puppeteer can only run one task at a time
});

const aigne = new AIGNE({ model });

const result = await aigne.invoke(
  agent,
  `\
Conduct an in-depth research on ArcBlock using only the official website\
(avoid search engines or third-party sources) and compile a detailed report saved as arcblock.md. \
The report should include comprehensive insights into the company's products \
(with detailed research findings and links), technical architecture, and future plans.`,
);
console.log(result);
// Output:
// {
//   $message: "The objective of conducting in-depth research on ArcBlock using only the official website has been successfully completed...",
// }
```

## MCP Server Integration

AIGNE Framework can integrate with external servers through the Model Context Protocol (MCP) to extend its functionality.

### Puppeteer MCP Server

The Puppeteer MCP server allows AIGNE Framework to access and manipulate web content.

**Features**:

* Navigate to URLs
* Execute JavaScript
* Extract web content

**Example**:

```typescript file="../examples/mcp-puppeteer/usages.ts"
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

const puppeteerMCPAgent = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-puppeteer"],
});

const aigne = new AIGNE({
  model,
  skills: [puppeteerMCPAgent],
});

const agent = AIAgent.from({
  instructions: `\
## Steps to extract content from a website
1. navigate to the url
2. evaluate document.body.innerText to get the content
`,
  memory: true,
});

const result = await aigne.invoke(
  agent,
  "extract content from https://www.arcblock.io",
);

console.log(result);
// output:
// {
//   $message: "The content extracted from the website [ArcBlock](https://www.arcblock.io) is as follows:\n\n---\n\n**Redefining Software Architect and Ecosystems**\n\nA total solution for building decentralized applications ...",
// }

await aigne.shutdown();
```

### SQLite MCP Server

The SQLite MCP server allows AIGNE Framework to interact with SQLite databases.

**Features**:

* Execute read queries
* Execute write queries
* Create tables
* List tables
* Describe table structure

**Example**:

```typescript file="../examples/mcp-sqlite/usages.ts"
import { join } from "node:path";
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/openai";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

const sqlite = await MCPAgent.from({
  command: "uvx",
  args: [
    "-q",
    "mcp-server-sqlite",
    "--db-path",
    join(process.cwd(), "usages.db"),
  ],
});

const aigne = new AIGNE({
  model,
  skills: [sqlite],
});

const agent = AIAgent.from({
  instructions: "You are a database administrator",
  memory: true,
});

console.log(
  await aigne.invoke(
    agent,
    "create a product table with columns name description and createdAt",
  ),
);
// output:
// {
//   $message: "The product table has been created successfully with the columns: `name`, `description`, and `createdAt`.",
// }

console.log(await aigne.invoke(agent, "create 10 products for test"));
// output:
// {
//   $message: "I have successfully created 10 test products in the database. Here are the products that were added:\n\n1. Product 1: $10.99 - Description for Product 1\n2. Product 2: $15.99 - Description for Product 2\n3. Product 3: $20.99 - Description for Product 3\n4. Product 4: $25.99 - Description for Product 4\n5. Product 5: $30.99 - Description for Product 5\n6. Product 6: $35.99 - Description for Product 6\n7. Product 7: $40.99 - Description for Product 7\n8. Product 8: $45.99 - Description for Product 8\n9. Product 9: $50.99 - Description for Product 9\n10. Product 10: $55.99 - Description for Product 10\n\nIf you need any further assistance or operations, feel free to ask!",
// }

console.log(await aigne.invoke(agent, "how many products?"));
// output:
// {
//   $message: "There are 10 products in the database.",
// }

await aigne.shutdown();
```

## Usage Patterns and Best Practices

### Choosing the Right Workflow Pattern

Consider the following factors when choosing a workflow pattern:

1. **Task Complexity**: Simple tasks can use a single Agent, complex tasks should use multi-Agent workflows
2. **Interaction Requirements**: Tasks requiring user participation are suitable for reflection or handoff workflows
3. **Parallelism**: Subtasks that can be executed independently are suitable for concurrency workflows
4. **Process Control**: Tasks that need to strictly follow steps are suitable for sequential workflows
5. **Decision Branches**: Tasks that need to dynamically select processing paths based on input are suitable for router workflows
6. **Complex Coordination**: Tasks requiring multiple specialized Agents to work together are suitable for orchestrator workflows

### Designing Effective Agent Prompts

Best practices when writing Agent instructions:

1. **Clear Role**: Clearly define the Agent's identity and responsibilities
2. **Specific Instructions**: Provide clear steps and guidance
3. **Output Format**: Specify expected output format, especially when using Schema
4. **Context Variables**: Use double curly braces `{{variable}}` to reference context variables
5. **Chain of Thought**: Encourage Agents to show their reasoning process
6. **Scope Limitations**: Clearly define what the Agent can and cannot do

### Combining Multiple Workflow Patterns

Complex applications may require combining multiple workflow patterns:

1. **Sequential + Concurrency**: Some steps execute sequentially, with one step internally executing multiple tasks concurrently
2. **Reflection + Sequential**: Sequential workflow output is improved through reflection workflow
3. **Router + Specialized Agents**: Use router to select appropriate specialized Agent to handle requests
4. **Orchestrator + All Others**: Orchestrator workflow can coordinate using Agents with all other workflow patterns

## Frequently Asked Questions

1. **How to share data between different Agents?**
   * Use `outputKey` to map an Agent's output to a specific key in the context
   * The next Agent can access this data via `{{key}}`

2. **How to handle Agent failures or errors?**
   * Use try/catch to wrap aigne.invoke calls
   * Consider possible failure paths when designing workflows, add error handling Agents

3. **How to constrain Agent output format?**
   * Use `outputSchema` to define expected output structure
   * Use Zod schema for validation and type checking

4. **How to customize communication paths between Agents?**
   * Use `subscribeTopic` and `publishTopic` to define message topics
   * Create custom topic routing logic

5. **How to integrate external systems and APIs?**
   * Use MCPAgent to connect to appropriate MCP servers
   * Create custom FunctionAgent to encapsulate API calls
