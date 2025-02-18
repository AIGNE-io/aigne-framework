import type {
  MemoryActions,
  MemoryItem,
  RunnableDefinition,
} from "@aigne/core";
import { joinURL, withQuery } from "ufo";

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

export async function getRunnableHistories({
  projectId,
  agentId,
  options = {},
}: {
  projectId: string;
  agentId: string;
  options?: Omit<
    Extract<MemoryActions<unknown>, { action: "filter" }>["inputs"]["options"],
    "userId" | "agentId"
  >;
}): Promise<{ results?: MemoryItem<{ input: object; output: object }>[] }> {
  return fetchApi(
    withQuery(
      joinURL("/api/aigne", projectId, "agents", agentId, "histories"),
      { ...options },
    ),
  ).then((res) => res.json() as any);
}
