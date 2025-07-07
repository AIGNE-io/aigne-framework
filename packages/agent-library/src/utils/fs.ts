import { stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

export async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
      return false;
    }
    throw e;
  }
}

export function expandHome(filepath: string): string {
  if (filepath.startsWith('~/') || filepath === '~') {
    return join(homedir(), filepath.slice(1));
  }
  return filepath;
}

export async function streamToString(
  stream: ReadableStream | NodeJS.ReadableStream,
  encoding: BufferEncoding = 'utf-8'
): Promise<string> {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString(encoding);
}
