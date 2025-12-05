import type { Message } from "@aigne/core";
import z from "zod";

export interface ExecutionState {
  tasks: { task: string; result: string }[];
}

export const executionStateSchema = z.object({
  tasks: z
    .array(
      z.object({
        task: z.string().describe("The description of the executed task."),
        result: z.string().describe("The result produced by executing the task."),
      }),
    )
    .describe("The list of tasks that have been executed along with their results."),
});

export interface PlannerInput extends Message {
  objective: string;
  skills: {
    name: string;
    description?: string;
  }[];
  executionState: ExecutionState;
}

export const plannerInputSchema = z.object({
  objective: z.string().describe("The user's overall objective."),
  skills: z
    .array(
      z.object({
        name: z.string().describe("The name of the skill."),
        description: z.string().optional().describe("A brief description of the skill."),
      }),
    )
    .describe("The list of available skills the agent can use."),
  executionState: executionStateSchema,
});

export interface PlannerOutput extends Message {
  nextTask?: string;
  finished?: boolean;
}

export const plannerOutputSchema = z.object({
  nextTask: z
    .string()
    .optional()
    .describe(
      "The next task to be executed by the worker. Should contain a clear, actionable description of what needs to be done.",
    ),
  finished: z
    .boolean()
    .optional()
    .describe(
      "Indicates if all tasks are completed and the objective has been achieved. Set to true when no more work is needed.",
    ),
});

export interface WorkerInput extends Message {
  objective: string;
  executionState: ExecutionState;
  task: string;
}

export const workerInputSchema = z.object({
  objective: z.string().describe("The user's overall objective."),
  task: z.string().describe("The specific task assigned to the worker for execution."),
  executionState: executionStateSchema,
});

export interface WorkerOutput extends Message {}

export interface CompleterInput extends Message {
  objective: string;
  executionState: ExecutionState;
}

export const completerInputSchema = z.object({
  objective: z.string().describe("The user's overall objective."),
  executionState: executionStateSchema,
});
