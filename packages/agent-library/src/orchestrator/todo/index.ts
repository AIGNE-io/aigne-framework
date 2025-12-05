import { AIAgent, type AIAgentOptions } from "@aigne/core";
import { TODO_PLANNER_PROMPT_TEMPLATE, TODO_WORKER_PROMPT_TEMPLATE } from "./prompt.js";
import {
  type TodoPlannerInput,
  type TodoPlannerOutput,
  todoPlannerInputSchema,
  todoPlannerOutputSchema,
  todoWorkerInputSchema,
} from "./type.js";

export class TodoPlanner extends AIAgent<TodoPlannerInput, TodoPlannerOutput> {
  constructor(
    public options: Omit<
      AIAgentOptions<TodoPlannerInput, TodoPlannerOutput>,
      "inputSchema" | "outputSchema"
    >,
  ) {
    super({
      name: "TodoPlanner",
      ...options,
      inputSchema: todoPlannerInputSchema,
      outputSchema: todoPlannerOutputSchema,
      instructions: options.instructions || TODO_PLANNER_PROMPT_TEMPLATE,
    });
  }
}

export class TodoWorker extends AIAgent {
  constructor(public options: Omit<AIAgentOptions, "inputSchema">) {
    super({
      name: "TodoWorker",
      ...options,
      instructions: options.instructions || TODO_WORKER_PROMPT_TEMPLATE,
      inputSchema: todoWorkerInputSchema,
    });
  }
}
