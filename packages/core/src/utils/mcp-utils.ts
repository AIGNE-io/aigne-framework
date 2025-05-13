import { type JsonSchema, jsonSchemaToZod } from "@aigne/json-schema-to-zod";
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
import { type MCPBaseOptions, MCPPrompt, MCPResource, MCPTool } from "../agents/mcp-agent.js";
import { isEmpty } from "./type-utils.js";

export function toolFromMCPTool(tool: ListToolsResult["tools"][number], options: MCPBaseOptions) {
  return new MCPTool({
    ...options,
    name: tool.name,
    description: tool.description,
    inputSchema: isEmpty(tool.inputSchema.properties)
      ? z.object({})
      : jsonSchemaToZod<ZodObject<Record<string, ZodType>>>(tool.inputSchema as JsonSchema),
    outputSchema: CallToolResultSchema,
  });
}

export function promptFromMCPPrompt(
  prompt: ListPromptsResult["prompts"][number],
  options: MCPBaseOptions,
) {
  return new MCPPrompt({
    ...options,
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
  resource:
    | ListResourcesResult["resources"][number]
    | ListResourceTemplatesResult["resourceTemplates"][number],
  options: MCPBaseOptions,
) {
  const [uri, variables] = isResourceTemplate(resource)
    ? [resource.uriTemplate, new UriTemplate(resource.uriTemplate).variableNames]
    : [resource.uri, []];

  return new MCPResource({
    ...options,
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
