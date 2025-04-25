import compression from "compression";
import express, { json, type RequestHandler } from "express";
import { z } from "zod";
import type { ExecutionEngine } from "../execution-engine/execution-engine.js";
import { readableStreamToAsyncIterator } from "../utils/stream-utils.js";
import { checkArguments, tryOrThrow } from "../utils/type-utils.js";
import { HttpError } from "./error.js";

export function createExpressMiddleware(engine: ExecutionEngine): RequestHandler {
  const router = express.Router();

  const bodySchema = z.object({
    input: z.record(z.string(), z.unknown()),
    options: z
      .object({
        streaming: z.boolean().nullish(),
      })
      .nullish(),
  });

  router.post("/agents/:agent/call", json(), compression(), async (req, res) => {
    try {
      const { agent: agentName } = req.params;
      if (!agentName) throw new HttpError(400, "Agent name is required");

      const agent = engine.agents[agentName];
      if (!agent) throw new HttpError(404, `Agent ${agentName} not found`);

      const { input, options } = tryOrThrow(
        () => checkArguments(`Call agent ${agentName}`, bodySchema, req.body),
        (error) => new HttpError(400, error.message),
      );

      if (!options?.streaming) {
        const result = await engine.call(agent, input);
        res.json({ ...result });
        return;
      }

      const stream = await engine.call(agent, input, { streaming: true });

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");

      try {
        for await (const chunk of readableStreamToAsyncIterator(stream)) {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
          res.flush();
        }
      } catch (error) {
        res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
        res.flush();
      } finally {
        res.end();
      }
    } catch (error) {
      res
        .status(error instanceof HttpError ? error.status : 500)
        .json({ error: { message: error.message } });
    }
  });

  return router;
}
