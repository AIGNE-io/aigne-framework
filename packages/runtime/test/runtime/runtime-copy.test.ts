import { expect, test } from "bun:test";
import { LocalFunctionAgent, OrderedRecord, TYPES } from "@aigne/core";

import { Runtime } from "../../src";

test("Runtime.copy", async () => {
  const runtime = new Runtime({
    id: "test",
    name: "test",
    projectDefinition: {
      id: "test",
      name: "test",
      runnables: OrderedRecord.fromArray([]),
    },
    config: {
      llmModel: {
        default: {
          model: "o1",
          temperature: 1,
        },
      },
    },
    state: {},
  });

  const copy: typeof runtime = runtime.copy({ state: { userId: "foo" } });

  expect(copy.inner).toBe(runtime.inner);

  expect(copy.id).toBe(runtime.id);
  expect(copy.name).toEqual(runtime.name);

  expect(runtime.state).toEqual({});
  expect(copy.state).toEqual({ userId: "foo" });
});

test("Runtime.copy.resolve should resolve with new state and config", async () => {
  const runtime = new Runtime({
    id: "test",
    name: "test",
    projectDefinition: {
      id: "test",
      name: "test",
      runnables: OrderedRecord.fromArray([]),
    },
    state: {},
    config: {},
  });

  const agent = LocalFunctionAgent.create({
    context: runtime,
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
    function: async (_, { context }) => {
      return { state: context.state, config: context.config };
    },
  });

  expect(await agent.run({})).toEqual({ state: {}, config: {} });
  expect(await runtime.resolve(agent.id).then((a) => a.run({}))).toEqual({
    state: {},
    config: {},
  });

  const copy = runtime.copy({
    state: { userId: "foo" },
    config: {
      llmModel: {
        default: {
          model: "gemini-2.0-pro",
        },
      },
    },
  });

  expect(copy.resolveDependency<Runtime>(TYPES.context)).toBe(copy);

  expect(await copy.resolve(agent.id).then((a) => a.run({}))).toEqual({
    state: { userId: "foo" },
    config: {
      llmModel: {
        default: {
          model: "gemini-2.0-pro",
        },
      },
    },
  });
});
