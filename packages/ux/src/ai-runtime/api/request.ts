import { createFetch } from "@blocklet/js-sdk";
import { withQuery } from "ufo";

import { AI_RUNTIME_DID } from "../constants";
import { CustomError } from "../error";
import { getComponentMountPoint } from "../utils/mount-point";

let isDEV = false;

try {
  // @ts-ignore
  isDEV = import.meta.env.DEV;
} catch {
  // ignore
}

export const getAIRuntimeApiPrefix = () =>
  (window as any).AI_RUNTIME_API_PREFIX || getComponentMountPoint(AI_RUNTIME_DID);

const fetchMap: { [blocklet: string]: typeof window.fetch } = {};

const getFetch = (blocklet: string) => {
  if (!fetchMap[blocklet]) {
    fetchMap[blocklet] = createFetch({}, { lazy: isDEV, lazyTime: 1000, componentDid: blocklet });
  }

  return fetchMap[blocklet]!;
};

export const fetch = (
  input: RequestInfo,
  { blocklet, ...init }: { blocklet: string } & RequestInit,
) => {
  const f = getFetch(blocklet);
  return f(input, init);
};

export async function request<T>({
  blocklet,
  url,
  query,
  body,
  ...init
}: {
  blocklet: string;
  url: string;
  query?: { [key: string]: any };
  body?: any;
} & Omit<RequestInit, "body">): Promise<T> {
  const fetch = getFetch(blocklet);

  const result = await fetch(withQuery(url, query ?? {}), {
    ...init,
    headers: {
      "Content-Type": "application/json",
    },
    body: typeof body === "object" ? JSON.stringify(body) : body,
  });

  if (!(result.status >= 200 && result.status < 300)) {
    let json;
    try {
      json = await result.json();
    } catch (error) {
      console.error("parse response error", error);
    }

    const message = json?.error?.message ?? json?.message ?? json?.error;
    throw new CustomError(
      result.status,
      typeof message === "string" ? message : `request error ${result.status}`,
    );
  }

  return result.json();
}
