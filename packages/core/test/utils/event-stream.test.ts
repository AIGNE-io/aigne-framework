import { expect, test } from "bun:test";
import type { AgentResponseChunk, Message } from "@aigne/core";
import {
  AgentResponseStreamParser,
  AgentResponseStreamSSE,
  EventStreamParser,
} from "@aigne/core/utils/event-stream.js";
import { arrayToReadableStream, readableStreamToArray } from "@aigne/core/utils/stream-utils.js";

test("EventStreamParser should enqueue an error for invalid json", async () => {
  const stream = arrayToReadableStream([
    `data: {"delta": {"text": {"text": "hello"}}}\n\n`,
    `data: {"delta": {"text": {"text": " world"}}}\n\n`,
    "data: invalid json string\n\n",
  ]).pipeThrough(new EventStreamParser());

  expect(readableStreamToArray(stream)).resolves.toMatchSnapshot();
});

test("EventStreamParser should enqueue an error for error event", async () => {
  const stream = arrayToReadableStream([
    `data: {"delta": {"text": {"text": "hello"}}}\n\n`,
    `data: {"delta": {"text": {"text": " world"}}}\n\n`,
    `event: error\ndata: {"message": "test error"}\n\n`,
  ]).pipeThrough(new EventStreamParser());

  expect(readableStreamToArray(stream)).resolves.toMatchSnapshot();
});

test("AgentResponseStreamParser should raise error from upstream", async () => {
  const stream = arrayToReadableStream<AgentResponseChunk<Message>>([
    { delta: { text: { text: "hello" } } },
    { delta: { text: { text: " world" } } },
    new Error("should raise error"),
    { delta: { text: { text: " never" } } },
  ]).pipeThrough(new AgentResponseStreamParser());

  expect(readableStreamToArray(stream)).rejects.toThrow("should raise error");
});

test("AgentResponseStreamSSE should convert AgentResponseStream to SSE format", async () => {
  const stream = new AgentResponseStreamSSE(
    arrayToReadableStream([
      { delta: { text: { text: "hello" } } },
      { delta: { text: { text: " world" } } },
    ]),
  );

  expect(readableStreamToArray(stream)).resolves.toEqual([
    `data: {"delta":{"text":{"text":"hello"}}}\n\n`,
    `data: {"delta":{"text":{"text":" world"}}}\n\n`,
  ]);
});
