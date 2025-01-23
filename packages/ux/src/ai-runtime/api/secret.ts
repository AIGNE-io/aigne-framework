import { AI_RUNTIME_DID } from "../constants";
import { request } from "./request";

export interface CreateOrUpdateSecretsInput {
  secrets: {
    projectId: string;
    targetProjectId: string;
    targetAgentId: string;
    targetInputKey: string;
    secret: string;
  }[];
}

export async function createSecrets({
  input,
}: { input: CreateOrUpdateSecretsInput }): Promise<{}> {
  return request({
    blocklet: AI_RUNTIME_DID,
    method: "POST",
    url: "/api/secrets",
    body: input,
  });
}
