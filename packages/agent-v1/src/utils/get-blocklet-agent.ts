import config from "@blocklet/sdk/lib/config";
import axios from "axios";
import { Base64 } from "js-base64";
import { joinURL } from "ufo";

import type { GetAgentResult } from "../assistant/type";
import { AIGNE_RUNTIME_COMPONENT_DID } from "../constants";
import { getAllParameters } from "../libs/openapi/request/util";
import type { DatasetObject } from "../libs/openapi/types";
import flattenApiStructure from "../libs/openapi/util/flatten-open-api";
import type { StringParameter } from "../types";
import { nextId } from "./task-id";

export const HISTORY_API_ID = Base64.encodeURI(
  ["/api/messages", "get"].join("/"),
);
export const KNOWLEDGE_API_ID = Base64.encodeURI(
  ["/api/datasets/{datasetId}/search", "get"].join("/"),
);
export const MEMORY_API_ID = Base64.encodeURI(
  ["/api/memories/variable-by-query", "get"].join("/"),
);

// 内置的 OpenAPI 接口
export const buildInOpenAPI = {
  "/api/messages": {
    get: {
      summary: "Get history messages",
      "x-summary-zh": "获取历史信息",
      description:
        "Retrieve messages based on sessionId, last N messages, or keyword",
      "x-description-zh": "根据 sessionId、最后N条消息或关键字检索历史消息",
      tags: ["AIGNE Studio"],
      parameters: [
        {
          in: "query",
          name: "sessionId",
          schema: {
            type: "string",
          },
          description: "Session Id",
        },
        {
          in: "query",
          name: "limit",
          schema: {
            type: "number",
          },
          description: "Number of last messages to retrieve",
          "x-description-zh": "检索的消息的数目",
        },
        {
          in: "query",
          name: "keyword",
          schema: {
            type: "string",
          },
          description: "Keyword to search in messages",
          "x-description-zh": "在消息中搜索的关键字",
        },
      ],
      responses: {
        "200": {
          description: "A list of history messages",
          "x-description-zh": "检索历史消息列表",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  messages: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        role: {
                          type: "string",
                        },
                        content: {
                          type: "string",
                        },
                        agentId: {
                          type: "string",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "x-id": HISTORY_API_ID,
      "x-did": AIGNE_RUNTIME_COMPONENT_DID,
      "x-path": "/api/messages",
      "x-method": "get",
    },
  },
  "/api/datasets/{datasetId}/search": {
    get: {
      summary: "Search the knowledge",
      "x-summary-zh": "搜索知识库信息",
      parameters: [
        {
          name: "datasetId",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
          description: "The ID of the dataset to search",
        },
        {
          name: "blockletDid",
          in: "query",
          required: false,
          schema: {
            type: "string",
          },
          description: "The Blocklet DID to search for",
        },
        {
          name: "searchAll",
          in: "query",
          required: false,
          schema: {
            type: "boolean",
          },
          description: "Whether to search all contents",
        },
        {
          name: "message",
          in: "query",
          required: false,
          schema: {
            type: "string",
          },
          description: "The search message",
        },
        {
          name: "n",
          in: "query",
          required: false,
          schema: {
            type: "number",
            default: 10,
          },
          description: "The number of results to return",
        },
      ],
      responses: {
        "200": {
          description: "A list of search results",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  docs: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: {
                          type: "string",
                          description: "The title of the document",
                        },
                        content: {
                          type: "string",
                          description: "The content of the document",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "x-id": KNOWLEDGE_API_ID,
      "x-did": AIGNE_RUNTIME_COMPONENT_DID,
      "x-path": "/api/datasets/{datasetId}/search",
      "x-method": "get",
    },
  },
  "/api/memories/variable-by-query": {
    get: {
      summary: "Get memory variables by query",
      "x-summary-zh": "知识库信息",
      parameters: [
        {
          name: "key",
          in: "query",
          required: false,
          schema: {
            type: "string",
          },
          description: "The key of the variable",
        },
        {
          name: "projectId",
          in: "query",
          required: false,
          schema: {
            type: "string",
          },
          description: "The ID of the project",
        },
        {
          name: "scope",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["session", "user", "global"],
          },
          description: "The scope of the variable",
        },
        {
          name: "sessionId",
          in: "query",
          required: false,
          schema: {
            type: "string",
          },
          description: "The ID of the session",
        },
      ],
      responses: {
        "200": {
          description: "A list of memory variables",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  datastores: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                          description: "The ID of the memory entry",
                        },
                        key: {
                          type: "string",
                          description: "The key of the memory entry",
                        },
                        data: {
                          type: "object",
                          description: "The value of the memory entry",
                        },
                        userId: {
                          type: "string",
                          description: "The ID of the user",
                        },
                        projectId: {
                          type: "string",
                          description: "The ID of the project",
                        },
                        sessionId: {
                          type: "string",
                          description: "The ID of the session",
                        },
                        scope: {
                          type: "string",
                          description: "The scope of the memory entry",
                          enum: ["session", "user", "global"],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "x-id": MEMORY_API_ID,
      "x-did": AIGNE_RUNTIME_COMPONENT_DID,
      "x-path": "/api/memories/variable-by-query",
      "x-method": "get",
    },
  },
};

type OpenAPIResponseSchema = {
  type: string;
  properties?: { [key: string]: OpenAPIResponseSchema };
  items?: OpenAPIResponseSchema;
};

function convertSchemaToVariableType(schema: OpenAPIResponseSchema): any {
  switch (schema.type) {
    case "string":
      return { type: "string", defaultValue: "" };
    case "integer":
    case "number":
      return { type: "number", defaultValue: undefined };
    case "boolean":
      return { type: "boolean", defaultValue: undefined };
    case "object":
      return {
        type: "object",
        properties: schema.properties
          ? Object.entries(schema.properties).map(([key, value]) => ({
              id: key,
              name: key,
              ...convertSchemaToVariableType(value),
            }))
          : [],
      };
    case "array":
      return {
        type: "array",
        element: schema.items
          ? convertSchemaToVariableType(schema.items)
          : undefined,
      };
    default:
      throw new Error(`Unsupported schema type: ${schema.type}`);
  }
}

export const getBlockletAgent = async () => {
  let list = {};
  try {
    const result = await axios.get(
      joinURL(config.env.appUrl, "/.well-known/service/openapi.json"),
    );
    list = result.data;
  } catch (error) {
    list = {};
  }

  const openApis = [
    ...flattenApiStructure(list as any),
    ...flattenApiStructure({ paths: buildInOpenAPI } as any),
  ];

  const agents: (GetAgentResult & { openApi: DatasetObject })[] = openApis.map(
    (i) => {
      const properties =
        i?.responses?.["200"]?.content?.["application/json"]?.schema
          ?.properties || {};

      return {
        type: "blocklet",
        id: i.id,
        name: i?.summary,
        description: i?.description,
        parameters: getAllParameters(i)
          .map((i) => {
            return {
              id: nextId(),
              type: "string",
              key: i.name,
            };
          })
          .filter((i) => i.key) as StringParameter[],
        outputVariables: Object.entries(properties).map(
          ([key, value]: any) => ({
            id: key,
            name: key,
            ...convertSchemaToVariableType(value),
          }),
        ),
        openApi: i,
      };
    },
  );

  const agentsMap = agents.reduce(
    (acc, cur) => {
      acc[cur.id] = cur;
      return acc;
    },
    {} as { [key: string]: GetAgentResult & { openApi: DatasetObject } },
  );

  return { agents, agentsMap, openApis };
};
