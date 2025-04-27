import { createParser } from "eventsource-parser";
import { produce } from "immer";
import type { AgentResponseChunk, AgentResponseStream, Message } from "../agents/agent.js";
import { tryOrThrow } from "./type-utils.js";

export class EventStreamParser<T> extends TransformStream<string, T | Error> {
  constructor() {
    let parser: ReturnType<typeof createParser> | undefined;

    super({
      start(controller) {
        parser = createParser({
          onEvent: (event) => {
            const json = tryOrThrow(
              () => JSON.parse(event.data) as T | { message: string },
              (e) => {
                controller.enqueue(
                  new Error(`Parse response chunk json error: ${e.message} ${event.data}`),
                );
              },
            );
            if (json) {
              if (event.event === "error") {
                controller.enqueue(new Error((json as { message: string }).message));
              } else {
                controller.enqueue(json as T);
              }
            }
          },
        });
      },
      transform(chunk) {
        parser?.feed(chunk);
      },
    });
  }
}

export class AgentResponseStreamParser<O extends Message> extends TransformStream<
  AgentResponseChunk<O> | Error,
  AgentResponseChunk<O>
> {
  private json: O = {} as O;

  constructor() {
    super({
      transform: (chunk, controller) => {
        if (chunk instanceof Error) {
          controller.error(chunk);
          controller.terminate();
          return;
        }

        this.json = produce(this.json, (draft) => {
          if (chunk.delta.json) Object.assign(draft, chunk.delta.json);

          if (chunk.delta.text) {
            for (const [key, text] of Object.entries(chunk.delta.text)) {
              const original = draft[key] as string | undefined;
              const t = (original || "") + (text || "");
              if (t) Object.assign(draft, { [key]: t });
            }
          }
        });

        controller.enqueue({
          ...chunk,
          delta: {
            ...chunk.delta,
            json: this.json,
          },
        });
      },
    });
  }
}

export class AgentResponseStreamSSE<O extends Message> extends ReadableStream<string> {
  constructor(stream: AgentResponseStream<O>) {
    let reader: ReadableStreamDefaultReader<AgentResponseChunk<O>> | undefined;

    super({
      async pull(controller) {
        reader ??= stream.getReader();
        try {
          const { value, done } = await reader.read();
          if (done) {
            controller.close();
            return;
          }

          controller.enqueue(`data: ${JSON.stringify(value)}\n\n`);
        } catch (error) {
          controller.enqueue(
            `event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`,
          );
          controller.close();
        }
      },
    });
  }
}
