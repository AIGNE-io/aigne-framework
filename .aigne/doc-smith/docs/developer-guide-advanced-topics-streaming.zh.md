# 流

本节提供了 AIGNE Core 包中流处理工具的详细文档。这些工具对于处理异步数据流至关重要，特别是用于管理 `Agent` 响应以及在不同格式（如 `ReadableStream`、`AsyncGenerator` 和服务器发送事件 (SSE)）之间转换数据。

## 概述

流工具旨在提供一种强大而灵活的方式来处理各种流类型。其主要功能包括：

-   **转换**：在对象、数组、字符串和不同流格式之间无缝转换数据。
-   **操作**：合并多个流、处理数据块 (chunk) 以及处理流的生命周期事件。
-   **事件解析**：解析服务器发送事件 (SSE) 并转换 Agent 响应流。
-   **数据提取**：从文本流中提取结构化元数据。

这些工具是构建与 AI Agent 交互的响应式实时应用程序的基础。

## 核心流工具

主要的流工具位于 `packages/core/src/utils/stream-utils.ts`。它们为创建、转换和管理流提供了基础。

### 流转换

这些函数允许您将数据与基于流的格式进行相互转换。

#### `objectToAgentResponseStream`

将 JSON 对象转换为 `AgentResponseStream`。这对于将一个完整的对象作为符合 Agent 响应格式的单块 (single-chunk) 流返回非常有用。

**示例**

```typescript
import { objectToAgentResponseStream } from '@aigene/core/utils';

const userMessage = { id: 'user-123', text: 'Hello, agent!' };
const stream = objectToAgentResponseStream(userMessage);

// 该流将发出一个包含完整对象的块，然后关闭。
```

#### `agentResponseStreamToObject`

聚合来自 `AgentResponseStream` 或 `AgentProcessAsyncGenerator` 的所有数据块，并将它们合并成一个单一的对象。

**示例**

```typescript
import { agentResponseStreamToObject, objectToAgentResponseStream } from '@aigene/core/utils';

async function processStream() {
  const message = { result: 'This is the final object.' };
  const stream = objectToAgentResponseStream(message);

  const finalObject = await agentResponseStreamToObject(stream);
  console.log(finalObject); // { result: 'This is the final object.' }
}

processStream();
```

#### `asyncGeneratorToReadableStream`

将 `AgentProcessAsyncGenerator` 转换为标准的 `ReadableStream` (`AgentResponseStream`)。

**示例**

```typescript
import { asyncGeneratorToReadableStream, type AgentProcessAsyncGenerator, type AgentResponseChunk } from '@aigene/core/utils';

async function* myGenerator(): AgentProcessAsyncGenerator<{ text: string }> {
  yield { delta: { text: { text: 'Hel' } } };
  yield { delta: { text: { text: 'lo' } } };
  return { text: 'Hello' };
}

const stream = asyncGeneratorToReadableStream(myGenerator());
// 现在，此流可以与其他兼容 ReadableStream 的 API 一起使用。
```

#### `readableStreamToArray`

读取整个 `ReadableStream` 并将其所有数据块收集到一个数组中。它可以选择性地捕获错误并将其包含在结果数组中。

**示例**

```typescript
import { readableStreamToArray, arrayToReadableStream } from '@aigene/core/utils';

async function streamToArrayExample() {
  const chunks = [1, 2, 3, new Error('Stream failed')];
  const stream = arrayToReadableStream(chunks);

  // 不捕获错误（将抛出异常）
  try {
    const result = await readableStreamToArray(stream);
  } catch (e) {
    console.error(e.message); // "Stream failed"
  }

  // 捕获错误
  const stream2 = arrayToReadableStream(chunks);
  const resultWithErrors = await readableStreamToArray(stream2, { catchError: true });
  console.log(resultWithErrors); // [1, 2, 3, Error: Stream failed]
}

streamToArrayExample();
```

### 流操作

这些函数提供了用于修改和组合流的工具。

#### `mergeReadableStreams`

将多个 `ReadableStream` 实例合并为单个流。生成的流会在输入流的数据块可用时立即转发它们。只有在所有输入流都关闭后，该流才会关闭。

**示例**

```typescript
import { mergeReadableStreams, arrayToReadableStream } from '@aigene/core/utils';

const stream1 = arrayToReadableStream(['A', 'B']);
const stream2 = arrayToReadableStream([1, 2]);

const mergedStream = mergeReadableStreams(stream1, stream2);

// 来自 mergedStream 的数据块可能是 'A', 1, 'B', 2（顺序取决于时机）
```

#### `onAgentResponseStreamEnd`

向 `AgentResponseStream` 附加监听器，以处理数据块处理、流完成 (`onResult`) 和错误等事件。这允许您在流关闭前检查或修改最终结果。

**示例**

```typescript
import { onAgentResponseStreamEnd, objectToAgentResponseStream } from '@aigene/core/utils';

async function monitorStream() {
  const stream = objectToAgentResponseStream({ count: 10 });

  const monitoredStream = onAgentResponseStreamEnd(stream, {
    onResult: (result) => {
      console.log('Stream finished. Final result:', result);
      // 如果需要，您可以修改最终结果
      return { ...result, status: 'completed' };
    },
    onChunk: (chunk) => {
      console.log('Processing chunk...');
    },
    onError: (error) => {
      console.error('An error occurred:', error);
      return error;
    }
  });

  // 消费流以触发处理程序
  for await (const chunk of monitoredStream) {
    // ...
  }
}

monitorStream();
```

## 事件流处理

这些类位于 `packages/core/src/utils/event-stream.ts`，专为处理服务器发送事件 (SSE) 和解析特定于 Agent 的事件流而设计。

### `AgentResponseStreamSSE`

包装一个 `AgentResponseStream` 并将其输出转换为 SSE 格式字符串的 `ReadableStream`。这非常适合将 Agent 响应直接发送到 Web 客户端。

**示例**

```typescript
import { AgentResponseStreamSSE, objectToAgentResponseStream } from '@aigene/core/utils/event-stream';

// 假设 `agentStream` 是来自 Agent 调用的 AgentResponseStream
const agentStream = objectToAgentResponseStream({ delta: { text: { content: 'Live update!' } } });

const sseStream = new AgentResponseStreamSSE(agentStream);

// sseStream 现在将生成如下字符串：
// 'data: {"delta":{"text":{"content":"Live update!"}}}\n\n'
```

### `AgentResponseStreamParser`

一个 `TransformStream`，用于处理来自 `AgentResponseStream` 的数据块。它会智能地合并 `text` 和 `json` 字段的增量 (delta)，确保每个下游数据块都包含 JSON 对象的完整累积状态。

**示例**

```typescript
import { AgentResponseStreamParser, arrayToReadableStream } from '@aigene/core/utils/event-stream';

const sourceStream = arrayToReadableStream([
  { delta: { json: { id: '123' } } },
  { delta: { json: { status: 'pending' } } },
  { delta: { text: { message: 'In progress...' } } }
]);

const parser = new AgentResponseStreamParser();
const processedStream = sourceStream.pipeThrough(parser);

// 输出的数据块在每一步都将包含完整的 JSON 对象：
// 1st chunk: { delta: { json: { id: '123' } } }
// 2nd chunk: { delta: { json: { id: '123', status: 'pending' } } }
// 3rd chunk: { delta: { json: { id: '123', status: 'pending' }, text: { message: '...' } } }
```

### `AgentResponseProgressStream`

通过监听给定 `Context` 实例上的生命周期事件（`agentStarted`、`agentSucceed`、`agentFailed`），创建一个 `AgentResponseProgress` 事件的 `ReadableStream`。这使您能够监控整个 Agent 执行流程的进度。

**示例**

```typescript
import { AgentResponseProgressStream, Context } from '@aigene/core';

// 假设 `context` 是一个活跃的 Agent 执行上下文
const context = new Context();
const progressStream = new AgentResponseProgressStream(context);

// 您现在可以从 progressStream 读取数据，以获取 Agent 任务的实时更新。
progressStream.on('data', (progress) => {
  console.log(`Agent event: ${progress.event}`, progress.agent.name);
});
```

## 高级：结构化数据提取

`ExtractMetadataTransform` 类提供了一种专门的机制，用于解析和提取嵌入在文本流中的结构化数据（例如，JSON 元数据）。

### `ExtractMetadataTransform`

这个 `TransformStream` 会扫描文本流以查找开始和结束标记，并尝试将它们之间的内容解析为结构化数据。提取的数据随后会作为一个与周围文本分离的 `json` 增量 (delta) 发出。

**用例**：一个 Agent 可能会输出混合了结构化元数据的文本，例如：`Here is some text... <metadata>{"key": "value"}</metadata> ...and the text continues.`。这个转换流可以将文本与元数据分离开来。

**示例**

```typescript
import { ExtractMetadataTransform } from '@aigene/core/utils/structured-stream-extractor';
import { arrayToReadableStream } from '@aigene/core/utils';

const stream = arrayToReadableStream([
  { delta: { text: { text: 'Some initial text ' } } },
  { delta: { text: { text: 'START_JSON{"id":1}END_JSON' } } },
  { delta: { text: { text: ' and some final text.' } } },
]);

const extractor = new ExtractMetadataTransform({
  start: 'START_JSON',
  end: 'END_JSON',
  parse: (raw) => JSON.parse(raw),
});

const processedStream = stream.pipeThrough(extractor);

// 来自 processedStream 的数据块将是：
// 1. { delta: { text: { text: 'Some initial text' } } }
// 2. { delta: { json: { json: { id: 1 } } } }
// 3. { delta: { text: { text: ' and some final text.' } } }
```