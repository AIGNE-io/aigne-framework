export class ExtractMetadataTransform extends TransformStream<
  string,
  { type: "text"; text: string } | { type: "match"; text: string }
> {
  private buffer = "";

  private cursor = 0;

  private state: "none" | "start" = "none";

  constructor({ start, end }: { start: string; end: string }) {
    super({
      transform: async (chunk, controller) => {
        if (!start || !end) {
          controller.enqueue({ type: "text", text: chunk });
          return;
        }

        this.buffer += chunk;

        for (;;) {
          if (this.state === "none") {
            const found = findMatchIndex(this.buffer, this.cursor, start);
            if (found.start > this.cursor) {
              const text = this.buffer.slice(this.cursor, found.start);
              this.cursor = found.start;
              controller.enqueue({ type: "text", text });
            }

            if (found.end) {
              this.state = "start";
              this.cursor = found.end;
            }
          }

          if (this.state === "start") {
            const found = findMatchIndex(this.buffer, this.cursor, end);
            if (found.end) {
              const match = this.buffer.slice(this.cursor, found.start);
              controller.enqueue({ type: "match", text: match });

              this.state = "none";
              this.cursor = found.end;
              continue;
            }
          }

          break;
        }
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
