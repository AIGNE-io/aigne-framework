import type { Agent } from "./agent";

export const RUNTIME_RESOURCE_BLOCKLET_STATE_GLOBAL_VARIABLE =
  "__AI_RUNTIME_RESOURCE_BLOCKLET_STATE__";

export interface RuntimeResourceBlockletState {
  applications: Agent[];
}
