import { expect, test } from "bun:test";
import { TransformAgent } from "@aigne/core";
import { z } from "zod";

test("TransformAgent should transform data correctly", async () => {
  const agent = TransformAgent.from({
    name: "transform-agent",
    description: "A Transform Agent that processes input data using JSONata expressions.",
    inputSchema: z.object({
      user_id: z.string(),
      user_name: z.string(),
      created_at: z.string(),
    }),
    outputSchema: z.object({
      userId: z.string(),
      userName: z.string(),
      createdAt: z.string(),
    }),
    jsonata: `{
      "userId": user_id,
      "userName": user_name,
      "createdAt": created_at
    }`,
  });

  expect(
    await agent.invoke({
      user_id: "123",
      user_name: "John Doe",
      created_at: "2023-10-01T00:00:00Z",
    }),
  ).toEqual({
    userId: "123",
    userName: "John Doe",
    createdAt: "2023-10-01T00:00:00Z",
  });
});
