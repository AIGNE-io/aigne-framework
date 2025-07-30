import { mkdir } from "node:fs/promises";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";
import type { ReadableStream } from "node:stream/web";
import { x } from "tar";

export async function downloadAndExtract(
  url: string,
  dir: string,
  options: { strip?: number } = {},
) {
  const response = await fetch(url).catch((error) => {
    throw new Error(`Failed to download package from ${url}: ${error.message}`);
  });

  if (!response.ok) {
    throw new Error(`Failed to download package from ${url}: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error(`Failed to download package from ${url}: Unexpected to get empty response`);
  }

  try {
    await mkdir(dir, { recursive: true });

    await finished(
      Readable.fromWeb(response.body as unknown as ReadableStream).pipe(x({ C: dir, ...options })),
    );
  } catch (error) {
    error.message = `Failed to extract package from ${url}: ${error.message}`;
    throw error;
  }
}
