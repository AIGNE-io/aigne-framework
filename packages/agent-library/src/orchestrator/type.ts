import type { Message } from "@aigne/core";

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
