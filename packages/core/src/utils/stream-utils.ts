import equal from "fast-deep-equal";
import {
  type AgentProcessAsyncGenerator,
  type AgentResponseChunk,
  type AgentResponseStream,
  isAgentResponseDelta,
  isEmptyChunk,
  type Message,
} from "../agents/agent.js";
import { isNonNullable, isRecord, omitBy, type PromiseOrValue } from "./type-utils.js";
import "./stream-polyfill.js";
import type { ReadableStreamDefaultReadResult } from "bun";

export function objectToAgentResponseStream<T extends Message>(json: T): AgentResponseStream<T> {
  if (!isRecord(json)) {
    throw new Error(
      `expect to return a record type such as {result: ...}, but got (${typeof json}): ${json}`,
    );
  }

  return new ReadableStream({
    pull(controller) {
      controller.enqueue({ delta: { json } });
      controller.close();
    },
  });
}

export function mergeAgentResponseChunk<T extends Message>(
  output: T,
  chunk: AgentResponseChunk<T>,
) {
  if (isAgentResponseDelta(chunk)) {
    if (chunk.delta.text) {
      for (const [key, text] of Object.entries(chunk.delta.text)) {
        const original = output[key] as string | undefined;
        const t = (original || "") + (text || "");
        if (t) Object.assign(output, { [key]: t });
      }
    }

    if (chunk.delta.json) {
      Object.assign(
        output,
        omitBy(chunk.delta.json, (v) => v === undefined),
      );
    }
  }

  return output;
}

export async function agentResponseStreamToObject<T extends Message>(
  stream: AgentResponseStream<T> | AgentProcessAsyncGenerator<T>,
): Promise<T> {
  const json: T = {} as T;

  if (stream instanceof ReadableStream) {
    for await (const value of stream) {
      mergeAgentResponseChunk(json, value);
    }
  } else {
    for (;;) {
      const chunk = await stream.next();
      if (chunk.value) {
        if (chunk.done) {
          Object.assign(json, chunk.value);
        } else {
          mergeAgentResponseChunk(json, chunk.value);
        }
      }
      if (chunk.done) break;
    }
  }

  return json;
}

export function asyncGeneratorToReadableStream<T extends Message>(
  generator: AgentProcessAsyncGenerator<T>,
): AgentResponseStream<T> {
  return new ReadableStream({
    async pull(controller) {
      try {
        const chunk = await generator.next();
        if (chunk.value) {
          if (chunk.done) {
            controller.enqueue({ delta: { json: chunk.value } });
          } else {
            controller.enqueue(chunk.value);
          }
        }

        if (chunk.done) {
          controller.close();
        }
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

export function onAgentResponseStreamEnd<T extends Message>(
  stream: AgentResponseStream<T>,
  options?: {
    onChunk?: (
      chunk: AgentResponseChunk<T>,
    ) => PromiseOrValue<AgentResponseChunk<T> | undefined | void>;
    onResult?: (result: T) => PromiseOrValue<Partial<T> | undefined | void>;
    onError?: (error: Error) => PromiseOrValue<Error>;
  },
): AgentResponseStream<T> {
  const json: T = {} as T;
  const reader = stream.getReader();

  return new ReadableStream({
    async pull(controller) {
      try {
        while (true) {
          const { value, done } = await reader.read();

          if (done) {
            const result = (await options?.onResult?.(json)) ?? json;

            if (result && !equal(result, json)) {
              let chunk: AgentResponseChunk<T> = { delta: { json: result } };
              chunk = (await options?.onChunk?.(chunk)) ?? chunk;
              controller.enqueue(chunk);
            }

            controller.close();

            return;
          }

          mergeAgentResponseChunk(json, value);

          const chunk = (await options?.onChunk?.(value)) ?? value;
          if (!isEmptyChunk(chunk)) {
            controller.enqueue(chunk);
            break;
          }
        }
      } catch (error) {
        controller.error((await options?.onError?.(error)) ?? error);
      }
    },
  });
}

export function isAsyncGenerator<T extends AsyncGenerator>(
  value: AsyncGenerator | unknown,
): value is T {
  return typeof value === "object" && value !== null && Symbol.asyncIterator in value;
}

export async function* arrayToAgentProcessAsyncGenerator<T extends Message>(
  chunks: (AgentResponseChunk<T> | Error)[],
  result?: Partial<T>,
): AgentProcessAsyncGenerator<T> {
  for (const chunk of chunks) {
    if (chunk instanceof Error) throw chunk;

    yield chunk;
  }
  if (result !== undefined) return result;
}

export function arrayToReadableStream<T>(chunks: (T | Error)[]): ReadableStream<T> {
  const list = [...chunks];

  return new ReadableStream({
    pull(controller) {
      const item = list.shift();
      if (!item) {
        controller.close();
        return;
      }

      if (item instanceof Error) {
        controller.error(item);
        return;
      }

      controller.enqueue(item);
    },
  });
}

export async function readableStreamToArray<T>(
  stream: ReadableStream<T>,
  options: { catchError: true },
): Promise<(T | Error)[]>;
export async function readableStreamToArray<T>(
  stream: ReadableStream<T>,
  options?: { catchError?: boolean },
): Promise<T[]>;
export async function readableStreamToArray<T>(
  stream: ReadableStream<T>,
  options?: { catchError?: boolean },
): Promise<(T | Error)[]> {
  const result: T[] = [];
  try {
    for await (const value of stream) {
      result.push(value);
    }
  } catch (error) {
    if (!options?.catchError) throw error;

    result.push(error);
  }
  return result;
}

export function stringToAgentResponseStream(
  str: string,
  key: "text" | string = "text",
): AgentResponseStream<Message> {
  const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });
  const segments = segmenter.segment(str);

  return arrayToReadableStream(
    Array.from(segments).map((segment) => ({ delta: { text: { [key]: segment.segment } } })),
  );
}

export function toReadableStream(stream: NodeJS.ReadStream) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      const onData = (chunk: Buffer) => {
        controller.enqueue(new Uint8Array(chunk));
      };

      const onEnd = () => {
        cleanup();
        controller.close();
      };

      const onError = (err: Error) => {
        cleanup();
        controller.error(err);
      };

      function cleanup() {
        stream.off("data", onData);
        stream.off("end", onEnd);
        stream.off("error", onError);
      }

      stream.on("data", onData);
      stream.on("end", onEnd);
      stream.on("error", onError);
    },
  });
}

export async function readAllString(stream: NodeJS.ReadStream | ReadableStream): Promise<string> {
  return (
    await readableStreamToArray(
      (stream instanceof ReadableStream ? stream : toReadableStream(stream)).pipeThrough(
        new TextDecoderStream(),
      ),
    )
  ).join("");
}

export function mergeReadableStreams<T1, T2>(
  s1: ReadableStream<T1>,
  s2: ReadableStream<T2>,
): ReadableStream<T1 | T2>;
export function mergeReadableStreams(
  ...streams: (ReadableStream<any> | undefined)[]
): ReadableStream<any>;
export function mergeReadableStreams(
  ...streams: (ReadableStream<any> | undefined)[]
): ReadableStream<any> {
  type Reader = {
    reader: ReadableStreamDefaultReader;
    reading?: Promise<{
      result: ReadableStreamDefaultReadResult<any>;
      item: any;
    }>;
  };

  let readers: Reader[] | undefined;

  return new ReadableStream({
    async pull(controller) {
      try {
        readers ??= streams.filter(isNonNullable).map((s) => ({ reader: s.getReader(), data: [] }));

        while (readers.length) {
          const chunk: Awaited<NonNullable<Reader["reading"]>> = await Promise.race(
            readers.map((i) => {
              i.reading ??= i.reader.read().then((result) => ({ result, item: i }));
              return i.reading;
            }),
          );

          if (chunk.result.value) {
            controller.enqueue(chunk.result.value);
            chunk.item.reading = undefined;
            return;
          }

          if (chunk.result.done) {
            readers = readers.filter((i) => i !== chunk.item);
          }
        }

        controller.close();
      } catch (error) {
        controller.error(error);
        if (readers) for (const item of readers) item.reader.releaseLock();
      }
    },
  });
}
