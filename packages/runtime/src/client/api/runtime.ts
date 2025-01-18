import type { RunnableDefinition } from "@aigne/core";
import { joinURL } from "ufo";

import { fetchApi } from "./api";

export async function getRunnableDefinition({
  projectId,
  agentId,
}: {
  projectId: string;
  agentId: string;
}): Promise<RunnableDefinition> {
  return fetchApi(
    joinURL("/api/aigne", projectId, "agents", agentId, "definition"),
  ).then((res) => res.json() as Promise<RunnableDefinition>);
}
