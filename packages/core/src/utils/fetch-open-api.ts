import { withQuery } from "ufo";

import type { FetchRequest } from "../definitions/open-api";
import { FETCH_TIMEOUT } from "./constants";
import { checkFetchResponse } from "./fetch";

export async function fetchOpenApi<T>(request: FetchRequest): Promise<T> {
  const cookie = request.cookies
    ? Object.entries(request.cookies)
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
        )
        .join("; ")
        .trim()
    : undefined;

  const controller = new AbortController();
  const abortTimer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  const response = await fetch(withQuery(request.url, request.query ?? {}), {
    method: request.method,
    headers: {
      "Content-Type": "application/json",
      ...request.headers,
      ...(cookie && { cookie }),
    },
    body:
      request.method.toLowerCase() !== "get" && request.body
        ? JSON.stringify(request.body)
        : undefined,
    credentials: request.cookies ? "include" : "same-origin",
    signal: controller.signal,
  }).finally(() => clearTimeout(abortTimer));

  await checkFetchResponse(response);

  return response.json() as Promise<T>;
}
