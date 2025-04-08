import { appendFile, readFile } from "node:fs/promises";

export function createMockEventStream<T>(data: { path: string } | { raw: string }): T {
  return new ReadableStream({
    async start(controller) {
      const file = "path" in data ? await readFile(data.path) : data.raw;
      for (const line of file.toString().split("\n")) {
        if (line) controller.enqueue(JSON.parse(line.replace("data:", "")));
      }
      controller.close();
    },
  }) as unknown as T;
}

export async function appendToEventStream(chunk: unknown, filePath: string): Promise<void> {
  const data = `data:${JSON.stringify(chunk)}\n`;
  await appendFile(filePath, data, { encoding: "utf-8" });
}
