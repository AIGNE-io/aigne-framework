# Runnable

`Runnable` 是 AIGNE Framework 中的核心概念，是最基础的可执行单元。每个 `Runnable` 都可以在 AIGNE Framework 中组合和运行。

## 概述

`Runnable` 是最基础的接口定义，描述了以下内容：

- **输入**：运行一个 `Runnable` 所需的输入参数。
- **输出**：运行一个 `Runnable` 返回的输出结果。
- **运行**：如何运行一个 `Runnable`。

要实现一个 `Runnable`，只需实现 `Runnable` 接口中的 `run` 方法（即运行逻辑）。实现 `Runnable` 的方式有多种：

- **大语言模型**：使用大语言模型实现 `run` 方法来创建一个 AI Agent。
- **函数**：使用 JavaScript 函数实现 `run` 方法来进行精确计算。
- **开放 API**：包装任意开放 API 实现 `run` 方法来调用公共 API。
- **Blocklet API**：通过 Blocklet API 使用 Blocklet 环境提供的各项服务。

## 接口定义

`Runnable` 接口定义如下：

```typescript
export interface Runnable<
  I extends { [name: string]: any } = {},
  O extends { [name: string]: any } = {},
  State extends ContextState = ContextState,
> {
  inputs: { [key in keyof I]: DataType };

  outputs: { [key in keyof O]: DataType };

  run(input: I, options?: RunOptions): Promise<RunnableResponse<O>>;
}
```

### 属性说明

- **`inputs`**：定义了 `Runnable` 的输入参数结构，其 `key` 为参数名称，`value` 为参数类型（`DataType`）。
- **`outputs`**：定义了 `Runnable` 的输出数据结构，其 `key` 为输出名称，`value` 为输出类型（`DataType`）。
- **`run`**：定义了 `Runnable` 的运行逻辑，接收输入参数 `input` 和一个可选的运行选项 `options`，并返回一个包含输出数据的 Promise。

### 流式输出

`Runnable` 的 `run` 方法支持流式输出。通过在 `RunOptions` 中设置 `stream: true`，可以启用流式输出功能。

当启用流式模式时，`run` 方法可以返回一个 `ReadableStream` 对象，以流式传输输出数据。

#### 示例

以下是 `RunOptions` 的定义：

```typescript
export interface RunOptions {
  stream?: boolean;
}
```

### 使用流式输出的示例

```typescript
const resultStream = runnable.run(inputData, { stream: true });

for await (const chunk of resultStream) {
  console.log(chunk);
}
```

## 总结

`Runnable` 是 AIGNE Framework 的核心组件，提供了强大的扩展能力和灵活的实现方式。通过实现 `Runnable` 接口，您可以轻松定义自定义逻辑并将其集成到更复杂的应用中。
