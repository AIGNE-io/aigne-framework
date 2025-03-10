import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import {
  StdioClientTransport,
  type StdioServerParameters,
} from "@modelcontextprotocol/sdk/client/stdio.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { type JsonSchema, jsonSchemaToZod } from "@n8n/json-schema-to-zod";
import { type ZodObject, z } from "zod";
import { Agent, type AgentInput, type AgentOptions, type AgentOutput } from "./agent";

const MCP_AGENT_CLIENT_NAME = "MCPAgent";
const MCP_AGENT_CLIENT_VERSION = "0.0.1";

export interface MCPAgentOptions extends AgentOptions {
  client: Client;
}

export type MCPServerOptions = SSEServerParameters | StdioServerParameters;

export type SSEServerParameters = {
  url: string;
};

function isSSEServerParameters(
  options: MCPAgentOptions | MCPServerOptions,
): options is SSEServerParameters {
  return "url" in options && typeof options.url === "string";
}

function isStdioServerParameters(
  options: MCPAgentOptions | MCPServerOptions,
): options is StdioServerParameters {
  return "command" in options && typeof options.command === "string";
}

export class MCPAgent extends Agent {
  static from(options: MCPServerOptions): Promise<MCPAgent>;
  static from(options: MCPAgentOptions): MCPAgent;
  static from(options: MCPAgentOptions | MCPServerOptions): MCPAgent | Promise<MCPAgent> {
    if (isSSEServerParameters(options)) {
      const transport = new SSEClientTransport(new URL(options.url));
      return MCPAgent.fromTransport(transport);
    }

    if (isStdioServerParameters(options)) {
      const transport = new StdioClientTransport(options);
      return MCPAgent.fromTransport(transport);
    }

    return new MCPAgent(options);
  }

  private static async fromTransport(transport: Transport): Promise<MCPAgent> {
    const client = new Client({
      name: MCP_AGENT_CLIENT_NAME,
      version: MCP_AGENT_CLIENT_VERSION,
    });
    await client.connect(transport);
    const { tools: mcpTools } = await client.listTools();

    const skills = mcpTools.map((tool) => {
      return new MCPTool({
        client,
        name: tool.name,
        description: tool.description,
        inputSchema: jsonSchemaToZod<ZodObject<any>>(tool.inputSchema as JsonSchema),
        outputSchema: z
          .object({
            _meta: z.record(z.unknown()).optional(),
            content: z.array(z.record(z.unknown())),
            isError: z.boolean().optional(),
          })
          .passthrough(),
      });
    });

    return new MCPAgent({ client, skills });
  }

  constructor(options: MCPAgentOptions) {
    super(options);

    this.client = options.client;
  }

  private client: Client;

  override async destroy() {
    super.destroy();
    await this.client.close();
  }
}

export interface MCPToolOptions extends AgentOptions {
  client: Client;
}

export class MCPTool extends Agent {
  constructor(options: MCPToolOptions) {
    super(options);
    this.client = options.client;
  }

  private client: Client;

  async process(input: AgentInput): Promise<AgentOutput> {
    return await this.client.callTool({ name: this.name, arguments: input });
  }
}
