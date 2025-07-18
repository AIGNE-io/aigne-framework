export async function streamToString(
  stream: ReadableStream | NodeJS.ReadableStream,
  encoding: BufferEncoding = "utf-8",
): Promise<string> {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString(encoding);
}
