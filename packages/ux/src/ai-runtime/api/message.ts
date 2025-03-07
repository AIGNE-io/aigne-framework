import { joinURL } from "ufo";

import { AI_RUNTIME_DID } from "../constants";
import { request } from "./request";

export interface Message {
  id: string;
  aid: string;
  agentId: string;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  inputs?: { [key: string]: any };
  outputs?: {
    content?: string;
    objects?: { [key: string]: any }[];
  } | null;
  error?: { type?: string; message: string };
}

export interface GetMessagesQuery {
  limit?: number;
  before?: string;
  after?: string;
  orderDirection?: "asc" | "desc";
}

export async function getMessages({
  sessionId,
  ...query
}: {
  sessionId: string;
} & GetMessagesQuery): Promise<{ messages: Message[]; count: number }> {
  return request({
    blocklet: AI_RUNTIME_DID,
    url: joinURL("/api/sessions", sessionId, "messages"),
    query,
  });
}

export async function deleteMessages({ sessionId }: { sessionId: string }): Promise<void> {
  await request({
    blocklet: AI_RUNTIME_DID,
    method: "DELETE",
    url: joinURL("/api/sessions", sessionId, "messages"),
  });
}
