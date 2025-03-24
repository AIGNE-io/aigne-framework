import { readFile } from "node:fs/promises";

export function createMockEventStream<T>(data: { path: string }): T {
  return new ReadableStream({
    async start(controller) {
      const file = await readFile(data.path);
      for (const line of file.toString().split("\n")) {
        if (line) controller.enqueue(JSON.parse(line.replace("data:", "")));
      }
      controller.close();
    },
  }) as unknown as T;
}
