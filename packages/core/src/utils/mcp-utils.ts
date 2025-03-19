import { type JsonSchema, jsonSchemaToZod } from "@aigne/json-schema-to-zod";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { UriTemplate } from "@modelcontextprotocol/sdk/shared/uriTemplate.js";
import {
  CallToolResultSchema,
  GetPromptResultSchema,
  type ListPromptsResult,
  type ListResourceTemplatesResult,
  type ListResourcesResult,
  type ListToolsResult,
  ReadResourceResultSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { type ZodObject, type ZodType, z } from "zod";
import { MCPPrompt, MCPResource, MCPTool } from "../agents/mcp-agent.js";

export function toolFromMCPTool(client: Client, tool: ListToolsResult["tools"][number]) {
  return new MCPTool({
    client,
    name: tool.name,
    description: tool.description,
    inputSchema: jsonSchemaToZod<ZodObject<Record<string, ZodType>>>(
      tool.inputSchema as JsonSchema,
    ),
    outputSchema: CallToolResultSchema,
  });
}

export function promptFromMCPPrompt(client: Client, prompt: ListPromptsResult["prompts"][number]) {
  return new MCPPrompt({
    client,
    name: prompt.name,
    description: prompt.description,
    inputSchema: jsonSchemaToZod<ZodObject<Record<string, ZodType>>>({
      type: "object",
      properties:
        prompt.arguments &&
        Object.fromEntries(
          prompt.arguments.map((i) => [i.name, { type: "string", description: i.description }]),
        ),
      required: prompt.arguments?.filter((i) => i.required).map((i) => i.name),
    }),
    outputSchema: GetPromptResultSchema,
  });
}

export function resourceFromMCPResource(
  client: Client,
  resource:
    | ListResourcesResult["resources"][number]
    | ListResourceTemplatesResult["resourceTemplates"][number],
) {
  const [uri, variables] = isResourceTemplate(resource)
    ? [
        resource.uriTemplate,
        // TODO: use template.variableNames when it's available https://github.com/modelcontextprotocol/typescript-sdk/pull/188
        (
          new UriTemplate(resource.uriTemplate) as unknown as {
            parts: (string | { names: string[] })[];
          }
        ).parts.flatMap((i) => (typeof i === "object" ? i.names : [])),
      ]
    : [resource.uri, []];

  return new MCPResource({
    client,
    name: resource.name,
    uri,
    description: resource.description,
    inputSchema: z.object(Object.fromEntries(variables.map((i) => [i, z.string()]))),
    outputSchema: ReadResourceResultSchema,
  });
}

function isResourceTemplate(
  resource:
    | ListResourcesResult["resources"][number]
    | ListResourceTemplatesResult["resourceTemplates"][number],
): resource is ListResourceTemplatesResult["resourceTemplates"][number] {
  return typeof resource.uriTemplate === "string";
}
