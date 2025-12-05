import { AIAgent, type AIAgentOptions } from "@aigne/core";
import {
  type PlannerInput,
  type PlannerOutput,
  plannerInputSchema,
  plannerOutputSchema,
} from "../../type.js";
import { DEFAULT_PLANNER_PROMPT_TEMPLATE } from "./prompt.js";

export class DefaultPlanner extends AIAgent<PlannerInput, PlannerOutput> {
  constructor(public options: AIAgentOptions) {
    super({
      name: "DefaultPlanner",
      instructions: options.instructions || DEFAULT_PLANNER_PROMPT_TEMPLATE,
      inputSchema: plannerInputSchema,
      outputSchema: plannerOutputSchema,
    });
  }
}
