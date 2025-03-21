import { expect, test } from "bun:test";
import {
  FunctionAgent,
  isTransferAgentOutput,
  transferAgentOutputKey,
  transferToAgentOutput,
} from "@aigne/core-next";

test("transferToAgentOutput", async () => {
  const agent = FunctionAgent.from(({ a, b }: { a: number; b: number }) => ({ sum: a + b }));

  const result = transferToAgentOutput(agent);

  expect(result).toEqual({
    [transferAgentOutputKey]: { agent },
  });

  expect(isTransferAgentOutput(result)).toBe(true);
});
