import type {
  AgentProcessAsyncGeneratorResult,
  AgentResponseChunk,
  AgentResponseStream,
  Message,
} from "../agents/agent.js";

export function objectToAgentResponseStream<T extends Message>(json: T): AgentResponseStream<T> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue({ delta: { json } });
      controller.close();
    },
  });
}

function mergeResult<T extends Message>(output: T, chunk: AgentResponseChunk<T>) {
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
      Object.fromEntries(Object.entries(chunk.delta.json).filter(([_, v]) => v !== undefined)),
    );
  }
}

export async function agentResponseStreamToObject<T extends Message>(
  stream: AgentResponseStream<T> | AgentProcessAsyncGeneratorResult<T>,
): Promise<T> {
  const json: T = {} as T;

  if (stream instanceof ReadableStream) {
    const reader = stream.getReader();
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      mergeResult(json, value);
    }
  } else {
    for (;;) {
      const chunk = await stream.next();
      if (chunk.value) {
        if (chunk.done) {
          Object.assign(json, chunk.value);
        } else {
          mergeResult(json, chunk.value);
        }
      }
      if (chunk.done) break;
    }
  }

  return json;
}

export function asyncGeneratorToReadableStream<T extends Message>(
  generator: AgentProcessAsyncGeneratorResult<T>,
): AgentResponseStream<T> {
  return new ReadableStream({
    async start(controller) {
      try {
        if (generator instanceof ReadableStream) {
          for await (const value of generator) {
            controller.enqueue(value);
          }
        } else {
          for (;;) {
            const chunk = await generator.next();
            if (chunk.value) {
              if (chunk.done) {
                controller.enqueue({ delta: { json: chunk.value } });
              } else {
                controller.enqueue(chunk.value);
              }
            }
            if (chunk.done) break;
          }
        }
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });
}

export function onAgentResponseStreamEnd<T extends Message>(
  stream: AgentResponseStream<T>,
  callback: (result: T) => unknown,
) {
  return new ReadableStream({
    async start(controller) {
      try {
        const json: T = {} as T;

        const reader = stream.getReader();

        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;

          controller.enqueue(value);

          mergeResult(json, value);
        }

        Object.assign(json, await callback(json));
        controller.enqueue({
          delta: { json },
        });
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });
}

export function isAsyncGenerator<T extends AsyncGenerator>(
  value: AsyncGenerator | unknown,
): value is T {
  return typeof value === "object" && value !== null && Symbol.asyncIterator in value;
}
