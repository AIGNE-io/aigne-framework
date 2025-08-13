import { expect, test } from "bun:test";
import { sortHooks } from "@aigne/core/utils/agent-utils.js";

test("sortHooks should sort hooks by priority", () => {
  expect(
    sortHooks([
      {},
      { priority: "medium" },
      { priority: "high" },
      { priority: "low" },
      { priority: "medium" },
    ]),
  ).toMatchInlineSnapshot(`
    [
      {
        "priority": "high",
      },
      {
        "priority": "medium",
      },
      {
        "priority": "medium",
      },
      {},
      {
        "priority": "low",
      },
    ]
  `);
});
