import { createParser } from "eventsource-parser";
import { produce } from "immer";
import {
  type AgentResponseChunk,
  type AgentResponseProgress,
  type AgentResponseStream,
  isAgentResponseDelta,
  isAgentResponseProgress,
  type Message,
} from "../agents/agent.js";
import type { Context, ContextEventMap } from "../aigne/context.js";
import { tryOrThrow } from "./type-utils.js";
import type { Listener } from "./typed-event-emitter.js";

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
              switch (event.event) {
                case "error":
                  controller.enqueue(new Error((json as { message: string }).message));
                  break;
                default: {
                  if (!event.event) controller.enqueue(json as T);
                  else console.warn(`Unknown event type: ${event.event}`, event.data);
                }
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

        if (isAgentResponseDelta(chunk)) {
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
        } else if (isAgentResponseProgress(chunk)) {
          if (chunk.progress.event === "agentFailed") {
            const { name, message } = chunk.progress.error;
            chunk.progress.error = new Error(message);
            chunk.progress.error.name = name;
          }
          controller.enqueue(chunk);
        }
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

          if (isAgentResponseProgress(value)) {
            if (value.progress.event === "agentFailed") {
              value.progress.error = {
                name: value.progress.error.name,
                message: value.progress.error.message,
              };
            }
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

export class AgentResponseProgressStream extends ReadableStream<AgentResponseProgress> {
  constructor(context: Context) {
    super({
      async start(controller) {
        const writeEvent = (
          eventName: keyof ContextEventMap,
          { context, ...event }: ContextEventMap[typeof eventName][0],
        ) => {
          const progress = {
            ...event,
            event: eventName,
            agent: { name: event.agent.name },
          } as AgentResponseProgress["progress"];

          controller.enqueue({ progress });
        };

        const close = () => {
          context.off("agentStarted", onAgentStarted);
          context.off("agentSucceed", onAgentSucceed);
          context.off("agentFailed", onAgentFailed);
          controller.close();
        };

        const onAgentStarted: Listener<"agentStarted", ContextEventMap> = async (event) => {
          const taskTitle = await event.agent.renderTaskTitle(event.input);

          writeEvent("agentStarted", { ...event, taskTitle });
        };
        const onAgentSucceed: Listener<"agentSucceed", ContextEventMap> = (event) => {
          writeEvent("agentSucceed", event);
          if (event.contextId === context.id) {
            close();
          }
        };
        const onAgentFailed: Listener<"agentFailed", ContextEventMap> = (event) => {
          writeEvent("agentFailed", event);
          if (event.contextId === context.id) {
            close();
          }
        };

        context.on("agentStarted", onAgentStarted);
        context.on("agentSucceed", onAgentSucceed);
        context.on("agentFailed", onAgentFailed);
      },
    });
  }
}
