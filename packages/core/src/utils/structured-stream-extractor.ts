import { type AgentResponseChunk, isAgentResponseDelta } from "../agents/agent.js";
import type { ChatModelOutput } from "../agents/chat-model.js";

export class ExtractMetadataTransform extends TransformStream<
  AgentResponseChunk<ChatModelOutput>,
  AgentResponseChunk<ChatModelOutput & { metadata?: string }>
> {
  private buffer = "";

  private cursor = 0;

  private state: "none" | "start" = "none";

  constructor({
    start,
    end,
    parse,
  }: { start: string; end: string; parse: (raw: string) => object }) {
    super({
      transform: async (chunk, controller) => {
        if (isAgentResponseDelta(chunk) && chunk.delta.text?.text) {
          const text = chunk.delta.text.text;

          this.buffer += text;

          for (;;) {
            if (this.state === "none") {
              const found = findMatchIndex(this.buffer, this.cursor, start);
              if (found.start > this.cursor) {
                const text = this.buffer.slice(this.cursor, found.start);
                this.cursor = found.start;
                controller.enqueue({ delta: { text: { text } } });
              }

              if (found.end) {
                this.state = "start";
                this.cursor = found.end;
              }
            }

            if (this.state === "start") {
              const found = findMatchIndex(this.buffer, this.cursor, end);
              if (found.end) {
                const metadata = this.buffer.slice(this.cursor, found.start);
                const json = parse(metadata);
                controller.enqueue({ delta: { json: { json } } });

                this.state = "none";
                this.cursor = found.end;
                continue;
              }
            }

            break;
          }

          return;
        }

        controller.enqueue(chunk);
      },
    });
  }
}

function findMatchIndex(
  str: string,
  position: number,
  match: string,
): { start: number; end?: number } {
  const i = str.indexOf(match, position);
  if (i >= 0) return { start: i, end: i + match.length };

  for (let i = match.length - 1; i > 0; i--) {
    const m = match.slice(0, i);
    if (str.endsWith(m)) {
      return { start: str.length - m.length };
    }
  }

  return { start: str.length };
}
