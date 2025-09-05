import { IncomingMessage, ServerResponse } from "node:http";
import type { AIGNE, InvokeOptions, UserContext } from "@aigne/core";
import { AgentResponseStreamSSE } from "@aigne/core/utils/event-stream.js";
import { checkArguments, isRecord, tryOrThrow } from "@aigne/core/utils/type-utils.js";
import contentType from "content-type";
import getRawBody from "raw-body";
import { z } from "zod";
import { ChatModelName } from "../constants.js";
import { ServerError } from "./error.js";

/**
 * Default maximum allowed size for request bodies when parsing raw HTTP requests.
 * This limits the amount of data that can be uploaded to protect against denial of service attacks.
 * Can be overridden via AIGNEServerOptions.
 * @internal
 */
const DEFAULT_MAXIMUM_BODY_SIZE = "4mb";

/**
 * Schema for validating agent invocation payloads.
 * Defines the expected structure for requests to invoke an agent.
 *
 * @hidden
 */
export const invokePayloadSchema = z.object({
  agent: z.string(),
  input: z.record(z.string(), z.unknown()),
  options: z
    .object({
      streaming: z
        .boolean()
        .nullish()
        .transform((v) => v ?? undefined),
      returnProgressChunks: z
        .boolean()
        .nullish()
        .transform((v) => v ?? undefined),
      userContext: z
        .record(z.string(), z.unknown())
        .nullish()
        .transform((v) => v ?? undefined),
      memories: z
        .array(z.object({ content: z.custom<object>() }))
        .nullish()
        .transform((v) => v ?? undefined),
    })
    .nullish()
    .transform((v) => v ?? undefined),
});

/**
 * Configuration options for the AIGNEHTTPServer.
 * These options control various aspects of server behavior including
 * request parsing, payload limits, and response handling.
 */
export interface AIGNEHTTPServerOptions {
  /**
   * Maximum body size for incoming HTTP requests.
   * This controls the upper limit of request payload size when parsing raw HTTP requests.
   * Only used when working with Node.js IncomingMessage objects that don't already have
   * a pre-parsed body property (e.g., when not using Express middleware).
   *
   * @default "4mb"
   */
  maximumBodySize?: string;
}

export interface AIGNEHTTPServerInvokeOptions<U extends UserContext = UserContext>
  extends Pick<InvokeOptions<U>, "returnProgressChunks" | "userContext" | "memories" | "hooks"> {
  onError?: (error: Error) => void;
}

/**
 * AIGNEHTTPServer provides HTTP API access to AIGNE capabilities.
 * It handles requests to invoke agents, manages response streaming,
 * and supports multiple HTTP server frameworks including Node.js http,
 * Express, and Fetch API compatible environments.
 *
 * @example
 * Here's a simple example of how to use AIGNEServer with express:
 * {@includeCode ../../test/http-server/http-server.test.ts#example-aigne-server-express}
 *
 * @example
 * Here's an example of how to use AIGNEServer with Hono:
 * {@includeCode ../../test/http-server/http-server.test.ts#example-aigne-server-hono}
 */
export class AIGNEHTTPServer {
  /**
   * Creates a new AIGNEServer instance.
   *
   * @param aigne - The AIGNE instance that will process agent invocations
   * @param options - Configuration options for the server
   */
  constructor(
    public aigne: AIGNE,
    public options?: AIGNEHTTPServerOptions,
  ) {}

  /**
   * Invokes an agent with the provided input and returns a standard web Response.
   * This method serves as the primary API endpoint for agent invocation.
   *
   * The request can be provided in various formats to support different integration scenarios:
   * - As a pre-parsed JavaScript object
   * - As a Fetch API Request instance (for modern web frameworks)
   * - As a Node.js IncomingMessage (for Express, Fastify, etc.)
   *
   * @param request - The agent invocation request in any supported format
   * @returns A web standard Response object that can be returned directly in frameworks
   *          like Hono, Next.js, or any Fetch API compatible environment
   *
   * @example
   * Here's a simple example of how to use AIGNEServer with Hono:
   * {@includeCode ../../test/http-server/http-server.test.ts#example-aigne-server-hono}
   */
  async invoke(
    request: Record<string, unknown> | Request | IncomingMessage,
    options?: ServerResponse | AIGNEHTTPServerInvokeOptions,
  ): Promise<Response>;
  /**
   * Invokes an agent with the provided input and streams the response to a Node.js ServerResponse.
   * This overload is specifically designed for Node.js HTTP server environments.
   *
   * The method handles both regular JSON responses and streaming Server-Sent Events (SSE)
   * responses based on the options specified in the request.
   *
   * @param request - The agent invocation request in any supported format
   * @param response - The Node.js ServerResponse object to write the response to
   *
   * @example
   * Here's a simple example of how to use AIGNEServer with express:
   * {@includeCode ../../test/http-server/http-server.test.ts#example-aigne-server-express}
   */
  async invoke(
    request: Record<string, unknown> | Request | IncomingMessage,
    response: ServerResponse,
    options?: AIGNEHTTPServerInvokeOptions,
  ): Promise<void>;
  async invoke(
    request: Record<string, unknown> | Request | IncomingMessage,
    response?: ServerResponse | AIGNEHTTPServerInvokeOptions,
    options?: AIGNEHTTPServerInvokeOptions,
  ): Promise<Response | void> {
    const opts = !(response instanceof ServerResponse) ? options || response : options;

    const result = await this._invoke(request, {
      userContext: opts?.userContext,
      memories: opts?.memories,
      hooks: opts?.hooks,
    });

    if (response instanceof ServerResponse) {
      await this._writeResponse(result, response, { onError: opts?.onError });
      return;
    }

    return result;
  }

  /**
   * Internal method that handles the core logic of processing an agent invocation request.
   * Validates the request payload, finds the requested agent, and processes the invocation
   * with either streaming or non-streaming response handling.
   *
   * @param request - The parsed or raw request to process
   * @param options - Additional options for the invocation, such as user context and memories
   * @returns A standard Response object with the invocation result
   * @private
   */
  async _invoke(
    request: Record<string, unknown> | Request | IncomingMessage,
    options: AIGNEHTTPServerInvokeOptions = {},
  ): Promise<Response> {
    const { aigne } = this;

    try {
      const payload = await this._prepareInput(request);

      const {
        agent: agentName,
        input,
        options: { streaming, ...opts } = {},
      } = tryOrThrow(
        () => checkArguments(`Invoke agent ${payload.agent}`, invokePayloadSchema, payload),
        (error) => new ServerError(400, error.message),
      );

      const agent = agentName === ChatModelName ? aigne.model : aigne.agents[agentName];
      if (!agent) throw new ServerError(404, `Agent ${agentName} not found`);

      const mergedOptions: InvokeOptions = {
        returnProgressChunks: opts.returnProgressChunks,
        userContext: { ...opts.userContext, ...options.userContext },
        memories: [...(opts.memories ?? []), ...(options.memories ?? [])],
        hooks: options.hooks,
      };

      if (!streaming) {
        const result = await aigne.invoke(agent, input, mergedOptions);
        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json" },
        });
      }

      const stream = await aigne.invoke(agent, input, {
        ...mergedOptions,
        returnActiveAgent: false,
        streaming: true,
      });

      return new Response(new AgentResponseStreamSSE(stream), {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "X-Accel-Buffering": "no",
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: { message: error.message } }), {
        status: error instanceof ServerError ? error.status : 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  /**
   * Prepares and normalizes the input from various request types.
   * Handles different request formats (Node.js IncomingMessage, Fetch API Request,
   * or already parsed object) and extracts the JSON payload.
   *
   * @param request - The request object in any supported format
   * @returns The normalized payload as a JavaScript object
   * @private
   */
  async _prepareInput(
    request: Record<string, unknown> | Request | IncomingMessage,
  ): Promise<Record<string, unknown>> {
    const contentTypeError = new ServerError(
      415,
      "Unsupported Media Type: Content-Type must be application/json",
    );

    if (request instanceof IncomingMessage) {
      // Support for express with json() middleware
      if ("body" in request && typeof request.body === "object") {
        if (!isRecord(request.body)) throw contentTypeError;

        return request.body;
      }

      // Support vanilla nodejs http server
      const maximumBodySize = this.options?.maximumBodySize || DEFAULT_MAXIMUM_BODY_SIZE;

      const ct = request.headers["content-type"];
      if (!ct || !ct.includes("application/json")) throw contentTypeError;

      const parsedCt = contentType.parse(ct);

      const raw = await getRawBody(request, {
        limit: maximumBodySize,
        encoding: parsedCt.parameters.charset ?? "utf-8",
      });

      return tryOrThrow(
        () => JSON.parse(raw.toString()),
        (error) => new ServerError(400, `Parse request body to json error: ${error.message}`),
      );
    }

    if (request instanceof Request) {
      if (!request.headers.get("content-type")?.includes("application/json")) {
        throw contentTypeError;
      }

      return await request.json();
    }

    if (!isRecord(request)) throw contentTypeError;

    return request;
  }

  /**
   * Writes a web standard Response object to a Node.js ServerResponse.
   * Handles streaming responses and error conditions appropriately.
   *
   * @param response - The web standard Response object to write
   * @param res - The Node.js ServerResponse to write to
   * @param callbacks - Optional callbacks for error and end events
   * @private
   */
  async _writeResponse(
    response: Response,
    res: ServerResponse,
    hooks?: {
      onError?: AIGNEHTTPServerInvokeOptions["onError"];
    },
  ): Promise<void> {
    try {
      res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
      res.flushHeaders();

      if (!response.body) throw new Error("Response body is empty");

      for await (const chunk of response.body) {
        res.write(chunk);

        // Support for express with compression middleware
        if ("flush" in res && typeof res.flush === "function") {
          res.flush();
        }
      }
    } catch (error) {
      hooks?.onError?.(error);

      if (!res.headersSent) {
        res.writeHead(error instanceof ServerError ? error.status : 500, {
          "Content-Type": "application/json",
        });
      }
      if (res.writable) {
        res.write(JSON.stringify({ error: { message: error.message } }));
      }
    } finally {
      res.end();
    }
  }
}
