import { AIAgent, type AIAgentOptions } from "@aigne/core";
import { TODO_PLANNER_PROMPT_TEMPLATE, TODO_WORKER_PROMPT_TEMPLATE } from "./prompt.js";
import {
  type TodoPlannerInput,
  type TodoPlannerOutput,
  todoPlannerInputSchema,
  todoPlannerOutputSchema,
} from "./type.js";

export class TodoPlanner extends AIAgent<TodoPlannerInput, TodoPlannerOutput> {
  constructor(public options: AIAgentOptions<TodoPlannerInput, TodoPlannerOutput>) {
    super({
      name: "TodoPlanner",
      instructions: options.instructions || TODO_PLANNER_PROMPT_TEMPLATE,
      inputSchema: todoPlannerInputSchema,
      outputSchema: todoPlannerOutputSchema,
    });
  }
}

export class TodoWorker extends AIAgent {
  constructor(public options: AIAgentOptions) {
    super({
      ...options,
      name: "TodoWorker",
      instructions: options.instructions || TODO_WORKER_PROMPT_TEMPLATE,
    });
  }
}
