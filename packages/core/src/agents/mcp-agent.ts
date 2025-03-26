import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import {
  StdioClientTransport,
  type StdioServerParameters,
  getDefaultEnvironment,
} from "@modelcontextprotocol/sdk/client/stdio.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { UriTemplate } from "@modelcontextprotocol/sdk/shared/uriTemplate.js";
import type {
  CallToolResult,
  GetPromptResult,
  ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";
import { type ZodType, z } from "zod";
import type { Context } from "../execution-engine/context.js";
import { logger } from "../utils/logger.js";
import {
  promptFromMCPPrompt,
  resourceFromMCPResource,
  toolFromMCPTool,
} from "../utils/mcp-utils.js";
import { checkArguments, createAccessorArray } from "../utils/type-utils.js";
import { Agent, type AgentOptions, type Message } from "./agent.js";

const MCP_AGENT_CLIENT_NAME = "MCPAgent";
const MCP_AGENT_CLIENT_VERSION = "0.0.1";

const debug = logger.base.extend("mcp");

export interface MCPAgentOptions extends AgentOptions {
  client: Client;

  prompts?: MCPPrompt[];

  resources?: MCPResource[];
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

function getMCPServerString(options: MCPAgentOptions | MCPServerOptions): string {
  if (isSSEServerParameters(options)) {
    return options.url;
  }

  if (isStdioServerParameters(options)) {
    return `${options.command} ${options.args?.join(" ") || ""}`;
  }

  return "unknown";
}

export class MCPAgent extends Agent {
  static from(options: MCPServerOptions): Promise<MCPAgent>;
  static from(options: MCPAgentOptions): MCPAgent;
  static from(options: MCPAgentOptions | MCPServerOptions): MCPAgent | Promise<MCPAgent> {
    checkArguments("MCPAgent.from", mcpAgentOptionsSchema, options);

    if (isSSEServerParameters(options)) {
      const transport = new SSEClientTransport(new URL(options.url));
      return MCPAgent.fromTransport(transport, options);
    }

    if (isStdioServerParameters(options)) {
      const transport = new StdioClientTransport({
        ...options,
        env: {
          ...getDefaultEnvironment(),
          ...options.env,
        },
        stderr: "pipe",
      });
      return MCPAgent.fromTransport(transport, options);
    }

    return new MCPAgent(options);
  }

  private static async fromTransport(
    transport: Transport,
    options: MCPAgentOptions | MCPServerOptions,
  ): Promise<MCPAgent> {
    const client = new Client({
      name: MCP_AGENT_CLIENT_NAME,
      version: MCP_AGENT_CLIENT_VERSION,
    });

    await debug.spinner(
      client.connect(transport),
      `Connecting to MCP server: ${getMCPServerString(options)}`,
    );

    const mcpServer = getMCPServerName(client);

    const {
      tools: isToolsAvailable,
      prompts: isPromptsAvailable,
      resources: isResourcesAvailable,
    } = client.getServerCapabilities() ?? {};

    const tools = isToolsAvailable
      ? await debug
          .spinner(client.listTools(), `Listing tools from ${mcpServer}`, ({ tools }) =>
            debug("%O", tools),
          )
          .then(({ tools }) => tools.map((tool) => toolFromMCPTool(client, tool)))
      : undefined;

    const prompts = isPromptsAvailable
      ? await debug
          .spinner(client.listPrompts(), `Listing prompts from ${mcpServer}`, ({ prompts }) =>
            debug("%O", prompts),
          )
          .then(({ prompts }) => prompts.map((prompt) => promptFromMCPPrompt(client, prompt)))
      : undefined;

    const resources = isResourcesAvailable
      ? await debug
          .spinner(
            // TODO: should conditionally call listResourceTemplates based on the server capabilities
            // but the capability is not correct in the current SDK version
            Promise.all([
              client.listResources().catch(() => ({ resources: [] })),
              client.listResourceTemplates().catch(() => ({ resourceTemplates: [] })),
            ]),
            `Listing resources from ${mcpServer}`,
            ([{ resources }, { resourceTemplates }]) =>
              debug("%O\n%O", resources, resourceTemplates),
          )
          .then(([{ resources }, { resourceTemplates }]) =>
            [...resources, ...resourceTemplates].map((resource) =>
              resourceFromMCPResource(client, resource),
            ),
          )
      : undefined;

    return new MCPAgent({
      name: client.getServerVersion()?.name,
      client,
      tools,
      prompts,
      resources,
    });
  }

  constructor(options: MCPAgentOptions) {
    super(options);

    this.client = options.client;
    if (options.prompts?.length) this.prompts.push(...options.prompts);
    if (options.resources?.length) this.resources.push(...options.resources);
  }

  private client: Client;

  readonly prompts = createAccessorArray<MCPPrompt>([], (arr, name) =>
    arr.find((i) => i.name === name),
  );

  readonly resources = createAccessorArray<MCPResource>([], (arr, name) =>
    arr.find((i) => i.name === name),
  );

  get isCallable(): boolean {
    return false;
  }

  async process(_input: Message, _context?: Context): Promise<Message> {
    throw new Error("Method not implemented.");
  }

  override async shutdown() {
    super.shutdown();
    await this.client.close();
  }
}

export interface MCPToolBaseOptions<I extends Message, O extends Message>
  extends AgentOptions<I, O> {
  client: Client;
}

export abstract class MCPBase<I extends Message, O extends Message> extends Agent<I, O> {
  constructor(options: MCPToolBaseOptions<I, O>) {
    super(options);
    this.client = options.client;
  }

  protected client: Client;

  protected get mcpServer() {
    return getMCPServerName(this.client);
  }
}

export class MCPTool extends MCPBase<Message, CallToolResult> {
  async process(input: Message): Promise<CallToolResult> {
    const result = await debug.spinner(
      this.client.callTool({ name: this.name, arguments: input }),
      `Call tool ${this.name} from ${this.mcpServer}`,
      (output) => debug("input: %O\noutput: %O", input, output),
    );

    return result as CallToolResult;
  }
}

export interface MCPPromptInput extends Message {
  [key: string]: string;
}

export class MCPPrompt extends MCPBase<MCPPromptInput, GetPromptResult> {
  async process(input: MCPPromptInput): Promise<GetPromptResult> {
    const result = await debug.spinner(
      this.client.getPrompt({ name: this.name, arguments: input }),
      `Get prompt ${this.name} from ${this.mcpServer}`,
      (output) => debug("input: %O\noutput: %O", input, output),
    );

    return result;
  }
}

export interface MCPResourceOptions extends MCPToolBaseOptions<MCPPromptInput, ReadResourceResult> {
  uri: string;
}

export class MCPResource extends MCPBase<MCPPromptInput, ReadResourceResult> {
  constructor(options: MCPResourceOptions) {
    super(options);
    this.uri = options.uri;
  }

  uri: string;

  async process(input: MCPPromptInput): Promise<ReadResourceResult> {
    const uri = new UriTemplate(this.uri).expand(input);

    const result = await debug.spinner(
      this.client.readResource({ uri }),
      `Read resource ${this.name} from ${this.mcpServer}`,
      (output) => debug("input: %O\noutput: %O", input, output),
    );

    return result;
  }
}

function getMCPServerName(client: Client): string | undefined {
  const info = client.getServerVersion();
  if (!info) return undefined;

  const { name, version } = info;
  return `${name}@${version}`;
}

const mcpAgentOptionsSchema: ZodType<
  MCPAgentOptions | SSEServerParameters | StdioServerParameters
> = z.union([
  z.object({
    client: z.instanceof(Client),
    prompts: z.array(z.instanceof(MCPPrompt)).optional(),
    resources: z.array(z.instanceof(MCPResource)).optional(),
  }),
  z.object({
    url: z.string(),
  }),
  z.object({
    command: z.string(),
    args: z.array(z.string()).optional(),
    env: z.record(z.string()).optional(),
  }),
]);
