# Function Agent

`FunctionAgent` 是一个简单而强大的 Agent，可以执行一个特定的、预定义的 JavaScript 函数。与使用大语言模型生成响应的 `AIAgent` 不同，`FunctionAgent` 是确定性的：它接收输入，运行你的代码，然后返回输出。这使其成为需要可靠、可预测逻辑任务的理想工具。

你可以把 `FunctionAgent` 看作是一种封装任何现有代码片段的方式——无论是简单的计算、数据转换，还是对外部 API 的调用——并使其在 AIGNE 生态系统中作为构建块可用。然后，这些 Agent 可以被其他更复杂的 Agent（如 [Team Agent](./core-agents-team-agent.md)）用作专门的“工具”。

## 工作原理

`FunctionAgent` 的核心是其 `process` 函数。当 Agent 运行时，它只是将输入传递给此函数并返回结果。这种简单的执行流程使你能够将任何自定义逻辑无缝集成到你的 AI 工作流中。

下图说明了该过程：

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

## 基本用法

创建 `FunctionAgent` 就像定义一个函数一样简单。让我们创建一个作为简单计算器的 Agent。

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

在此示例中，我们定义了一个接收两个数字和一个运算符的 Agent。`process` 函数包含核心逻辑，而 `input_schema` 确保在函数被调用之前输入是有效的，从而防止常见错误。

### 示例响应

当 Agent 运行时，框架会将 `process` 函数的返回值包装成一个标准的输出对象。

```json Response icon=mdi:code-json
{
  "output": 50
}
```

## 构造函数

`FunctionAgent` 构造函数接受一个配置对象来定义其行为。

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="true">
    <x-field-desc markdown>Agent 的唯一名称，用于识别和记录。</x-field-desc>
  </x-field>
  <x-field data-name="description" data-type="string" data-required="true">
    <x-field-desc markdown>对 Agent 功能的清晰、人类可读的描述。当该 Agent 被其他 Agent 用作工具时，这一点至关重要。</x-field-desc>
  </x-field>
  <x-field data-name="input_schema" data-type="z.ZodObject" data-required="false">
    <x-field-desc markdown>一个来自 `zod` 库的 schema，用于验证 Agent 的输入。强烈建议使用此 schema 以确保数据完整性并防止运行时错误。</x-field-desc>
  </x-field>
  <x-field data-name="output_schema" data-type="z.ZodObject" data-required="false">
    <x-field-desc markdown>一个 `zod` schema，用于验证 Agent 的输出。这对于确保函数返回符合预期格式的数据很有用。</x-field-desc>
  </x-field>
  <x-field data-name="process" data-type="(inputs: T_in, context: Context) => Promise<T_out>" data-required="true">
    <x-field-desc markdown>包含 Agent 核心逻辑的异步 JavaScript 函数。它接收两个参数：`inputs`（要处理的数据，与 `input_schema` 匹配）和 `context`（运行的共享上下文对象）。</x-field-desc>
  </x-field>
</x-field-group>

## 使用 Context 对象

`process` 函数还接收一个 `Context` 对象作为其第二个参数。该对象功能强大，可用于观察 Agent 的执行并在应用程序的不同部分之间共享状态。

以下是一个 Agent 示例，它使用上下文的观察者在其执行期间记录一条消息。

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

现在你已经知道如何构建确定性工具，你可以探索 [AIAgent](./core-agents-ai-agent.md) 以处理更动态、由 AI 驱动的任务，或者学习如何使用 [Team Agent](./core-agents-team-agent.md) 来协调多个 Agent。