import { AIAgent, type AIAgentOptions } from "@aigne/core";
import z from "zod";
import type { PlannerInput, PlannerOutput } from "../../type.js";
import { DEFAULT_PLANNER_PROMPT_TEMPLATE } from "./prompt.js";

export class DefaultPlanner extends AIAgent<PlannerInput, PlannerOutput> {
  constructor(public options: AIAgentOptions) {
    super({
      name: "DefaultPlanner",
      outputSchema: z.object({
        plan: z.object({
          steps: z
            .array(
              z.object({
                tool: z.string().describe("The tool name to invoke."),
                action: z.string().describe("A concise title/summary of the task."),
                intent: z
                  .string()
                  .describe(
                    "Detailed instructions and context for what the tool should accomplish.",
                  ),
              }),
            )
            .describe("The list of steps in the plan, empty if no actions are needed."),
        }),
      }),
      instructions: options.instructions || DEFAULT_PLANNER_PROMPT_TEMPLATE,
    });
  }
}
