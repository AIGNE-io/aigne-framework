import { isEmpty, omitBy } from "lodash";

import type {
  AuthConfig,
  AuthResult,
  FetchRequest,
  HTTPMethod,
} from "../definitions/open-api";
import logger from "../logger";
import type { OpenAPIAgentDefinition } from "../open-api-agent";
import { OrderedRecord } from "./ordered-map";

export async function formatOpenAPIRequest(
  api: {
    url: string;
    method: HTTPMethod;
    auth?: AuthConfig;
  },
  inputs: OpenAPIAgentDefinition["inputs"],
  input: Record<string, any>,
): Promise<FetchRequest> {
  const { url, method, ...inputParams } = processParameters(api, inputs, input);
  logger.debug("inputParams", inputParams);

  const authParams = await getAuthParams(api.auth);
  logger.debug("authParams", authParams);

  return {
    url,
    method,
    ...omitBy(
      {
        ...inputParams,
        query: { ...inputParams.query, ...authParams.query },
        cookies: { ...inputParams.cookies, ...authParams.cookies },
        headers: { ...inputParams.headers, ...authParams.headers },
      },
      (i) => isEmpty(i),
    ),
  };
}

async function getAuthParams(auth?: AuthConfig): Promise<AuthResult> {
  if (!auth) return {};

  if (auth.type === "custom") {
    return await auth.getValue();
  }

  const { type, key, token } = auth;

  switch (auth.in) {
    case "query":
      return { query: { [key || "token"]: token } };
    case "cookie":
      return { cookies: { [key || "token"]: token } };
    default: {
      const prefix =
        type === "bearer" ? "Bearer " : type === "basic" ? "Basic " : "";
      return { headers: { [key || "Authorization"]: `${prefix}${token}` } };
    }
  }
}

function processParameters(
  api: {
    url: string;
    method: HTTPMethod;
  },
  inputs: OpenAPIAgentDefinition["inputs"],
  input: Record<string, any>,
): FetchRequest {
  const result: Required<FetchRequest> = {
    url: api.url,
    method: api.method,
    headers: {},
    query: {},
    cookies: {},
    body: {},
  };

  for (const [key, value] of Object.entries(input)) {
    const schema = OrderedRecord.find(inputs, (x) => x.name === key);
    if (!schema) continue;

    switch (schema.in) {
      case "query":
        result.query[key] = value;
        break;
      case "header":
        result.headers[key] = value;
        break;
      case "cookie":
        result.cookies[key] = value;
        break;
      case "body":
        result.body[key] = value;
        break;
      case "path":
        result.url = result.url.replace(`{${key}}`, String(value));
        break;
      default:
        // 没有指定 in 的情况
        if (result.method.toLowerCase() === "get") {
          result.query[key] = value;
        } else {
          result.body[key] = value;
        }
    }
  }

  return result;
}
