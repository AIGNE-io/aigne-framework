import { expect, test } from "bun:test";
import {
  agentResponseStreamToObject,
  arrayToAgentProcessAsyncGenerator,
  arrayToAgentResponseStream,
  asyncGeneratorToReadableStream,
  mergeAgentResponseChunk,
  objectToAgentResponseStream,
} from "@aigne/core/utils/stream-utils.js";

test("objectToAgentResponseStream should generate stream correctly", async () => {
  const stream = objectToAgentResponseStream({ foo: "foo", bar: "bar" });
  const reader = stream.getReader();
  expect(reader.read()).resolves.toEqual({
    done: false,
    value: { delta: { json: { foo: "foo", bar: "bar" } } },
  });
  expect(reader.read()).resolves.toEqual({ done: true, value: undefined });
});

test("mergeAgentResponseChunk should merge correctly", async () => {
  // New field
  expect(mergeAgentResponseChunk({}, { delta: { text: { text: "hello" } } })).toEqual({
    text: "hello",
  });

  // Merge existing field
  expect(
    mergeAgentResponseChunk({ text: "hello" }, { delta: { text: { text: " world" } } }),
  ).toEqual({
    text: "hello world",
  });

  // Override existing text
  expect(
    mergeAgentResponseChunk({ text: "hello" }, { delta: { json: { text: "world" } } }),
  ).toEqual({
    text: "world",
  });
});

test("agentResponseStreamToObject should process asyncGenerator correctly", async () => {
  const result = await agentResponseStreamToObject<{
    text: string;
    foo: string;
  }>(
    arrayToAgentProcessAsyncGenerator(
      [
        { delta: { text: { text: "hello" } } },
        { delta: { text: { text: "," } } },
        { delta: { text: { text: " world" } } },
      ],
      {
        foo: "foo",
      },
    ),
  );
  expect(result).toEqual({
    text: "hello, world",
    foo: "foo",
  });
});

test("agentResponseStreamToObject should process readableStream correctly", async () => {
  const result = await agentResponseStreamToObject(
    arrayToAgentResponseStream([
      { delta: { text: { text: "hello" } } },
      { delta: { text: { text: "," } } },
      { delta: { text: { text: " world" } } },
    ]),
  );
  expect(result).toEqual({
    text: "hello, world",
  });
});

test("asyncGeneratorToReadableStream should process readableStream correctly", async () => {
  const stream = asyncGeneratorToReadableStream(
    arrayToAgentProcessAsyncGenerator([{ delta: { json: { text: "hello" } } }], {
      text: "hello, world",
    }),
  );

  const reader = stream.getReader();
  expect(reader.read()).resolves.toEqual({
    done: false,
    value: { delta: { json: { text: "hello" } } },
  });
  expect(reader.read()).resolves.toEqual({
    done: false,
    value: { delta: { json: { text: "hello, world" } } },
  });
  expect(reader.read()).resolves.toEqual({ done: true, value: undefined });
});

test("arrayToAgentResponseStream should enqueue error", async () => {
  const stream = arrayToAgentResponseStream([new Error("test error")]);
  const reader = stream.getReader();
  expect(reader.read()).rejects.toThrowError("test error");
});

test("arrayToAgentResponseStream should enqueue data", async () => {
  const stream = arrayToAgentResponseStream([{ delta: { json: { text: "hello" } } }]);
  const reader = stream.getReader();
  expect(reader.read()).resolves.toEqual({
    done: false,
    value: { delta: { json: { text: "hello" } } },
  });
  expect(reader.read()).resolves.toEqual({ done: true, value: undefined });
});
