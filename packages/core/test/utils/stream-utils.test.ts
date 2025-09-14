import { expect, test } from "bun:test";
import { EventEmitter } from "node:events";
import {
  agentResponseStreamToObject,
  arrayToAgentProcessAsyncGenerator,
  arrayToReadableStream,
  asyncGeneratorToReadableStream,
  mergeAgentResponseChunk,
  mergeReadableStreams,
  objectToAgentResponseStream,
  onAgentResponseStreamEnd,
  readAllString,
  readableStreamToArray,
  stringToAgentResponseStream,
  toReadableStream,
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

test("toReadableStream should generate stream correctly", async () => {
  const original = new EventEmitter() as unknown as NodeJS.ReadStream;

  const stream = readableStreamToArray(toReadableStream(original));

  original.emit("data", Buffer.from("Hello, world!"));
  original.emit("end");

  expect(await stream).toEqual([new Uint8Array(Buffer.from("Hello, world!"))]);
});

test("toReadableStream should throw error from input stream", async () => {
  const original = new EventEmitter() as unknown as NodeJS.ReadStream;

  const stream = readableStreamToArray(toReadableStream(original));

  original.emit("error", new Error("test error"));

  expect(stream).rejects.toThrowError("test error");
});

test("readAllString should read all string from ReadStream", async () => {
  const original = new EventEmitter() as unknown as NodeJS.ReadStream;

  const stream = readAllString(toReadableStream(original));

  original.emit("data", Buffer.from("Hello, world!"));
  original.emit("end");

  expect(await stream).toEqual("Hello, world!");
});

test("readAllString should read all string from ReadableStream", async () => {
  const stream = readAllString(
    new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("Hello, "));
        controller.enqueue(new TextEncoder().encode("world!"));
        controller.close();
      },
    }),
  );

  expect(await stream).toEqual("Hello, world!");
});

test("onAgentResponseStreamEnd should continue reading until end", async () => {
  const stream = onAgentResponseStreamEnd(
    arrayToReadableStream([
      { delta: { text: { text: "Hello " } } },
      { delta: {} },
      { delta: { text: { text: "world" } } },
    ]),
  );

  expect(await readableStreamToArray(stream)).toEqual([
    { delta: { text: { text: "Hello " } } },
    { delta: { text: { text: "world" } } },
  ]);
});

test("mergeReadableStreams should merge multiple streams", async () => {
  const stream1 = arrayToReadableStream([{ delta: { text: { text: "Hello" } } }]);
  const stream2 = arrayToReadableStream([{ delta: { text: { text: " world" } } }]);
  const mergedStream = mergeReadableStreams(stream1, stream2);

  expect(await readableStreamToArray(mergedStream)).toEqual([
    { delta: { text: { text: "Hello" } } },
    { delta: { text: { text: " world" } } },
  ]);
});

test("mergeReadableStreams should throw error from input stream", async () => {
  const stream1 = arrayToReadableStream([
    { delta: { text: { text: "Hello" } } },
    { delta: { text: { text: " world" } } },
    { delta: { text: { text: " SHOULD NOT MERGED" } } },
  ]);
  const stream2 = arrayToReadableStream([
    { delta: { text: { text: " 123" } } },
    new Error("test error"),
  ]);

  const mergedStream = mergeReadableStreams(stream1, stream2);
  expect(await readableStreamToArray(mergedStream, { catchError: true })).toMatchInlineSnapshot(`
    [
      {
        "delta": {
          "text": {
            "text": "Hello",
          },
        },
      },
      {
        "delta": {
          "text": {
            "text": " 123",
          },
        },
      },
      {
        "delta": {
          "text": {
            "text": " world",
          },
        },
      },
      [Error: test error],
    ]
  `);
});
