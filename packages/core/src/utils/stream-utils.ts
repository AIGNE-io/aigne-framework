import equal from "fast-deep-equal";
import {
  type AgentProcessAsyncGenerator,
  type AgentResponseChunk,
  type AgentResponseStream,
  type Message,
  isEmptyChunk,
} from "../agents/agent.js";
import type { MESSAGE_KEY } from "../prompt/prompt-builder.js";
import { type PromiseOrValue, omitBy } from "./type-utils.js";

export function objectToAgentResponseStream<T extends Message>(json: T): AgentResponseStream<T> {
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

  return output;
}

export async function agentResponseStreamToObject<T extends Message>(
  stream: AgentResponseStream<T> | AgentProcessAsyncGenerator<T>,
): Promise<T> {
  const json: T = {} as T;

  if (stream instanceof ReadableStream) {
    for await (const value of readableStreamToAsyncIterator(stream)) {
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
  callback: (result: T) => PromiseOrValue<Partial<T> | void>,
  options?: {
    errorCallback?: (error: Error) => Error;
    processChunk?: (chunk: AgentResponseChunk<T>) => AgentResponseChunk<T>;
  },
) {
  const json: T = {} as T;
  const reader = stream.getReader();

  return new ReadableStream({
    async pull(controller) {
      try {
        const { value, done } = await reader.read();

        if (!done) {
          const chunk = options?.processChunk ? options.processChunk(value) : value;
          if (!isEmptyChunk(chunk)) controller.enqueue(chunk);

          mergeAgentResponseChunk(json, value);
          return;
        }
        const result = await callback(json);

        if (result && !equal(result, json)) {
          let chunk: AgentResponseChunk<T> = { delta: { json: result } };
          if (options?.processChunk) chunk = options.processChunk(chunk);
          controller.enqueue(chunk);
        }

        controller.close();
      } catch (error) {
        controller.error(options?.errorCallback?.(error) ?? error);
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
  options?: { catchError?: false },
): Promise<T[]>;
export async function readableStreamToArray<T>(
  stream: ReadableStream<T>,
  options?: { catchError?: boolean },
): Promise<(T | Error)[]> {
  const result: T[] = [];
  try {
    for await (const value of readableStreamToAsyncIterator(stream)) {
      result.push(value);
    }
  } catch (error) {
    if (!options?.catchError) throw error;

    result.push(error);
  }
  return result;
}

export async function* readableStreamToAsyncIterator<T>(
  stream: ReadableStream<T>,
): AsyncIterable<T> {
  const reader = stream.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    yield value;
  }
}

export function stringToAgentResponseStream(
  str: string,
  key: "text" | typeof MESSAGE_KEY | string = "text",
): AgentResponseStream<Message> {
  const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });
  const segments = segmenter.segment(str);

  return arrayToReadableStream(
    Array.from(segments).map((segment) => ({ delta: { text: { [key]: segment.segment } } })),
  );
}
