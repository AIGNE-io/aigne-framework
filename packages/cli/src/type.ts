import type { AgentInvokeOptions as _AgentInvokeOptions, UserContext } from "@aigne/core";
import type * as prompts from "@inquirer/prompts";

export interface AgentInvokeOptions<U extends UserContext = UserContext>
  extends _AgentInvokeOptions<U> {
  prompts: typeof prompts;
}
