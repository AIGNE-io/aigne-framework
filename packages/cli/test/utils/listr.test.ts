import { expect, mock, test } from "bun:test";
import {
  AIGNEListr,
  AIGNEListrRenderer,
  type AIGNEListrRendererOptions,
} from "@aigne/cli/utils/listr.js";
import { stringToAgentResponseStream } from "@aigne/core/utils/stream-utils.js";
import { ListrEventManager } from "@aigne/listr2";

test("AIGNEListr should work with default renderer", async () => {
  const listr = new AIGNEListr(
    {
      formatRequest: () => {
        return "test request message";
      },
      formatResult: (result) => {
        return JSON.stringify(result, null, 2);
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
        return JSON.stringify(result, null, 2);
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

test("AIGNEListrRenderer should work correctly", async () => {
  const renderer = new AIGNEListrRenderer(
    [],
    <AIGNEListrRendererOptions>{
      aigne: {
        getStdoutLogs() {
          return ["test stdout logs"];
        },
        getBottomBarLogs() {
          return ["test bottom bar logs"];
        },
      },
    },
    new ListrEventManager(),
  );

  const updater = mock();
  const clear = mock();
  Object.assign(updater, { clear });

  renderer["updater"] = updater;

  renderer.update();

  expect(updater).toHaveBeenLastCalledWith(expect.stringContaining("test bottom bar logs"));
});
