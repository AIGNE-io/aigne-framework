import type { Agent } from "../types";
import { AgentExecutorBase } from "./base";

export class AgentExecutor extends AgentExecutorBase<Agent> {
  override async process() {
    // ignore
  }
}
