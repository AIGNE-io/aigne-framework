import type {
  StdioClientTransport,
  StdioServerParameters,
} from "@modelcontextprotocol/sdk/client/stdio.js";

export async function createStdioClientTransport(
  _options: StdioServerParameters,
): Promise<StdioClientTransport> {
  throw new Error(
    "Stdio transport is not supported in the browser. Please use a different transport method.",
  );
}
