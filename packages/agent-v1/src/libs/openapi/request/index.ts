import { call } from "@blocklet/sdk/lib/component";
import type { Method } from "axios";

import type { DatasetObject } from "../types";
import { getRequestConfig } from "./util";

export interface User {
  did: string;
}

export const callBlockletApi = (
  pathItem: DatasetObject,
  data: { [key: string]: any },
  options?: {
    user?: User;
    params?: { [key: string]: any };
    data?: { [key: string]: any };
  },
) => {
  const requestConfig = getRequestConfig(pathItem, data, {
    params: options?.params || {},
    data: options?.data || {},
  });
  const { headers, method, url, params, ...config } = requestConfig;
  const did = options?.user?.did || "";

  if (!pathItem.name)
    throw new Error("Blocklet name is required to call blocklet api");

  return call({
    ...config,
    method: method as Method,
    name: pathItem.name,
    path: url,
    headers,
    params: { ...params, userId: did },
  });
};
