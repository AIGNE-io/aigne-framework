import { joinURL } from "ufo";

import type { RunAssistantResponse } from "@aigne/agent-v1";
import { AI_RUNTIME_DID } from "../constants";
import { EventSourceParserStream } from "../utils/stream";
import { fetch, request } from "./request";

export interface Session {
  id: string;
  createdAt: string;
  updatedAt: string;
  name?: string;
  userId?: string;
  projectId: string;
  agentId: string;
}

export async function getSessions({ aid }: { aid: string }): Promise<{ sessions: Session[] }> {
  return request({
    blocklet: AI_RUNTIME_DID,
    url: "/api/sessions",
    query: { aid },
  });
}

export async function getSession({
  sessionId,
}: { sessionId: string }): Promise<{ session: Session }> {
  return request({
    blocklet: AI_RUNTIME_DID,
    url: joinURL("/api/sessions", sessionId),
  });
}

export async function createSession({
  aid,
  name,
}: {
  aid: string;
  name?: string;
}): Promise<{ created: Session; sessions: Session[] }> {
  return request({
    blocklet: AI_RUNTIME_DID,
    method: "POST",
    url: "/api/sessions",
    body: {
      aid,
      name,
    },
  });
}

export async function clearSession({ sessionId }: { sessionId: string }): Promise<{}> {
  return request({
    blocklet: AI_RUNTIME_DID,
    method: "POST",
    url: joinURL("/api/sessions", sessionId, "/clear"),
  });
}

export async function updateSession({
  sessionId,
  name,
}: {
  sessionId: string;
  name?: string;
}): Promise<{ updated: Session; sessions: Session[] }> {
  return request({
    blocklet: AI_RUNTIME_DID,
    method: "PATCH",
    url: joinURL("/api/sessions", sessionId),
    body: { name },
  });
}

export async function deleteSession({
  sessionId,
}: {
  sessionId: string;
}): Promise<{ deleted: Session; sessions: Session[] }> {
  return request({
    blocklet: AI_RUNTIME_DID,
    method: "DELETE",
    url: joinURL("/api/sessions", sessionId),
  });
}

export interface RunAgentInput {
  entryAid?: string;
  aid: string;
  working?: boolean;
  debug?: boolean;
  sessionId?: string;
  inputs?: { [key: string]: any };
  appUrl?: string;
}

export async function runAgent(
  input: RunAgentInput & { responseType?: undefined },
): Promise<{ [key: string]: any }>;
export async function runAgent(
  input: RunAgentInput & { responseType: "stream" },
): Promise<ReadableStream<RunAssistantResponse>>;
export async function runAgent({
  responseType,
  ...input
}: RunAgentInput & { responseType?: "stream" }) {
  if (responseType === "stream") {
    const res = await fetch("/api/ai/call", {
      blocklet: AI_RUNTIME_DID,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        entryAid: input.entryAid,
        aid: input.aid,
        sessionId: input.sessionId,
        inputs: { ...input.inputs, $clientTime: new Date().toISOString() },
        working: input.working,
        debug: input.debug,
        appUrl: input.appUrl || window.location.href,
      }),
    });
    if (!(res.status >= 200 && res.status < 300)) {
      let json: any;
      try {
        json = await res.json();
      } catch (error) {
        // ignore
      }
      const message = json?.error?.message;
      if (typeof message === "string") {
        throw new Error(message);
      }
      throw new Error(`Unknown Error: ${res.status}`);
    }
    return res
      .body!.pipeThrough(new TextDecoderStream())
      .pipeThrough(new EventSourceParserStream<RunAssistantResponse>());
  }

  return request({
    blocklet: AI_RUNTIME_DID,
    method: "POST",
    url: joinURL("/api/ai/call"),
    body: input,
  });
}
