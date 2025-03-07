import { Base64 } from "js-base64";

export interface Identity {
  blockletDid?: string;
  projectId: string;
  projectRef?: string;
  agentId: string;
}

export function parseIdentity(aid: string, options: { rejectWhenError: true }): Identity;
export function parseIdentity(
  aid: string,
  options?: { rejectWhenError?: false },
): Identity | undefined;
export function parseIdentity(
  aid: string,
  options?: { rejectWhenError?: boolean },
): Identity | undefined {
  let blockletDid: string | undefined;
  let projectId: string | undefined;
  let projectRef: string | undefined;
  let agentId: string | undefined;

  try {
    const s = Base64.decode(aid).split("/");
    if (s.length === 4) {
      [blockletDid, projectId, projectRef, agentId] = s;
    } else if (s.length === 3) {
      [projectId, projectRef, agentId] = s;
    } else if (s.length === 2) {
      [projectId, agentId] = s;
    }
  } catch (error) {
    console.error("parse assistantId error", { error });
  }

  if (projectId && agentId)
    return {
      blockletDid: blockletDid || undefined,
      projectId,
      projectRef: projectRef || undefined,
      agentId,
    };

  if (options?.rejectWhenError) throw new Error(`Invalid assistant identity ${aid}`);

  return undefined;
}

export function stringifyIdentity({
  blockletDid,
  projectId,
  projectRef,
  agentId,
}: {
  blockletDid?: string;
  projectId: string;
  projectRef?: string;
  agentId: string;
}): string {
  if (typeof projectId !== "string" || typeof agentId !== "string") {
    throw new Error("Invalid aid fragments");
  }

  return Base64.encodeURI([blockletDid || "", projectId, projectRef || "", agentId].join("/"));
}
