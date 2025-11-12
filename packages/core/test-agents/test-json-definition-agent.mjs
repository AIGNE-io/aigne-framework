import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

const storagePath = await new Promise((resolve) => {
  setTimeout(() => {
    resolve(join(tmpdir(), randomUUID()));
  }, 100);
});

export default {
  type: "ai",
  name: "testJsonDefinitionAgent",
  description: "A test agent defined in JSON format",
  instructions: {
    url: "./chat-prompt.md",
  },
  inputSchema: zodToJsonSchema(
    z.object({
      message: z.string().describe("The input message to process"),
    }),
  ),
  outputSchema: zodToJsonSchema(
    z.object({
      response: z.string().describe("The processed response message"),
    }),
  ),
  afs: {
    storage: {
      url: `file:${storagePath}/afs-storage.sqlite3`,
    },
  },
};
