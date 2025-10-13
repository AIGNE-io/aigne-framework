# Streams

This section provides detailed documentation on the stream processing utilities within the AIGNE Core package. These utilities are essential for handling asynchronous data flows, particularly for managing `Agent` responses and converting data between different formats like `ReadableStream`, `AsyncGenerator`, and Server-Sent Events (SSE).

## Overview

The stream utilities are designed to provide a robust and flexible way to work with various stream types. Key functionalities include:

-   **Conversion**: Seamlessly convert data between objects, arrays, strings, and different stream formats.
-   **Manipulation**: Merge multiple streams, process chunks, and handle stream lifecycle events.
-   **Event Parsing**: Parse Server-Sent Events (SSE) and transform agent response streams.
-   **Data Extraction**: Extract structured metadata from within a stream of text.

These tools are fundamental for building responsive, real-time applications that interact with AI agents.

## Core Stream Utilities

The primary stream utilities are located in `packages/core/src/utils/stream-utils.ts`. They provide the foundation for creating, converting, and managing streams.

### Stream Conversion

These functions allow you to convert data to and from stream-based formats.

#### `objectToAgentResponseStream`

Converts a JSON object into an `AgentResponseStream`. This is useful for returning a complete object as a single-chunk stream, conforming to the agent response format.

**Example**

```typescript
import { objectToAgentResponseStream } from '@aigene/core/utils';

const userMessage = { id: 'user-123', text: 'Hello, agent!' };
const stream = objectToAgentResponseStream(userMessage);

// The stream will emit one chunk containing the full object and then close.
```

#### `agentResponseStreamToObject`

Aggregates all chunks from an `AgentResponseStream` or `AgentProcessAsyncGenerator` and merges them into a single object.

**Example**

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

Converts an `AgentProcessAsyncGenerator` into a standard `ReadableStream` (`AgentResponseStream`).

**Example**

```typescript
import { asyncGeneratorToReadableStream, type AgentProcessAsyncGenerator, type AgentResponseChunk } from '@aigene/core/utils';

async function* myGenerator(): AgentProcessAsyncGenerator<{ text: string }> {
  yield { delta: { text: { text: 'Hel' } } };
  yield { delta: { text: { text: 'lo' } } };
  return { text: 'Hello' };
}

const stream = asyncGeneratorToReadableStream(myGenerator());
// This stream can now be used with other ReadableStream-compatible APIs.
```

#### `readableStreamToArray`

Reads an entire `ReadableStream` and collects all its chunks into an array. It can optionally catch and include errors in the resulting array.

**Example**

```typescript
import { readableStreamToArray, arrayToReadableStream } from '@aigene/core/utils';

async function streamToArrayExample() {
  const chunks = [1, 2, 3, new Error('Stream failed')];
  const stream = arrayToReadableStream(chunks);

  // Without catching errors (will throw)
  try {
    const result = await readableStreamToArray(stream);
  } catch (e) {
    console.error(e.message); // "Stream failed"
  }

  // With error catching
  const stream2 = arrayToReadableStream(chunks);
  const resultWithErrors = await readableStreamToArray(stream2, { catchError: true });
  console.log(resultWithErrors); // [1, 2, 3, Error: Stream failed]
}

streamToArrayExample();
```

### Stream Manipulation

These functions provide tools for modifying and combining streams.

#### `mergeReadableStreams`

Merges multiple `ReadableStream` instances into a single stream. The resulting stream will forward chunks from the input streams as they become available. It closes only after all input streams have closed.

**Example**

```typescript
import { mergeReadableStreams, arrayToReadableStream } from '@aigene/core/utils';

const stream1 = arrayToReadableStream(['A', 'B']);
const stream2 = arrayToReadableStream([1, 2]);

const mergedStream = mergeReadableStreams(stream1, stream2);

// Chunks from mergedStream could be 'A', 1, 'B', 2 (order depends on timing)
```

#### `onAgentResponseStreamEnd`

Attaches listeners to an `AgentResponseStream` to handle events like chunk processing, stream completion (`onResult`), and errors. This allows you to inspect or modify the final result before the stream closes.

**Example**

```typescript
import { onAgentResponseStreamEnd, objectToAgentResponseStream } from '@aigene/core/utils';

async function monitorStream() {
  const stream = objectToAgentResponseStream({ count: 10 });

  const monitoredStream = onAgentResponseStreamEnd(stream, {
    onResult: (result) => {
      console.log('Stream finished. Final result:', result);
      // You can modify the final result if needed
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

  // Consume the stream to trigger the handlers
  for await (const chunk of monitoredStream) {
    // ...
  }
}

monitorStream();
```

## Event Stream Processing

Located in `packages/core/src/utils/event-stream.ts`, these classes are designed for handling Server-Sent Events (SSE) and parsing agent-specific event streams.

### `AgentResponseStreamSSE`

Wraps an `AgentResponseStream` and transforms its output into a `ReadableStream` of SSE-formatted strings. This is ideal for sending agent responses directly to a web client.

**Example**

```typescript
import { AgentResponseStreamSSE, objectToAgentResponseStream } from '@aigene/core/utils/event-stream';

// Assume `agentStream` is an AgentResponseStream from an agent call
const agentStream = objectToAgentResponseStream({ delta: { text: { content: 'Live update!' } } });

const sseStream = new AgentResponseStreamSSE(agentStream);

// sseStream will now produce strings like:
// 'data: {"delta":{"text":{"content":"Live update!"}}}\n\n'
```

### `AgentResponseStreamParser`

A `TransformStream` that processes chunks from an `AgentResponseStream`. It intelligently merges deltas for `text` and `json` fields, ensuring that each downstream chunk contains the complete, accumulated state of the JSON object.

**Example**

```typescript
import { AgentResponseStreamParser, arrayToReadableStream } from '@aigene/core/utils/event-stream';

const sourceStream = arrayToReadableStream([
  { delta: { json: { id: '123' } } },
  { delta: { json: { status: 'pending' } } },
  { delta: { text: { message: 'In progress...' } } }
]);

const parser = new AgentResponseStreamParser();
const processedStream = sourceStream.pipeThrough(parser);

// The output chunks will have the full JSON object at each step:
// 1st chunk: { delta: { json: { id: '123' } } }
// 2nd chunk: { delta: { json: { id: '123', status: 'pending' } } }
// 3rd chunk: { delta: { json: { id: '123', status: 'pending' }, text: { message: '...' } } }
```

### `AgentResponseProgressStream`

Creates a `ReadableStream` of `AgentResponseProgress` events by listening to lifecycle events (`agentStarted`, `agentSucceed`, `agentFailed`) on a given `Context` instance. This allows you to monitor the progress of an entire agent execution flow.

**Example**

```typescript
import { AgentResponseProgressStream, Context } from '@aigene/core';

// Assume `context` is an active agent execution context
const context = new Context();
const progressStream = new AgentResponseProgressStream(context);

// You can now read from progressStream to get live updates on agent tasks.
progressStream.on('data', (progress) => {
  console.log(`Agent event: ${progress.event}`, progress.agent.name);
});
```

## Advanced: Structured Data Extraction

The `ExtractMetadataTransform` class provides a specialized mechanism for parsing and extracting structured data (e.g., JSON metadata) embedded within a text stream.

### `ExtractMetadataTransform`

This `TransformStream` scans a text stream for start and end markers and attempts to parse the content between them as structured data. The extracted data is then emitted as a `json` delta, separate from the surrounding text.

**Use Case**: An agent might output text mixed with structured metadata, like this: `Here is some text... <metadata>{"key": "value"}</metadata> ...and the text continues.` This transform stream can isolate the text from the metadata.

**Example**

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

// Chunks from processedStream will be:
// 1. { delta: { text: { text: 'Some initial text' } } }
// 2. { delta: { json: { json: { id: 1 } } } }
// 3. { delta: { text: { text: ' and some final text.' } } }
```