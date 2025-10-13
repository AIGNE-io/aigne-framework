# Streams

本節提供 AIGNE Core 套件中 stream 處理工具的詳細文件。這些工具對於處理非同步資料流至關重要，特別是用於管理 `Agent` 回應以及在不同格式（如 `ReadableStream`、`AsyncGenerator` 和伺服器發送事件 (SSE)）之間轉換資料。

## 總覽

stream 工具旨在提供一個強大而靈活的方式來處理各種 stream 類型。主要功能包括：

-   **轉換**：在物件、陣列、字串和不同 stream 格式之間無縫轉換資料。
-   **操作**：合併多個 streams、處理 chunks，並處理 stream 的生命週期事件。
-   **事件解析**：解析伺服器發送事件 (SSE) 並轉換 agent 回應 stream。
-   **資料提取**：從文字 stream 中提取結構化元資料。

這些工具是建構與 AI agent 互動的響應式、即時應用程式的基礎。

## 核心 Stream 工具

主要的 stream 工具位於 `packages/core/src/utils/stream-utils.ts`。它們為建立、轉換和管理 streams 提供了基礎。

### Stream 轉換

這些函式允許您將資料轉換為基於 stream 的格式或從中轉換。

#### `objectToAgentResponseStream`

將一個 JSON 物件轉換為 `AgentResponseStream`。這對於將一個完整的物件作為單一 chunk 的 stream 回傳非常有用，並符合 agent 回應格式。

**範例**

```typescript
import { objectToAgentResponseStream } from '@aigene/core/utils';

const userMessage = { id: 'user-123', text: 'Hello, agent!' };
const stream = objectToAgentResponseStream(userMessage);

// 此 stream 將發出一個包含完整物件的 chunk，然後關閉。
```

#### `agentResponseStreamToObject`

匯總來自 `AgentResponseStream` 或 `AgentProcessAsyncGenerator` 的所有 chunks，並將它們合併為單一物件。

**範例**

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

將一個 `AgentProcessAsyncGenerator` 轉換為標準的 `ReadableStream` (`AgentResponseStream`)。

**範例**

```typescript
import { asyncGeneratorToReadableStream, type AgentProcessAsyncGenerator, type AgentResponseChunk } from '@aigene/core/utils';

async function* myGenerator(): AgentProcessAsyncGenerator<{ text: string }> {
  yield { delta: { text: { text: 'Hel' } } };
  yield { delta: { text: { text: 'lo' } } };
  return { text: 'Hello' };
}

const stream = asyncGeneratorToReadableStream(myGenerator());
// 此 stream 現在可以與其他相容 ReadableStream 的 API 一起使用。
```

#### `readableStreamToArray`

讀取整個 `ReadableStream` 並將其所有 chunks 收集到一個陣列中。它可以選擇性地捕捉錯誤並將其包含在結果陣列中。

**範例**

```typescript
import { readableStreamToArray, arrayToReadableStream } from '@aigene/core/utils';

async function streamToArrayExample() {
  const chunks = [1, 2, 3, new Error('Stream failed')];
  const stream = arrayToReadableStream(chunks);

  // 不捕捉錯誤（將會拋出錯誤）
  try {
    const result = await readableStreamToArray(stream);
  } catch (e) {
    console.error(e.message); // "Stream failed"
  }

  // 捕捉錯誤
  const stream2 = arrayToReadableStream(chunks);
  const resultWithErrors = await readableStreamToArray(stream2, { catchError: true });
  console.log(resultWithErrors); // [1, 2, 3, Error: Stream failed]
}

streamToArrayExample();
```

### Stream 操作

這些函式提供了修改和組合 streams 的工具。

#### `mergeReadableStreams`

將多個 `ReadableStream` 實例合併為單一 stream。產生的 stream 將在輸入 streams 的 chunks 可用時轉發它們。它只在所有輸入 streams 都關閉後才會關閉。

**範例**

```typescript
import { mergeReadableStreams, arrayToReadableStream } from '@aigene/core/utils';

const stream1 = arrayToReadableStream(['A', 'B']);
const stream2 = arrayToReadableStream([1, 2]);

const mergedStream = mergeReadableStreams(stream1, stream2);

// 來自 mergedStream 的 chunks 可能是 'A'、1、'B'、2（順序取決於時間）
```

#### `onAgentResponseStreamEnd`

為 `AgentResponseStream` 附加監聽器以處理事件，如 chunk 處理、stream 完成 (`onResult`) 和錯誤。這允許您在 stream 關閉前檢查或修改最終結果。

**範例**

```typescript
import { onAgentResponseStreamEnd, objectToAgentResponseStream } from '@aigene/core/utils';

async function monitorStream() {
  const stream = objectToAgentResponseStream({ count: 10 });

  const monitoredStream = onAgentResponseStreamEnd(stream, {
    onResult: (result) => {
      console.log('Stream finished. Final result:', result);
      // 如果需要，您可以修改最終結果
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

  // 消費此 stream 以觸發處理程式
  for await (const chunk of monitoredStream) {
    // ...
  }
}

monitorStream();
```

## 事件 Stream 處理

這些類別位於 `packages/core/src/utils/event-stream.ts`，專為處理伺服器發送事件 (SSE) 和解析 agent 特定的事件 stream 而設計。

### `AgentResponseStreamSSE`

包裝一個 `AgentResponseStream` 並將其輸出轉換為一個 SSE 格式字串的 `ReadableStream`。這非常適合將 agent 回應直接發送給網頁客戶端。

**範例**

```typescript
import { AgentResponseStreamSSE, objectToAgentResponseStream } from '@aigene/core/utils/event-stream';

// 假設 `agentStream` 是來自 agent 呼叫的 AgentResponseStream
const agentStream = objectToAgentResponseStream({ delta: { text: { content: 'Live update!' } } });

const sseStream = new AgentResponseStreamSSE(agentStream);

// sseStream 現在將產生如下字串：
// 'data: {"delta":{"text":{"content":"Live update!"}}}\n\n'
```

### `AgentResponseStreamParser`

一個 `TransformStream`，用於處理來自 `AgentResponseStream` 的 chunks。它會智慧地合併 `text` 和 `json` 欄位的 deltas，確保每個下游 chunk 都包含 JSON 物件的完整、累積狀態。

**範例**

```typescript
import { AgentResponseStreamParser, arrayToReadableStream } from '@aigene/core/utils/event-stream';

const sourceStream = arrayToReadableStream([
  { delta: { json: { id: '123' } } },
  { delta: { json: { status: 'pending' } } },
  { delta: { text: { message: 'In progress...' } } }
]);

const parser = new AgentResponseStreamParser();
const processedStream = sourceStream.pipeThrough(parser);

// 輸出 chunks 在每一步都會有完整的 JSON 物件：
// 第 1 個 chunk: { delta: { json: { id: '123' } } }
// 第 2 個 chunk: { delta: { json: { id: '123', status: 'pending' } } }
// 第 3 個 chunk: { delta: { json: { id: '123', status: 'pending' }, text: { message: '...' } } }
```

### `AgentResponseProgressStream`

透過監聽給定 `Context` 實例上的生命週期事件（`agentStarted`、`agentSucceed`、`agentFailed`），建立一個 `AgentResponseProgress` 事件的 `ReadableStream`。這使您能夠監控整個 agent 執行流程的進度。

**範例**

```typescript
import { AgentResponseProgressStream, Context } from '@aigene/core';

// 假設 `context` 是一個活躍的 agent 執行情境
const context = new Context();
const progressStream = new AgentResponseProgressStream(context);

// 您現在可以從 progressStream 讀取以獲取 agent 任務的即時更新。
progressStream.on('data', (progress) => {
  console.log(`Agent event: ${progress.event}`, progress.agent.name);
});
```

## 進階：結構化資料提取

`ExtractMetadataTransform` 類別提供了一種專門的機制，用於解析和提取嵌入在文字 stream 中的結構化資料（例如 JSON 元資料）。

### `ExtractMetadataTransform`

這個 `TransformStream` 會掃描文字 stream 以尋找開始和結束標記，並嘗試將它們之間的內容解析為結構化資料。提取出的資料隨後會作為一個 `json` delta 發出，與周圍的文字分開。

**使用案例**：一個 agent 可能會輸出混合了結構化元資料的文字，例如：`這是一些文字... <metadata>{"key": "value"}</metadata> ...文字繼續。`這個轉換 stream 可以將文字與元資料分離。

**範例**

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

// 來自 processedStream 的 chunks 將是：
// 1. { delta: { text: { text: 'Some initial text' } } }
// 2. { delta: { json: { json: { id: 1 } } } }
// 3. { delta: { text: { text: ' and some final text.' } } }
```