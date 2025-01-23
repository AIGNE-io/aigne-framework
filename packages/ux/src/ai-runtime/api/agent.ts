import { joinURL } from "ufo";

import type { AssistantBase, OutputVariable, Parameter } from "@aigne/agent-v1";
import { AI_RUNTIME_DID } from "../constants";
import { request } from "./request";

export interface Agent {
  id: string;
  name?: string;
  description?: string;
  parameters?: Parameter[];
  outputVariables?: OutputVariable[];
  entries?: {
    id: string;
    title?: string;
    parameters?: { [key: string]: any };
  }[];
  release?: AssistantBase["release"];
  createdBy?: string;
  type?: string;

  project: {
    id: string;
    name?: string;
    description?: string;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
    appearance?: {
      primaryColor?: string;
      secondaryColor?: string;
      typography?: {
        fontFamily?: string;
        heading?: {
          fontFamily?: string;
        };
      };
    };
  };

  config: {
    secrets: {
      targetProjectId: string;
      targetAgentId: string;
      targetInput: Parameter;
      hasValue: boolean;
    }[];
  };

  access?: {
    noLoginRequired?: boolean;
  };

  observe?: (listener: (agent: Agent) => void) => () => void;
}

export async function getAgent({
  aid,
  working,
}: { aid: string; working?: boolean }): Promise<Agent> {
  return request({
    blocklet: AI_RUNTIME_DID,
    url: joinURL("/api/agents", aid),
    query: { working },
  });
}
