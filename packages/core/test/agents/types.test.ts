import { expect, test } from "bun:test";
import { FunctionAgent } from "@aigne/core";
import {
  isTransferAgentOutput,
  transferAgentOutputKey,
  transferToAgentOutput,
} from "../../src/agents/types";

test("transferToAgentOutput", async () => {
  const agent = FunctionAgent.from(({ a, b }: { a: number; b: number }) => ({ sum: a + b }));

  const result = transferToAgentOutput(agent);

  expect(result).toEqual({
    [transferAgentOutputKey]: { agent },
  });

  expect(isTransferAgentOutput(result)).toBe(true);
});
