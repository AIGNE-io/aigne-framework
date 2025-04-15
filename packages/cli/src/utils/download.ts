import { Readable } from "node:stream";
import { finished } from "node:stream/promises";
import type { ReadableStream } from "node:stream/web";
import { x } from "tar";

export async function downloadAndExtract(url: string, dir: string) {
  const response = (await fetch(url)).body;
  if (!response) throw new Error("Unexpected to get empty response");

  await finished(Readable.fromWeb(response as unknown as ReadableStream).pipe(x({ C: dir })));
}
