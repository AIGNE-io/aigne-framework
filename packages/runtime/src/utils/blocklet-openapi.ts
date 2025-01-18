import { checkFetchResponse } from "@aigne/core";
import config from "@blocklet/sdk/lib/config";
import { joinURL } from "ufo";

export async function getBlockletOpenAPIs() {
  const response = await fetch(
    joinURL(config.env.appUrl, "/.well-known/service/openapi.json"),
  );
  await checkFetchResponse(response);

  const schema = (await response.json()) as BlockletOpenAPIResponse;

  const paths = schema.paths;

  return Object.entries(paths).flatMap<BlockletOpenAPI>(([, methods]) =>
    Object.entries(methods).map(([, endpoint]) => ({
      id: endpoint["x-id"],
      did: endpoint["x-did"],
      path: endpoint["x-path"],
      method: endpoint["x-method"],
      ...endpoint,
    })),
  );
}

type BlockletOpenAPIResponse = {
  paths: {
    [paths: string]: {
      [method: string]: {
        "x-id": string;
        "x-did": string;
        "x-path": string;
        "x-method": string;
        type: string;
        summary?: string;
        description?: string;
      };
    };
  };
};

export type BlockletOpenAPI = {
  id: string;
  did: string;
  method: string;
  path: string;
  summary?: string;
  description?: string;
};
