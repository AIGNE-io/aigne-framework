import z from "zod";
import type { OrchestratorState, PlannerInput, PlannerOutput } from "../type.js";

export interface TodoPlannerInput extends PlannerInput {
  state?: TodoPlanState;
}

export interface TodoPlanState extends OrchestratorState {}

export interface TodoPlannerOutput extends PlannerOutput, TodoPlanState {}

export const todoPlannerInputSchema = z.object({
  objective: z.string().describe("The user's overall objective."),
  skills: z
    .array(
      z.object({
        name: z.string().describe("The name of the skill."),
        description: z.string().optional().describe("A brief description of the skill."),
      }),
    )
    .describe("The list of available skills the agent can use."),
});

export const todoPlannerOutputSchema = z.object({
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
