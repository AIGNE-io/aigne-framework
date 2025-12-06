import { AIAgent, type AIAgentOptions } from "@aigne/core";
import { workerOutputSchema } from "../type.js";
import { TODO_PLANNER_PROMPT_TEMPLATE, TODO_WORKER_PROMPT_TEMPLATE } from "./prompt.js";
import {
  type TodoPlannerInput,
  type TodoPlannerOutput,
  todoPlannerInputSchema,
  todoPlannerOutputSchema,
  todoWorkerInputSchema,
} from "./type.js";

export class TodoPlanner extends AIAgent<TodoPlannerInput, TodoPlannerOutput> {
  constructor(options: AIAgentOptions<TodoPlannerInput, TodoPlannerOutput>) {
    super({
      name: "TodoPlanner",
      ...options,
      instructions: options.instructions || TODO_PLANNER_PROMPT_TEMPLATE,
      inputSchema: options.inputSchema || todoPlannerInputSchema,
      outputSchema: options.outputSchema || todoPlannerOutputSchema,
    });
  }
}

export class TodoWorker extends AIAgent {
  constructor(options: AIAgentOptions) {
    super({
      name: "TodoWorker",
      ...options,
      instructions: options.instructions || TODO_WORKER_PROMPT_TEMPLATE,
      inputSchema: options.inputSchema || todoWorkerInputSchema,
      outputSchema: options.outputSchema || workerOutputSchema,
    });
  }
}
