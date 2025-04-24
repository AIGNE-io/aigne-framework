import { createParser } from "eventsource-parser";
import { produce } from "immer";
import type { AgentResponseChunk, Message } from "../agents/agent.js";

export class EventSourceParserStream<T> extends TransformStream<string, T | Error> {
  constructor() {
    let parser: ReturnType<typeof createParser> | undefined;

    super({
      start(controller) {
        parser = createParser({
          onEvent: (event) => {
            try {
              const json = JSON.parse(event.data);
              if (event.event === "error") {
                controller.enqueue(new Error(json.message));
              } else {
                controller.enqueue(json);
              }
            } catch (error) {
              console.warn("parse chunk error", { error, data: event.data });
            }
          },
          onError: (error) => {
            controller.error(error);
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
