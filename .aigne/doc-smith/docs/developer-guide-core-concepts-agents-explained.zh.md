# Agent 详解

`Agent` 是 AIGNE 框架中的基本构建块。从概念上讲，Agent 是一个旨在执行特定任务的自主实体。它接收输入，根据其定义的逻辑进行处理，并产生输出。框架中的每个专用 Agent，例如 `AIAgent` 或 `TeamAgent`，都继承自这个基础 `Agent` 类。

本节详细介绍基础 `Agent` 类的结构、属性和生命周期，为创建自定义 Agent 提供所需的基础知识。

## 核心属性

`Agent` 通过其选项进行配置，这些选项定义了其身份、行为和能力。主要属性概述如下。

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="false" data-desc="Agent 的唯一标识符。如果未提供，则默认为类构造函数名。它用于日志记录和识别目的。"></x-field>
  <x-field data-name="description" data-type="string" data-required="false" data-desc="对 Agent 功能的人类可读描述。这对于文档记录以及其他 Agent 理解其用途很有用。"></x-field>
  <x-field data-name="inputSchema" data-type="ZodObject" data-required="false" data-desc="一个 Zod schema，用于定义输入数据的预期结构。Agent 使用它来验证传入的消息。"></x-field>
  <x-field data-name="outputSchema" data-type="ZodObject" data-required="false" data-desc="一个 Zod schema，用于定义 Agent 的输出结构。这确保 Agent 产生一致且有效的结果。"></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="false" data-desc="该 Agent 可以调用的其他 Agent 的列表。技能允许您通过将任务委托给专门的子 Agent 来组合复杂的行为。"></x-field>
  <x-field data-name="memory" data-type="MemoryAgent | MemoryAgent[]" data-required="false" data-desc="一个或多个内存 Agent，该 Agent 可用于存储和检索过去交互的信息，从而实现有状态的对话。"></x-field>
  <x-field data-name="subscribeTopic" data-type="string | string[]" data-required="false" data-desc="Agent 在消息队列上订阅的主题。Agent 将处理发布到这些主题的任何消息。"></x-field>
  <x-field data-name="publishTopic" data-type="string | string[] | Function" data-required="false" data-desc="Agent 将其输出发布到的主题。这允许其他 Agent 对其结果做出反应。"></x-field>
</x-field-group>

## Agent 生命周期

当调用 Agent 时，它会经历一个定义明确的方法生命周期。这确保了执行是可预测的，并为预处理、后处理和错误处理提供了钩子。

执行 Agent 的主要入口点是 `invoke()` 方法。

```typescript Agent 生命周期流 icon=lucide:workflow
direction: right
style: {
  fill: "#f2f2f2"
}

invoke: 开始

subgraph 预处理 {
  style.label: {
    "font-size": 12
  }
  call_hooks: 调用 'onStart' 钩子
  validate_input: 验证输入 Schema
  preprocess: 运行 preprocess()
}

subgraph 核心逻辑 {
  style.label: {
    "font-size": 12
  }
  process: 运行抽象 process()
}

subgraph 后处理 {
  style.label: {
    "font-size": 12
  }
  validate_output: 验证输出 Schema
  postprocess: 运行 postprocess()
  call_hooks_2: 调用 'onSuccess'/'onEnd' 钩子
  publish: 发布到主题
}

error_handling: {
  shape: cylinder
  label: 错误处理
}

invoke -> call_hooks -> validate_input -> preprocess -> process
process -> validate_output -> postprocess -> call_hooks_2 -> publish

validate_input -> error_handling: fail
process -> error_handling: fail
validate_output -> error_handling: fail
postprocess -> error_handling: fail

```

1.  **调用**：调用 `invoke(input, options)` 方法。它设置执行上下文并启动生命周期。
2.  **启动钩子**：执行 `onStart` 生命周期钩子。这些钩子可用于在处理前记录日志或修改输入。
3.  **输入验证**：根据 Agent 的 `inputSchema` 验证传入的 `input`。如果验证失败，则会抛出错误。
4.  **预处理**：调用 `preprocess()` 方法。这个内部方法处理诸如检查上下文状态和使用限制之类的任务。
5.  **核心处理**：执行 `process(input, options)` 方法。这是每个 Agent 子类都必须实现的抽象方法。它包含 Agent 的核心逻辑，是主要工作完成的地方。
6.  **输出验证**：根据 Agent 的 `outputSchema` 验证 `process()` 方法的结果。
7.  **后处理**：调用 `postprocess()` 方法。这个内部方法处理诸如将结果发布到主题和将交互记录到内存之类的任务。
8.  **结束钩子**：执行 `onSuccess` 和 `onEnd` 钩子，以进行最终的日志记录、清理或结果转换。
9.  **返回值**：最终经过验证的输出将返回给原始调用者。

如果在任何阶段发生错误，流程将被中断，并执行 `onError` 和 `onEnd` 钩子，作为 `processAgentError` 例程的一部分。

## `process()` 方法

`process()` 方法是每个 Agent 的核心。它是基类中的一个 `abstract` 方法，这意味着您**必须**在自己的自定义 Agent 中实现它。该方法定义了 Agent 的独特行为。

`process()` 方法非常灵活，可以返回多种类型的值，从而实现不同的执行模式：

1.  **直接对象**：对于简单的、类似同步的操作，您可以直接返回最终的输出对象。

    ```typescript 直接对象返回 icon=logos:typescript
    import { Agent, type AgentInvokeOptions } from "@aigne/core";

    class EchoAgent extends Agent<{ message: string }, { response: string }> {
      process(input: { message: string }, options: AgentInvokeOptions) {
        // 直接返回最终对象
        return { response: `You said: ${input.message}` };
      }
    }
    ```

2.  **流式响应 (`ReadableStream`)**：对于长时间运行的任务或实时更新，您可以返回一个 `AgentResponseChunk` 对象的 `ReadableStream`。

    ```typescript 流式响应 icon=logos:typescript
    import { Agent, type AgentInvokeOptions, objectToAgentResponseStream } from "@aigne/core";

    class TickerAgent extends Agent<{ count: number }, { tick: number }> {
      process(input: { count: number }, options: AgentInvokeOptions) {
        const stream = new ReadableStream({
          async start(controller) {
            for (let i = 1; i <= input.count; i++) {
              await new Promise(resolve => setTimeout(resolve, 500));
              const chunk = { delta: { json: { tick: i } } };
              controller.enqueue(chunk);
            }
            controller.close();
          }
        });
        return stream;
      }
    }
    ```

3.  **异步生成器**：作为一种语法上更方便的创建流的方式，您可以使用 `async* function`（异步生成器）。

    ```typescript 异步生成器 icon=logos:typescript
    import { Agent, type AgentInvokeOptions } from "@aigne/core";

    class AsyncTickerAgent extends Agent<{ count: number }, { tick: number }> {
      async* process(input: { count: number }, options: AgentInvokeOptions) {
        for (let i = 1; i <= input.count; i++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          // 生成每块数据
          yield { delta: { json: { tick: i } } };
        }
      }
    }
    ```

4.  **另一个 Agent (Handoff)**：您可以返回另一个 `Agent` 实例来转移控制权或移交任务。框架将使用原始输入自动调用返回的 Agent。

    ```typescript Agent Handoff icon=logos:typescript
    import { Agent, type AgentInvokeOptions, FunctionAgent } from "@aigne/core";

    const SpecialistAgent = new FunctionAgent({
      name: "Specialist",
      process: async (input: { task: string }) => ({ result: `Completed ${input.task}` })
    });

    class RouterAgent extends Agent<{ task: string }, { result: string }> {
      process(input: { task: string }, options: AgentInvokeOptions) {
        if (input.task === "special") {
          // 移交给另一个 Agent
          return SpecialistAgent;
        }
        return { result: "Completed generic task" };
      }
    }
    ```

## 总结

基础 `Agent` 类为创建专门的 AI 工作者提供了坚实的基础。它建立了一个清晰的生命周期，处理数据验证，并提供了一个灵活的 `process` 方法来实现任何期望的行为。理解这些核心概念是构建强大、模块化 AI 应用程序的第一步。

要了解这个基类如何扩展为具体的实现，请继续阅读 [Agent 类型与示例](./developer-guide-agent-types-and-examples.md) 部分。