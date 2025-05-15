import { expect, test } from "bun:test";
import {
  agentResponseStreamToObject,
  arrayToAgentProcessAsyncGenerator,
  arrayToReadableStream,
  asyncGeneratorToReadableStream,
  mergeAgentResponseChunk,
  objectToAgentResponseStream,
  onAgentResponseStreamEnd,
  readableStreamToArray,
  stringToAgentResponseStream,
} from "@aigne/core/utils/stream-utils.js";

test("objectToAgentResponseStream should generate stream correctly", async () => {
  const stream = objectToAgentResponseStream({ foo: "foo", bar: "bar" });
  expect(readableStreamToArray(stream)).resolves.toMatchSnapshot();
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
    arrayToReadableStream([
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

  expect(readableStreamToArray(stream)).resolves.toMatchSnapshot();
});

test("arrayToAgentResponseStream should enqueue error", async () => {
  const stream = arrayToReadableStream([new Error("test error")]);
  const reader = stream.getReader();
  expect(reader.read()).rejects.toThrowError("test error");
});

test("arrayToAgentResponseStream should enqueue data", async () => {
  const stream = arrayToReadableStream([{ delta: { json: { text: "hello" } } }]);
  expect(readableStreamToArray(stream)).resolves.toMatchSnapshot();
});

test("readableStreamToArray should collect chunks correctly", async () => {
  const stream = arrayToReadableStream([
    { delta: { text: { text: "hello" } } },
    { delta: { text: { text: " world" } } },
  ]);
  expect(readableStreamToArray(stream)).resolves.toMatchSnapshot();
});

test("stringToAgentResponseStream should generate stream correctly", async () => {
  expect(
    readableStreamToArray(stringToAgentResponseStream("Hello, How can I assist you today?")),
  ).resolves.toMatchSnapshot();
});

test("stringToAgentResponseStream should generate stream with Chinese correctly", async () => {
  expect(
    readableStreamToArray(stringToAgentResponseStream("你好，我能帮你什么？", "custom_text")),
  ).resolves.toMatchSnapshot();
});

test("onAgentResponseStreamEnd should continue reading until end", async () => {
  const stream = onAgentResponseStreamEnd(
    arrayToReadableStream([
      { delta: { text: { text: "Hello " } } },
      { delta: {} },
      { delta: { text: { text: "world" } } },
    ]),
    () => {},
  );

  expect(await readableStreamToArray(stream)).toEqual([
    { delta: { text: { text: "Hello " } } },
    { delta: { text: { text: "world" } } },
  ]);
});
