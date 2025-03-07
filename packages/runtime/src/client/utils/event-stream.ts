import {
  type RunnableResponseChunk,
  type RunnableResponseChunkWithError,
  isRunnableResponseDelta,
  isRunnableResponseError,
  logger,
} from "@aigne/core";
import { createParser } from "eventsource-parser";

export class EventSourceParserStream<T> extends TransformStream<any, T> {
  constructor() {
    let parser: ReturnType<typeof createParser> | undefined;

    super({
      start(controller) {
        parser = createParser({
          onEvent(event) {
            try {
              const json = JSON.parse(event.data) as T;
              controller.enqueue(json);
            } catch (error) {
              logger.error("parse chunk error", { error, data: event.data });
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

export class RunnableStreamParser<O> extends TransformStream<
  RunnableResponseChunkWithError<O>,
  RunnableResponseChunk<O>
> {
  private $text = "";

  private delta = {};

  constructor() {
    super({
      transform: (chunk, controller) => {
        if (isRunnableResponseError(chunk)) {
          controller.error(new Error(chunk.error.message));
          return;
        }

        if (isRunnableResponseDelta(chunk)) {
          if (typeof chunk.$text === "string" && chunk.$text) {
            this.$text += chunk.$text;
          }

          Object.assign(this.delta, { $text: this.$text || undefined }, chunk.delta);
          controller.enqueue({ ...chunk, delta: { ...this.delta } });
          return;
        }

        controller.enqueue(chunk);
      },
    });
  }
}
