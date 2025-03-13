import { expect, test } from "bun:test";
import { join } from "node:path";
import { MCPAgent } from "@aigne/core-next";

test("MCPAgent should correctly call tool, get prompt and read resource", async () => {
  const mcp = await MCPAgent.from({
    command: "bun",
    args: [join(import.meta.dir, "../_mocks/mock-mcp-server.ts")],
  });

  try {
    expect(mcp.tools.map((i) => i.name)).toEqual(["echo"]);
    expect(await mcp.tools.echo?.call({ message: "AIGNE" })).toEqual(
      expect.objectContaining({
        content: [
          {
            type: "text",
            text: "Tool echo: AIGNE",
          },
        ],
      }),
    );

    expect(mcp.prompts.map((i) => i.name)).toEqual(["echo"]);
    const prompt = await mcp.prompts.echo?.call({ message: "AIGNE" });
    expect(prompt).toEqual(
      expect.objectContaining({
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "Please process this message: AIGNE",
            },
          },
          {
            role: "user",
            content: {
              type: "resource",
              resource: {
                uri: "echo://AIGNE",
                blob: Buffer.from("Resource echo: AIGNE").toString("base64"),
                mimeType: "text/plain",
              },
            },
          },
        ],
      }),
    );

    expect(mcp.resources.map((i) => i.name)).toEqual(["echo"]);
    const resource = await mcp.resources.echo?.call({ message: "AIGNE" });
    expect(resource).toEqual(
      expect.objectContaining({
        contents: [
          {
            uri: "echo://AIGNE",
            text: "Resource echo: AIGNE",
          },
        ],
      }),
    );
  } finally {
    await mcp.shutdown();
  }
});
