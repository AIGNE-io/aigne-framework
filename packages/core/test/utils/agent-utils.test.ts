import { expect, test } from "bun:test";
import { AIGNE, FunctionAgent } from "@aigne/core";
import { findCliAgent, sortHooks } from "@aigne/core/utils/agent-utils.js";

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

test("findCliAgent should find agents correctly", () => {
  const aigne = new AIGNE({
    cli: {
      chat: undefined,
      agents: [
        {
          name: "agent1",
          agent: FunctionAgent.from({ name: "agent1", description: "agent1", process: () => ({}) }),
        },
        {
          name: "agent2",
          agents: [
            {
              name: "agent2-1",
              agent: FunctionAgent.from({
                name: "agent21",
                description: "agent1",
                process: () => ({}),
              }),
            },
          ],
        },
      ],
    },
  });

  expect(findCliAgent(aigne.cli, [], "agent1")?.name).toBe("agent1");
  expect(findCliAgent(aigne.cli, ["agent2"], "agent2-1")?.name).toBe("agent21");

  expect(() =>
    findCliAgent(aigne.cli, ["not-exist"], "agent2-1"),
  ).toThrowErrorMatchingInlineSnapshot(`"Agent not-exist not found in parent path not-exist"`);

  expect(findCliAgent(aigne.cli, "*", "agent1")?.name).toBe("agent1");
  expect(findCliAgent(aigne.cli, "*", "agent2-1")?.name).toBe("agent21");
  expect(findCliAgent(aigne.cli, "*", "not-exist")).toBeUndefined();
});
