import type { Message } from "@aigne/core";
import { optionalize } from "@aigne/core/loader/schema.js";
import z from "zod";

/**
 * Task execution status
 */
export type TaskStatus = "pending" | "completed" | "failed";

/**
 * Individual task execution record
 */
export interface TaskRecord {
  /** Task description */
  task: string;
  /** Task execution status */
  status: TaskStatus;
  /** Task execution result (can be any type) */
  result?: unknown;
  /** Error information if task failed */
  error?: {
    message: string;
  };
  /** Timestamp when task was created */
  createdAt?: number;
  /** Timestamp when task was completed or failed */
  completedAt?: number;
}

/**
 * Execution state tracking all tasks
 */
export interface ExecutionState {
  tasks: TaskRecord[];
}

export const taskRecordSchema = z.object({
  task: z.string().describe("The description of the executed task."),
  status: z
    .enum(["pending", "completed", "failed"])
    .describe("The execution status of the task: pending, completed, or failed."),
  result: z.unknown().optional().describe("The result produced by executing the task."),
  error: z
    .object({
      message: z.string().describe("Error message if the task failed."),
    })
    .optional()
    .describe("Error information if the task failed."),
  createdAt: z.number().optional().describe("Timestamp when the task was created."),
  completedAt: z.number().optional().describe("Timestamp when the task completed or failed."),
});

export const executionStateSchema = z.object({
  tasks: z
    .array(taskRecordSchema)
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

/**
 * Worker output structure
 */
export interface WorkerOutput extends Message {
  /** Task execution result */
  result?: string;
  /** Whether the task was completed successfully */
  success?: boolean;
  /** Error information if task failed */
  error?: {
    message: string;
  };
}

export const workerOutputSchema = z.object({
  result: z
    .string()
    .optional()
    .describe(
      "The text result or output produced by executing the task. Include key findings, data retrieved, or actions taken. Can be omitted if the task failed with no partial results.",
    ),
  success: z
    .boolean()
    .describe(
      "Whether the task completed successfully. Set to true if the task achieved its goal, false if it encountered errors or could not be completed.",
    ),
  error: z
    .object({
      message: z
        .string()
        .describe(
          "A clear description of what went wrong, including error type and relevant context to help with debugging or retry strategies.",
        ),
    })
    .optional()
    .describe("Error details if the task failed. Only include when success is false."),
});

export interface CompleterInput extends Message {
  objective: string;
  executionState: ExecutionState;
}

export const completerInputSchema = z.object({
  objective: z.string().describe("The user's overall objective."),
  executionState: executionStateSchema,
});

/**
 * Options for managing execution state to prevent context overflow
 */
export interface StateManagementOptions {
  /**
   * Maximum tokens allowed for execution state
   * When exceeded, triggers compression
   */
  maxTokens?: number;

  /**
   * Number of recent tasks to keep when compression is triggered
   */
  keepRecent?: number;
}

export const stateManagementOptionsSchema = z.object({
  maxTokens: optionalize(z.number().int().positive()),
  keepRecent: optionalize(z.number().int().positive()),
});
