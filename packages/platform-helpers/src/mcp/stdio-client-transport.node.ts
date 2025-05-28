import {
  StdioClientTransport,
  type StdioServerParameters,
  getDefaultEnvironment,
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
