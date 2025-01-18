import type { OutputVariable, Parameter } from "../assistant";
import type { ProjectSettings } from "../resource";

export interface Agent {
  id: string;
  name?: string;
  description?: string;
  parameters?: Parameter[];
  outputVariables?: OutputVariable[];
  createdBy?: string;
  type?: string;

  identity: {
    blockletDid?: string;
    projectId: string;
    projectRef?: string;
    agentId: string;
    aid: string;
    working?: boolean;
  };

  project: ProjectSettings;

  access?: {
    noLoginRequired?: boolean;
  };
}

export interface AgentWithConfig extends Agent {
  config: {
    secrets: {
      targetProjectId: string;
      targetAgentId: string;
      targetInput: Parameter;
      hasValue: boolean;
    }[];
  };
}
