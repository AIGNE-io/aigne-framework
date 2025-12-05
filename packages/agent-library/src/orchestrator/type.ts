import type { Message } from "@aigne/core";

export type OrchestratorState = {};

export interface PlannerInput extends Message {
  objective: string;
  skills: {
    name: string;
    description?: string;
  }[];
  state?: OrchestratorState;
}

export interface PlannerOutput extends Message, OrchestratorState {
  nextTask?: string;
  finished?: boolean;
}
