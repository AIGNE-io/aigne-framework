import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { OrchestratorAgent } from "@aigne/agent-library/orchestrator/index.js";
import {
  ORCHESTRATOR_COMPLETE_PROMPT,
  TODO_PLANNER_PROMPT_TEMPLATE,
  TODO_WORKER_PROMPT_TEMPLATE,
} from "@aigne/agent-library/orchestrator/prompt.js";
import {
  completerInputSchema,
  type PlannerOutput,
  plannerInputSchema,
  plannerOutputSchema,
  workerInputSchema,
  workerOutputSchema,
} from "@aigne/agent-library/orchestrator/type.js";
import { AIAgent, AIGNE, FunctionAgent, PromptBuilder } from "@aigne/core";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { OpenAIChatModel } from "../_mocks_/mock-models.js";

test("OrchestratorAgent.load should use default planner/worker/completer", async () => {
  const agent = await OrchestratorAgent.load({
    filepath: "test.yaml",
    parsed: {
      objective: "Test objective for loading orchestrator agent",
      afs: {
        modules: [{ name: "test-module" }],
      },
      inputSchema: z.object({
        message: z.string(),
      }),
      outputSchema: z.object({
        result: z.string(),
      }),
      skills: [
        FunctionAgent.from({
          name: "test",
          process: () => ({}),
        }),
      ],
    },
  });

  expect(agent.afs).toBeDefined();
  const afsModules = await agent.afs?.listModules();
  expect(afsModules).toMatchInlineSnapshot(`
    [
      {
        "description": undefined,
        "module": {
          "name": "test-module",
        },
        "name": "test-module",
        "path": "/modules/test-module",
      },
    ]
  `);
  expect(agent.skills.map((i) => i.name)).toMatchInlineSnapshot(`
    [
      "test",
    ]
  `);

  const planner = agent["planner"];
  assert(planner instanceof AIAgent);
  expect(planner.instructions.instructions).toEqual(TODO_PLANNER_PROMPT_TEMPLATE);
  expect(zodToJsonSchema(planner.inputSchema)).toEqual(
    zodToJsonSchema(plannerInputSchema.passthrough()),
  );
  expect(zodToJsonSchema(planner.outputSchema)).toEqual(
    zodToJsonSchema(plannerOutputSchema.passthrough()),
  );
  expect(await planner.afs?.listModules()).toEqual(afsModules);
  expect(planner.skills.map((i) => i.name)).toMatchInlineSnapshot(`
    [
      "test",
    ]
  `);

  const worker = agent["worker"];
  assert(worker instanceof AIAgent);
  expect(worker.instructions.instructions).toEqual(TODO_WORKER_PROMPT_TEMPLATE);
  expect(zodToJsonSchema(worker.inputSchema)).toEqual(
    zodToJsonSchema(workerInputSchema.passthrough()),
  );
  expect(zodToJsonSchema(worker.outputSchema)).toEqual(
    zodToJsonSchema(workerOutputSchema.passthrough()),
  );
  expect(await worker.afs?.listModules()).toEqual(afsModules);
  expect(worker.skills.map((i) => i.name)).toMatchInlineSnapshot(`
    [
      "test",
    ]
  `);

  const completer = agent["completer"];
  assert(completer instanceof AIAgent);
  expect(completer.instructions.instructions).toEqual(ORCHESTRATOR_COMPLETE_PROMPT);
  expect(zodToJsonSchema(completer.inputSchema)).toEqual(
    zodToJsonSchema(completerInputSchema.passthrough()),
  );
  expect(zodToJsonSchema(completer.outputSchema)).toEqual(
    zodToJsonSchema((agent.outputSchema as unknown as z.ZodObject<{}>).passthrough()),
  );
  expect(await completer.afs?.listModules()).toEqual(afsModules);
  expect(completer.skills.map((i) => i.name)).toMatchInlineSnapshot(`
    [
      "test",
    ]
  `);
});

test("OrchestratorAgent.load should use custom planner/worker/completer", async () => {
  const agent = await OrchestratorAgent.load({
    filepath: "test.yaml",
    parsed: {
      objective: "Test objective for loading orchestrator agent",
      afs: {
        modules: [{ name: "test-module" }],
      },
      inputSchema: z.object({
        message: z.string(),
      }),
      outputSchema: z.object({
        result: z.string(),
      }),
      skills: [
        FunctionAgent.from({
          name: "test",
          process: () => ({}),
        }),
      ],

      planner: {
        type: "ai",
        instructions: "Custom planner instructions",
      },

      worker: {
        type: "ai",
        instructions: "Custom worker instructions",
      },

      completer: {
        type: "ai",
        instructions: "Custom completer instructions",
      },
    },
  });

  const afsModules = await agent.afs?.listModules();
  expect(afsModules).toMatchInlineSnapshot(`
    [
      {
        "description": undefined,
        "module": {
          "name": "test-module",
        },
        "name": "test-module",
        "path": "/modules/test-module",
      },
    ]
  `);
  expect(agent.skills.map((i) => i.name)).toMatchInlineSnapshot(`
    [
      "test",
    ]
  `);

  const planner = agent["planner"];
  assert(planner instanceof AIAgent);
  expect((await planner.instructions.build({})).messages).toMatchInlineSnapshot(`
    [
      {
        "content": "Custom planner instructions",
        "name": undefined,
        "role": "system",
      },
    ]
  `);
  expect(zodToJsonSchema(planner.inputSchema)).toEqual(
    zodToJsonSchema(plannerInputSchema.passthrough()),
  );
  expect(zodToJsonSchema(planner.outputSchema)).toEqual(
    zodToJsonSchema(plannerOutputSchema.passthrough()),
  );
  expect(await planner.afs?.listModules()).toEqual(afsModules);
  expect(planner.skills.map((i) => i.name)).toMatchInlineSnapshot(`
    [
      "test",
    ]
  `);

  const worker = agent["worker"];
  assert(worker instanceof AIAgent);
  expect(await worker.instructions.build({})).toMatchInlineSnapshot(`
    {
      "messages": [
        {
          "content": "Custom worker instructions",
          "name": undefined,
          "role": "system",
        },
      ],
      "modelOptions": undefined,
      "outputFileType": undefined,
      "responseFormat": undefined,
      "toolAgents": undefined,
      "toolChoice": undefined,
      "tools": undefined,
    }
  `);
  expect(await worker.afs?.listModules()).toEqual(afsModules);
  expect(zodToJsonSchema(worker.inputSchema)).toEqual(
    zodToJsonSchema(workerInputSchema.passthrough()),
  );
  expect(zodToJsonSchema(worker.outputSchema)).toEqual(
    zodToJsonSchema(workerOutputSchema.passthrough()),
  );
  expect(worker.skills.map((i) => i.name)).toMatchInlineSnapshot(`
    [
      "test",
    ]
  `);

  const completer = agent["completer"];
  assert(completer instanceof AIAgent);
  expect(await completer.instructions.build({})).toMatchInlineSnapshot(`
    {
      "messages": [
        {
          "content": "Custom completer instructions",
          "name": undefined,
          "role": "system",
        },
      ],
      "modelOptions": undefined,
      "outputFileType": undefined,
      "responseFormat": undefined,
      "toolAgents": undefined,
      "toolChoice": undefined,
      "tools": undefined,
    }
  `);
  expect(zodToJsonSchema(completer.inputSchema)).toEqual(
    zodToJsonSchema(completerInputSchema.passthrough()),
  );
  expect(zodToJsonSchema(completer.outputSchema)).toEqual(
    zodToJsonSchema((agent.outputSchema as unknown as z.ZodObject<{}>).passthrough()),
  );
  expect(await completer.afs?.listModules()).toEqual(afsModules);
  expect(completer.skills.map((i) => i.name)).toMatchInlineSnapshot(`
    [
      "test",
    ]
  `);
});

test("OrchestratorAgent.invoke", async () => {
  const model = new OpenAIChatModel();
  const aigne = new AIGNE({ model });

  const agent = OrchestratorAgent.from({
    objective: PromptBuilder.from("Research ArcBlock and write a professional report"),
    inputKey: "message",
  });

  spyOn(model, "process")
    .mockReturnValueOnce(
      Promise.resolve<{ json: PlannerOutput }>({
        json: {
          nextTask: 'Use the "finder" skill to research ArcBlock blockchain platform',
          finished: false,
        },
      }),
    )
    .mockReturnValueOnce(
      Promise.resolve({ json: { result: "ArcBlock is a blockchain platform", success: true } }),
    )
    .mockReturnValueOnce(Promise.resolve<{ json: PlannerOutput }>({ json: { finished: true } }))
    .mockReturnValueOnce(Promise.resolve({ text: "Task finished" }));

  const result = await aigne.invoke(agent, {
    message: "Deep research ArcBlock and write a professional report",
  });

  expect(result).toEqual({ message: "Task finished" });
});
