import {
  getDefaultEnvironment,
  StdioClientTransport,
  type StdioServerParameters,
} from "@modelcontextprotocol/sdk/client/stdio.js";

export async function createStdioClientTransport(
  options: StdioServerParameters,
): Promise<StdioClientTransport> {
  return new StdioClientTransport({
    ...options,
    env: {
      ...getDefaultEnvironment(),
      ...options.env,
    },
    stderr: "pipe",
  });
}
