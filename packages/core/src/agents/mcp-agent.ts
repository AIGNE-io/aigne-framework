import { createStdioClientTransport } from "@aigne/platform-helpers/mcp/stdio-client-transport.js";
import { Client, type ClientOptions } from "@modelcontextprotocol/sdk/client/index.js";
import {
  SSEClientTransport,
  type SSEClientTransportOptions,
} from "@modelcontextprotocol/sdk/client/sse.js";
import type { StdioServerParameters } from "@modelcontextprotocol/sdk/client/stdio.js";
import {
  StreamableHTTPClientTransport,
  type StreamableHTTPClientTransportOptions,
} from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { RequestOptions } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { UriTemplate } from "@modelcontextprotocol/sdk/shared/uriTemplate.js";
import type {
  CallToolResult,
  GetPromptResult,
  Implementation,
  ReadResourceResult,
  Request,
} from "@modelcontextprotocol/sdk/types.js";
import pRetry from "p-retry";
import { type ZodType, z } from "zod";
import { logger } from "../utils/logger.js";
import {
  promptFromMCPPrompt,
  resourceFromMCPResource,
  toolFromMCPTool,
} from "../utils/mcp-utils.js";
import { nodejs } from "../utils/nodejs.js";
import { type PromiseOrValue, checkArguments, createAccessorArray } from "../utils/type-utils.js";
import { Agent, type AgentInvokeOptions, type AgentOptions, type Message } from "./agent.js";

const MCP_AGENT_CLIENT_NAME = "AIGNE/MCPAgent";
const MCP_AGENT_CLIENT_VERSION = "1.10.0"; // This should match the version in package.json
const DEFAULT_MAX_RECONNECTS = 10;
const DEFAULT_TIMEOUT = () =>
  z.coerce
    .number()
    .int()
    .min(0)
    .safeParse(nodejs.env.MCP_TIMEOUT || nodejs.env.TIMEOUT).data || 60e3;

export interface MCPAgentOptions extends AgentOptions {
  client: Client;

  prompts?: MCPPrompt[];

  resources?: MCPResource[];
}

export type MCPServerOptions = SSEServerParameters | StdioServerParameters;

export type SSEServerParameters = {
  url: string;

  /**
   * Whether to use the StreamableHTTPClientTransport instead of the SSEClientTransport.
   * @default "sse"
   */
  transport?: "sse" | "streamableHttp";

  /**
   * Additional options to pass to the SSEClientTransport or StreamableHTTPClientTransport.
   */
  opts?: SSEClientTransportOptions | StreamableHTTPClientTransportOptions;
  /**
   * The timeout for requests to the server, in milliseconds.
   * @default 60000
   */
  timeout?: number;
  /**
   * Whether to automatically reconnect to the server if the connection is lost.
   * @default 10 set to 0 to disable automatic reconnection
   */
  maxReconnects?: number;
  /**
   * A function that determines whether to reconnect to the server based on the error.
   * default to reconnect on all errors.
   */
  shouldReconnect?: (error: Error) => boolean;
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

/**
 * MCPAgent is a specialized agent for interacting with MCP (Model Context Protocol) servers.
 * It provides the ability to connect to remote MCP servers using different transport methods,
 * and access their tools, prompts, and resources.
 *
 * MCPAgent serves as a bridge between your application and MCP servers, allowing you to:
 * - Connect to MCP servers over HTTP/SSE or stdio
 * - Access server tools as agent skills
 * - Utilize server prompts and resources
 * - Manage server connections with automatic reconnection
 *
 * @example
 * Here's an example of creating an MCPAgent with SSE transport:
 * {@includeCode ../../test/agents/mcp-agent.test.ts#example-mcp-agent-from-sse}
 */
export class MCPAgent extends Agent {
  /**
   * Create an MCPAgent from a connection to an SSE server.
   *
   * This overload establishes a Server-Sent Events connection to an MCP server
   * and automatically discovers its available tools, prompts, and resources.
   *
   * @param options SSE server connection parameters
   * @returns Promise resolving to a new MCPAgent instance
   *
   * @example
   * Here's an example of creating an MCPAgent with StreamableHTTP transport:
   * {@includeCode ../../test/agents/mcp-agent.test.ts#example-mcp-agent-from-streamable-http}
   *
   * @example
   * Here's an example of creating an MCPAgent with SSE transport:
   * {@includeCode ../../test/agents/mcp-agent.test.ts#example-mcp-agent-from-sse}
   *
   * @example
   * Here's an example of creating an MCPAgent with Stdio transport:
   * {@includeCode ../../test/agents/mcp-agent.test.ts#example-mcp-agent-from-stdio}
   */
  static from(options: MCPServerOptions): Promise<MCPAgent>;

  /**
   * Create an MCPAgent from a pre-configured MCP client.
   *
   * This overload uses an existing MCP client instance and optionally
   * pre-defined prompts and resources.
   *
   * @param options MCPAgent configuration with client instance
   * @returns A new MCPAgent instance
   *
   * @example
   * Here's an example of creating an MCPAgent with a client instance:
   * {@includeCode ../../test/agents/mcp-agent.test.ts#example-mcp-agent-direct}
   */
  static from(options: MCPAgentOptions): MCPAgent;

  static from(options: MCPAgentOptions | MCPServerOptions): MCPAgent | Promise<MCPAgent> {
    checkArguments("MCPAgent.from", mcpAgentOptionsSchema, options);

    if (isSSEServerParameters(options)) {
      const transport = () => {
        if (options.transport === "streamableHttp") {
          return new StreamableHTTPClientTransport(new URL(options.url), options.opts);
        }
        return new SSEClientTransport(new URL(options.url), options.opts);
      };

      return MCPAgent.fromTransport(transport, options);
    }

    if (isStdioServerParameters(options)) {
      const transport = async () => createStdioClientTransport(options);
      return MCPAgent.fromTransport(transport, options);
    }

    return new MCPAgent(options);
  }

  private static async fromTransport(
    transportCreator: () => PromiseOrValue<Transport>,
    options: MCPAgentOptions | MCPServerOptions,
  ): Promise<MCPAgent> {
    const client = new ClientWithReconnect(
      {
        name: MCP_AGENT_CLIENT_NAME,
        version: MCP_AGENT_CLIENT_VERSION,
      },
      undefined,
      isSSEServerParameters(options) ? { transportCreator, ...options } : undefined,
    );

    const transport = await transportCreator();

    logger.debug(`Connecting to MCP server: ${getMCPServerString(options)}`);
    await client.connect(transport);

    const mcpServer = getMCPServerName(client);

    const {
      tools: isToolsAvailable,
      prompts: isPromptsAvailable,
      resources: isResourcesAvailable,
    } = client.getServerCapabilities() ?? {};

    logger.debug(`Listing tools from ${mcpServer}`);
    const skills = isToolsAvailable
      ? await client.listTools().then(({ tools }) => {
          logger.debug(
            `Listing tools from ${mcpServer} completed %O`,
            tools?.map((i) => i.name),
          );
          return tools.map((tool) => toolFromMCPTool(tool, { client }));
        })
      : undefined;

    logger.debug(`Listing prompts from ${mcpServer}`);
    const prompts = isPromptsAvailable
      ? await client.listPrompts().then(({ prompts }) => {
          logger.debug(
            `Listing prompts from ${mcpServer} completed %O`,
            prompts?.map((i) => i.name),
          );
          return prompts.map((prompt) => promptFromMCPPrompt(prompt, { client }));
        })
      : undefined;

    logger.debug(`Listing resources from ${mcpServer}`);
    // TODO: should conditionally call listResourceTemplates based on the server capabilities
    // but the capability is not correct in the current SDK version
    const resources = isResourcesAvailable
      ? await Promise.all([
          client.listResources().catch(() => ({ resources: [] })),
          client.listResourceTemplates().catch(() => ({ resourceTemplates: [] })),
        ]).then(([{ resources }, { resourceTemplates }]) => {
          const result = [...resources, ...resourceTemplates].map((resource) =>
            resourceFromMCPResource(resource, { client }),
          );
          logger.debug(
            `Listing resources from ${mcpServer} completed %O`,
            result.map((i) => i.name),
          );
          return result;
        })
      : undefined;

    return new MCPAgent({
      name: client.getServerVersion()?.name,
      client,
      skills,
      prompts,
      resources,
    });
  }

  /**
   * Create an MCPAgent instance directly with a configured client.
   *
   * @param options MCPAgent configuration options, including client instance
   *
   * @example
   * Here's an example of creating an MCPAgent with an existing client:
   * {@includeCode ../../test/agents/mcp-agent.test.ts#example-mcp-agent-direct}
   */
  constructor(options: MCPAgentOptions) {
    super(options);

    this.client = options.client;
    if (options.prompts?.length) this.prompts.push(...options.prompts);
    if (options.resources?.length) this.resources.push(...options.resources);
  }

  /**
   * The MCP client instance used for communication with the MCP server.
   *
   * This client manages the connection to the MCP server and provides
   * methods for interacting with server-provided functionality.
   */
  client: Client;

  /**
   * Array of MCP prompts available from the connected server.
   *
   * Prompts can be accessed by index or by name.
   *
   * @example
   * Here's an example of accessing prompts:
   * {@includeCode ../../test/agents/mcp-agent.test.ts#example-mcp-agent-prompts}
   */
  readonly prompts = createAccessorArray<MCPPrompt>([], (arr, name) =>
    arr.find((i) => i.name === name),
  );

  /**
   * Array of MCP resources available from the connected server.
   *
   * Resources can be accessed by index or by name.
   *
   * @example
   * Here's an example of accessing resources:
   * {@includeCode ../../test/agents/mcp-agent.test.ts#example-mcp-agent-resources}
   */
  readonly resources = createAccessorArray<MCPResource>([], (arr, name) =>
    arr.find((i) => i.name === name),
  );

  /**
   * Check if the agent is invokable.
   *
   * MCPAgent itself is not directly invokable as it acts as a container
   * for tools, prompts, and resources. Always returns false.
   */
  get isInvokable(): boolean {
    return false;
  }

  /**
   * Process method required by Agent interface.
   *
   * Since MCPAgent itself is not directly invokable, this method
   * throws an error if called.
   *
   * @param _input Input message (unused)
   * @param _options AgentInvokeOptions (unused)
   * @throws Error This method always throws an error since MCPAgent is not directly invokable
   */
  async process(_input: Message, _options: AgentInvokeOptions): Promise<Message> {
    throw new Error("Method not implemented.");
  }

  /**
   * Shut down the agent and close the MCP connection.
   *
   * This method cleans up resources and closes the connection
   * to the MCP server.
   *
   * @example
   * Here's an example of shutting down an MCPAgent:
   * {@includeCode ../../test/agents/mcp-agent.test.ts#example-mcp-agent-shutdown}
   *
   * @example
   * Here's an example of shutting down an MCPAgent by using statement:
   * {@includeCode ../../test/agents/mcp-agent.test.ts#example-mcp-agent-shutdown-by-using}
   */
  override async shutdown() {
    await super.shutdown();
    await this.client.close();
  }
}

export interface ClientWithReconnectOptions {
  transportCreator?: () => PromiseOrValue<Transport>;
  timeout?: number;
  maxReconnects?: number;
  shouldReconnect?: (error: Error) => boolean;
}

class ClientWithReconnect extends Client {
  constructor(
    info: Implementation,
    options?: ClientOptions,
    private reconnectOptions?: ClientWithReconnectOptions,
  ) {
    super(info, options);
  }

  private shouldReconnect(error: Error): boolean {
    const { transportCreator, shouldReconnect, maxReconnects } = this.reconnectOptions || {};

    if (!transportCreator || maxReconnects === 0) return false;
    if (!shouldReconnect) return true; // default to reconnect on all errors

    return shouldReconnect(error);
  }

  private async reconnect() {
    const transportCreator = this.reconnectOptions?.transportCreator;
    if (!transportCreator) throw new Error("reconnect requires a transportCreator");

    await pRetry(
      async () => {
        await this.close();
        await this.connect(await transportCreator(), {
          timeout: this.reconnectOptions?.timeout ?? DEFAULT_TIMEOUT(),
        });
      },
      {
        retries: this.reconnectOptions?.maxReconnects ?? DEFAULT_MAX_RECONNECTS,
        shouldRetry: this.shouldReconnect,
        onFailedAttempt: (error) => logger.error("Reconnect attempt failed: %O", error),
      },
    );
  }

  override async request<T extends ZodType<object>>(
    request: Request,
    resultSchema: T,
    options?: RequestOptions,
  ): Promise<z.infer<T>> {
    const mergedOptions: RequestOptions = {
      ...options,
      timeout: options?.timeout ?? DEFAULT_TIMEOUT(),
    };

    try {
      return await super.request(request, resultSchema, mergedOptions);
    } catch (error) {
      if (this.shouldReconnect(error)) {
        logger.error("Error occurred, reconnecting to MCP server: %O", error);
        await this.reconnect();
        return await super.request(request, resultSchema, mergedOptions);
      }
      throw error;
    }
  }
}

export interface MCPBaseOptions<I extends Message = Message, O extends Message = Message>
  extends AgentOptions<I, O> {
  client: ClientWithReconnect;
}

export abstract class MCPBase<I extends Message, O extends Message> extends Agent<I, O> {
  constructor(options: MCPBaseOptions<I, O>) {
    super(options);
    this.client = options.client;
  }

  protected client: ClientWithReconnect;
}

export class MCPTool extends MCPBase<Message, CallToolResult> {
  async process(input: Message): Promise<CallToolResult> {
    const result = await this.client.callTool({ name: this.name, arguments: input });

    return result as CallToolResult;
  }
}

export interface MCPPromptInput extends Message {
  [key: string]: string;
}

export class MCPPrompt extends MCPBase<MCPPromptInput, GetPromptResult> {
  async process(input: MCPPromptInput): Promise<GetPromptResult> {
    const result = await this.client.getPrompt({ name: this.name, arguments: input });

    return result;
  }
}

export interface MCPResourceOptions extends MCPBaseOptions<MCPPromptInput, ReadResourceResult> {
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

    const result = await this.client.readResource({ uri });

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
    opts: z.object({}).optional(),
    timeout: z.number().optional(),
    maxReconnects: z.number().optional(),
    shouldReconnect: z.function().args(z.instanceof(Error)).returns(z.boolean()).optional(),
  }),
  z.object({
    command: z.string(),
    args: z.array(z.string()).optional(),
    env: z.record(z.string()).optional(),
  }),
]);
