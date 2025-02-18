import { createParser } from "eventsource-parser";

const requireNodeJs = typeof require !== "undefined" ? require : undefined;

export class EventSourceParserStream<T> extends TransformStream<any, T> {
  constructor() {
    let parser: ReturnType<typeof createParser> | undefined;

    super({
      start(controller) {
        parser = createParser((event) => {
          if (event.type === "event") {
            try {
              const json = JSON.parse(event.data) as T;
              controller.enqueue(json);
            } catch (error) {
              console.error("parse chunk error", { error, data: event.data });
            }
          }
        });
      },
      transform(chunk) {
        parser?.feed(chunk);
      },
    });
  }
}
