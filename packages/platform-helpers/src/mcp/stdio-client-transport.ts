import type { StdioServerParameters } from "@modelcontextprotocol/sdk/client/stdio.js";

export async function createStdioClientTransport(options: StdioServerParameters) {
  if (typeof window === "undefined") {
    return import("./stdio-client-transport.node.js").then((m) =>
      m.createStdioClientTransport(options),
    );
  }
  return import("./stdio-client-transport.browser.js").then((m) =>
    m.createStdioClientTransport(options),
  );
}
