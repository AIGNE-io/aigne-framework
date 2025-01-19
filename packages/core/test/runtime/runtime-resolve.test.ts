import { expect, test } from "bun:test";
import { FunctionAgent, Runtime } from "../../src";

test("Runtime.resolve from a runnable", async () => {
  const runtime = new Runtime({});

  const agent = FunctionAgent.create({
    name: "test",
    inputs: {},
    outputs: {
      state: {
        type: "object",
      },
      config: {
        type: "object",
      },
    },
    function: async () => {
      return { state: {}, config: {} };
    },
  });

  const resolvedAgent = await runtime.resolve(agent);

  expect(resolvedAgent).not.toBe(agent);

  expect(resolvedAgent.definition).toEqual(agent.definition);
  expect(resolvedAgent.context).toBe(runtime);
});

test("Runtime.resolve from a runnable definition", async () => {
  const runtime = new Runtime({});

  const agent = FunctionAgent.create({
    name: "test",
    inputs: {},
    outputs: {
      state: {
        type: "object",
      },
      config: {
        type: "object",
      },
    },
    function: async () => {
      return { state: {}, config: {} };
    },
  });

  const resolvedAgent = await runtime.resolve(agent.definition);

  expect(resolvedAgent).not.toBe(agent);

  expect(resolvedAgent.definition).toEqual(agent.definition);
  expect(resolvedAgent.context).toBe(runtime);
});
