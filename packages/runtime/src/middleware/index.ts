/// <reference path="../blocklet.d.ts" />

import { auth, session } from "@blocklet/sdk/lib/middlewares";
import compression from "compression";
import { Router } from "express";
import Joi from "joi";

import logger from "../logger";
import type { Runtime } from "../runtime";
import { runAgentWithStreaming } from "./agent";

export function createMiddleware(runtime: Runtime): Router {
  const router = Router();

  const runAgentPayloadSchema = Joi.object<{
    input?: { [key: string]: any };
    options?: {
      stream?: boolean;
    };
  }>({
    input: Joi.object(),
    options: Joi.object({
      stream: Joi.boolean(),
    }),
  });

  router.post(
    "/api/aigne/:projectId/agents/:agentId/run",
    compression(),
    session(),
    auth(),
    async (req, res) => {
      const { projectId, agentId } = req.params;

      try {
        if (!projectId || !agentId)
          throw new Error("projectId and agentId are required");
        if (runtime.id !== projectId)
          throw new Error("projectId does not match runtime");

        const scope = runtime.copy({ state: { userId: req.user?.did } });

        const { input = {}, options } =
          await runAgentPayloadSchema.validateAsync(req.body, {
            stripUnknown: true,
          });

        const agent = await scope.resolve(agentId);

        if (options?.stream) {
          await runAgentWithStreaming(res, agent, input);
          return;
        }

        const result = await agent.run(input, options);

        res.json(result);
      } catch (error) {
        res.status(500).json({ error: { message: error.message } });
        logger.error("AIGNE Middleware: run agent error", {
          projectId,
          agentId,
          error,
        });
      }
    },
  );

  router.get(
    "/api/aigne/:projectId/agents/:agentId/definition",
    async (req, res) => {
      const { projectId, agentId } = req.params;

      try {
        if (!projectId || !agentId)
          throw new Error("projectId and agentId are required");
        if (runtime.id !== projectId)
          throw new Error("projectId does not match runtime");

        const agent = await runtime
          .copy({ state: { userId: req.user?.did } })
          .resolve(agentId);

        res.json(agent.definition);
      } catch (error) {
        res.status(500).json({ error: { message: error.message } });
        logger.error("AIGNE Middleware: get agent definition error", {
          projectId,
          agentId,
          error,
        });
      }
    },
  );

  return router;
}
