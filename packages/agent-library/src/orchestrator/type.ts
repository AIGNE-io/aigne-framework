import type { Message } from "@aigne/core";
import z from "zod";

export interface PlannerInput extends Message {
  objective: string;
  skills: {
    name: string;
    description?: string;
  }[];
}

export interface PlannerOutput extends Message {
  plan: {
    steps: Array<{
      tool: string;
      action: string;
      intent: string;
    }>;
  };
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
});

export const plannerOutputSchema = z.object({
  plan: z.object({
    steps: z
      .array(
        z.object({
          tool: z.string().describe("The tool name to invoke."),
          action: z.string().describe("A concise title/summary of the task."),
          intent: z
            .string()
            .describe("Detailed instructions and context for what the tool should accomplish."),
        }),
      )
      .describe("The list of steps in the plan, empty if no actions are needed."),
  }),
});
