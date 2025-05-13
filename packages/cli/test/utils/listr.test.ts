import { test } from "bun:test";
import { AIGNEListr } from "@aigne/cli/utils/listr.js";
import { stringToAgentResponseStream } from "@aigne/core/utils/stream-utils.js";

test("AIGNEListr should work with default renderer", async () => {
  const listr = new AIGNEListr(
    {
      formatRequest: () => {
        return "test request message";
      },
      formatResult: (result) => {
        return [JSON.stringify(result, null, 2)];
      },
    },
    [],
    {
      fallbackRendererCondition: () => false,
    },
  );

  await listr.run(() => stringToAgentResponseStream("hello, world!"));
});

test("AIGNEListr should work with fallback renderer", async () => {
  const listr = new AIGNEListr(
    {
      formatRequest: () => {
        return "test request message";
      },
      formatResult: (result) => {
        return [JSON.stringify(result, null, 2)];
      },
    },
    [
      {
        title: "test",
        task: () => {},
      },
    ],
    {
      fallbackRendererCondition: () => true,
    },
  );

  await listr.run(() => stringToAgentResponseStream("hello, world!"));
});
