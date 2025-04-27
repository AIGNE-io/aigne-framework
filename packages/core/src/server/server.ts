import { IncomingMessage, ServerResponse } from "node:http";
import contentType from "content-type";
import getRawBody from "raw-body";
import { z } from "zod";
import type { AIGNE } from "../aigne/aigne.js";
import { AgentResponseStreamSSE } from "../utils/event-stream.js";
import { readableStreamToAsyncIterator } from "../utils/stream-utils.js";
import { checkArguments, isRecord, tryOrThrow } from "../utils/type-utils.js";
import { ServerError } from "./error.js";

const DEFAULT_MAXIMUM_BODY_SIZE = "4mb";

export const invokePayloadSchema = z.object({
  agent: z.string(),
  input: z.record(z.string(), z.unknown()),
  options: z
    .object({
      streaming: z.boolean().nullish(),
    })
    .nullish(),
});

export interface AIGNEServerOptions {
  /**
   * Maximum body size for the request.
   * Only used when the request is a Node.js IncomingMessage and no `body` property is present.
   * @default "4mb"
   */
  maximumBodySize?: string;
}

export class AIGNEServer {
  constructor(
    public engine: AIGNE,
    public options?: AIGNEServerOptions,
  ) {}

  /**
   * Invoke the agent with the given input.
   * @param request - The request object, which can be a parsed JSON object, a Fetch API Request object, or a Node.js IncomingMessage object.
   * @returns The web standard response, you can return it directly in supported frameworks like hono.
   */
  async invoke(request: Record<string, unknown> | Request | IncomingMessage): Promise<Response>;
  /**
   * Invoke the agent with the given input, and write the SSE response to the Node.js ServerResponse.
   * @param request - The request object, which can be a parsed JSON object, a Fetch API Request object, or a Node.js IncomingMessage object.
   * @param response - The Node.js ServerResponse object to write the SSE response to.
   */
  async invoke(
    request: Record<string, unknown> | Request | IncomingMessage,
    response: ServerResponse,
  ): Promise<void>;
  async invoke(
    request: Record<string, unknown> | Request | IncomingMessage,
    response?: ServerResponse,
  ): Promise<Response | void> {
    const result = await this._invoke(request);

    if (response instanceof ServerResponse) {
      await this._writeResponse(result, response);
      return;
    }

    return result;
  }

  async _invoke(request: Record<string, unknown> | Request | IncomingMessage): Promise<Response> {
    const { engine } = this;

    try {
      const payload = await this._prepareInput(request);

      const {
        agent: agentName,
        input,
        options,
      } = tryOrThrow(
        () => checkArguments(`Invoke agent ${payload.agent}`, invokePayloadSchema, payload),
        (error) => new ServerError(400, error.message),
      );

      const agent = engine.agents[agentName];
      if (!agent) throw new ServerError(404, `Agent ${agentName} not found`);

      if (!options?.streaming) {
        const result = await engine.invoke(agent, input);
        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json" },
        });
      }

      const stream = await engine.invoke(agent, input, { streaming: true });

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

  async _writeResponse(response: Response, res: ServerResponse): Promise<void> {
    try {
      res.writeHead(response.status, response.headers.toJSON());
      res.flushHeaders();

      if (!response.body) throw new Error("Response body is empty");

      for await (const chunk of readableStreamToAsyncIterator(response.body)) {
        res.write(chunk);

        // Support for express with compression middleware
        if ("flush" in res && typeof res.flush === "function") {
          res.flush();
        }
      }
    } catch (error) {
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
