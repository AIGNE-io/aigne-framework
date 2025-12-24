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
  type WorkerOutput,
  workerInputSchema,
  workerOutputSchema,
} from "@aigne/agent-library/orchestrator/type.js";
import { AIAgent, AIGNE, FunctionAgent, PromptBuilder } from "@aigne/core";
import { loadNestAgent } from "@aigne/core/loader/index.js";
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
      stateManagement: {
        maxIterations: 3,
        maxTokens: 100000,
        keepRecent: 20,
      },
    },
  });

  expect(agent["stateManagement"]).toMatchInlineSnapshot(`
    {
      "keepRecent": 20,
      "maxIterations": 3,
      "maxTokens": 100000,
    }
  `);

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
    zodToJsonSchema((agent.outputSchema as any).passthrough()),
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
    options: {
      loadNestAgent,
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
        "cacheControl": undefined,
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
          "cacheControl": undefined,
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
          "cacheControl": undefined,
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
    zodToJsonSchema((agent.outputSchema as any).passthrough()),
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
          nextTasks: ['Use the "finder" skill to research ArcBlock blockchain platform'],
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

test("OrchestratorAgent should pass declared input fields to the planner/worker/completer", async () => {
  const model = new OpenAIChatModel();
  const aigne = new AIGNE({ model });

  const agent = await OrchestratorAgent.load({
    filepath: "test.yaml",
    parsed: {
      objective: "Research ArcBlock and write a professional report",
      planner: {
        type: "ai",
        inputSchema: zodToJsonSchema(
          z.object({
            customField: z.string().optional(),
          }),
        ) as any,
        instructions:
          "Test planner\ncustomField: {{customField}}\nobjective: {{objective}}\nexecutionState: {{executionState}}",
      },
      worker: {
        type: "ai",
        inputSchema: zodToJsonSchema(
          z.object({
            customField: z.string().optional(),
          }),
        ) as any,
        instructions:
          "Test worker\ncustomField: {{customField}}\nobjective: {{objective}}\nexecutionState: {{executionState}}\ntask: {{task}}",
      },
      completer: {
        type: "ai",
        inputSchema: zodToJsonSchema(
          z.object({
            customField: z.string().optional(),
          }),
        ) as any,
        instructions:
          "Test completer\ncustomField: {{customField}}\nobjective: {{objective}}\nexecutionState: {{executionState}}",
      },
    },
    options: {
      loadNestAgent,
    },
  });

  const modelProcess = spyOn(model, "process")
    .mockReturnValueOnce(
      Promise.resolve<{ json: PlannerOutput }>({
        json: {
          nextTasks: ['Use the "finder" skill to research ArcBlock blockchain platform'],
          finished: false,
        },
      }),
    )
    .mockReturnValueOnce(
      Promise.resolve<{ json: WorkerOutput }>({
        json: { result: "ArcBlock is a blockchain platform", success: true },
      }),
    )
    .mockReturnValueOnce(Promise.resolve<{ json: PlannerOutput }>({ json: { finished: true } }))
    .mockReturnValueOnce(Promise.resolve({ text: "Task finished" }));

  const dateNowSpy = spyOn(Date, "now").mockReturnValue(1765461004718);

  const result = await aigne.invoke(agent, {
    customField: "HERE IS CUSTOM VALUE",
    message: "Deep research ArcBlock and write a professional report",
  });

  expect(modelProcess.mock.calls.map((i) => i[0].messages)).toMatchInlineSnapshot(`
    [
      [
        {
          "content": 
    "Test planner
    customField: HERE IS CUSTOM VALUE
    objective: Research ArcBlock and write a professional report
    executionState: {"tasks":[]}"
    ,
          "role": "system",
        },
      ],
      [
        {
          "content": 
    "Test worker
    customField: HERE IS CUSTOM VALUE
    objective: Research ArcBlock and write a professional report
    executionState: {"tasks":[]}
    task: Use the "finder" skill to research ArcBlock blockchain platform"
    ,
          "role": "system",
        },
      ],
      [
        {
          "content": 
    "Test planner
    customField: HERE IS CUSTOM VALUE
    objective: Research ArcBlock and write a professional report
    executionState: {"tasks":[{"status":"completed","result":"ArcBlock is a blockchain platform","task":"Use the \\"finder\\" skill to research ArcBlock blockchain platform","createdAt":1765461004718,"completedAt":1765461004718}]}"
    ,
          "role": "system",
        },
      ],
      [
        {
          "content": 
    "Test completer
    customField: HERE IS CUSTOM VALUE
    objective: Research ArcBlock and write a professional report
    executionState: {"tasks":[{"status":"completed","result":"ArcBlock is a blockchain platform","task":"Use the \\"finder\\" skill to research ArcBlock blockchain platform","createdAt":1765461004718,"completedAt":1765461004718}]}"
    ,
          "role": "system",
        },
      ],
    ]
  `);

  expect(result).toMatchInlineSnapshot(`
    {
      "message": "Task finished",
    }
  `);

  dateNowSpy.mockRestore();
});

function getMessageContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((c) => (typeof c === "string" ? c : (c as { text?: string }).text || ""))
      .join("");
  }
  return "";
}

test("OrchestratorAgent should execute tasks in parallel when parallelTasks is true", async () => {
  const model = new OpenAIChatModel();
  const aigne = new AIGNE({ model });

  const agent = OrchestratorAgent.from({
    objective: PromptBuilder.from("Research multiple topics"),
    inputKey: "message",
    concurrency: 3,
  });

  const executionOrder: string[] = [];
  let plannerCallCount = 0;

  spyOn(model, "process").mockImplementation(async (options) => {
    const messages = options.messages;
    const systemMessage = getMessageContent(messages.find((m) => m.role === "system")?.content);

    // Planner calls
    if (systemMessage.includes("decide the next tasks")) {
      plannerCallCount++;
      if (plannerCallCount === 1) {
        return {
          json: {
            nextTasks: ["Research topic A", "Research topic B", "Research topic C"],
            parallelTasks: true,
            finished: false,
          } satisfies PlannerOutput,
        };
      }
      return { json: { finished: true } satisfies PlannerOutput };
    }

    // Worker calls
    if (systemMessage.includes("task execution agent")) {
      const taskMatch = systemMessage.match(/Research topic ([ABC])/);
      const taskId = taskMatch?.[1] ?? "unknown";

      executionOrder.push(`start-${taskId}`);

      // Simulate async work - all tasks should start before any finishes
      await new Promise((resolve) => setTimeout(resolve, 50));

      executionOrder.push(`end-${taskId}`);

      return {
        json: { result: `Result for topic ${taskId}`, success: true } satisfies WorkerOutput,
      };
    }

    // Completer call
    return { text: "All topics researched successfully" };
  });

  const result = await aigne.invoke(agent, {
    message: "Research multiple topics in parallel",
  });

  expect(result).toEqual({ message: "All topics researched successfully" });

  // Verify all tasks started before any task ended (parallel execution)
  const allStarted = ["start-A", "start-B", "start-C"].every((s) => executionOrder.includes(s));
  const allEnded = ["end-A", "end-B", "end-C"].every((s) => executionOrder.includes(s));
  expect(allStarted).toBe(true);
  expect(allEnded).toBe(true);

  // In parallel execution, all starts should come before all ends
  const firstEndIndex = Math.min(
    executionOrder.indexOf("end-A"),
    executionOrder.indexOf("end-B"),
    executionOrder.indexOf("end-C"),
  );
  const lastStartIndex = Math.max(
    executionOrder.indexOf("start-A"),
    executionOrder.indexOf("start-B"),
    executionOrder.indexOf("start-C"),
  );

  // All tasks should start before the first task ends (parallel behavior)
  expect(lastStartIndex).toBeLessThan(firstEndIndex);
});

test("OrchestratorAgent should execute tasks sequentially when parallelTasks is false", async () => {
  const model = new OpenAIChatModel();
  const aigne = new AIGNE({ model });

  const agent = OrchestratorAgent.from({
    objective: PromptBuilder.from("Research multiple topics sequentially"),
    inputKey: "message",
    concurrency: 3,
  });

  const executionOrder: string[] = [];
  let plannerCallCount = 0;

  spyOn(model, "process").mockImplementation(async (options) => {
    const messages = options.messages;
    const systemMessage = getMessageContent(messages.find((m) => m.role === "system")?.content);

    // Planner calls
    if (systemMessage.includes("decide the next tasks")) {
      plannerCallCount++;
      // First planner call - return sequential tasks (parallelTasks: false)
      if (plannerCallCount === 1) {
        return {
          json: {
            nextTasks: ["Research topic A", "Research topic B", "Research topic C"],
            parallelTasks: false, // Sequential execution
            finished: false,
          } satisfies PlannerOutput,
        };
      }
      // Second planner call - finished
      return { json: { finished: true } satisfies PlannerOutput };
    }

    // Worker calls
    if (systemMessage.includes("task execution agent")) {
      const taskMatch = systemMessage.match(/Research topic ([ABC])/);
      const taskId = taskMatch?.[1] ?? "unknown";

      executionOrder.push(`start-${taskId}`);

      // Simulate async work
      await new Promise((resolve) => setTimeout(resolve, 20));

      executionOrder.push(`end-${taskId}`);

      return {
        json: { result: `Result for topic ${taskId}`, success: true } satisfies WorkerOutput,
      };
    }

    // Completer call
    return { text: "All topics researched successfully" };
  });

  const result = await aigne.invoke(agent, {
    message: "Research multiple topics sequentially",
  });

  expect(result).toEqual({ message: "All topics researched successfully" });

  // In sequential execution, each task should complete before the next starts
  // Expected order: start-A, end-A, start-B, end-B, start-C, end-C
  expect(executionOrder).toEqual(["start-A", "end-A", "start-B", "end-B", "start-C", "end-C"]);
});

test("OrchestratorAgent should respect concurrency limit in parallel mode", async () => {
  const model = new OpenAIChatModel();
  const aigne = new AIGNE({ model });

  const agent = OrchestratorAgent.from({
    objective: PromptBuilder.from("Research many topics"),
    inputKey: "message",
    concurrency: 2, // Only 2 concurrent tasks allowed
  });

  let currentConcurrency = 0;
  let maxConcurrency = 0;
  let plannerCallCount = 0;

  spyOn(model, "process").mockImplementation(async (options) => {
    const messages = options.messages;
    const systemMessage = getMessageContent(messages.find((m) => m.role === "system")?.content);

    // Planner calls
    if (systemMessage.includes("decide the next tasks")) {
      plannerCallCount++;
      if (plannerCallCount === 1) {
        return {
          json: {
            nextTasks: ["Task 1", "Task 2", "Task 3", "Task 4"],
            parallelTasks: true,
            finished: false,
          } satisfies PlannerOutput,
        };
      }
      return { json: { finished: true } satisfies PlannerOutput };
    }

    // Worker calls
    if (systemMessage.includes("task execution agent")) {
      currentConcurrency++;
      maxConcurrency = Math.max(maxConcurrency, currentConcurrency);

      await new Promise((resolve) => setTimeout(resolve, 30));

      currentConcurrency--;

      return {
        json: { result: "Done", success: true } satisfies WorkerOutput,
      };
    }

    return { text: "Completed" };
  });

  await aigne.invoke(agent, { message: "Test concurrency" });

  // Max concurrency should not exceed the configured limit
  expect(maxConcurrency).toBeLessThanOrEqual(2);
  // But should actually use parallelism (more than 1)
  expect(maxConcurrency).toBeGreaterThan(1);
});
