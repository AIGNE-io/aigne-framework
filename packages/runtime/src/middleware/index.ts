/// <reference path="../blocklet.d.ts" />

import { auth, session } from "@blocklet/sdk/lib/middlewares";
import compression from "compression";
import { Router } from "express";
import Joi from "joi";

import { logger } from "@aigne/core";
import { DEFAULT_SESSION_ID } from "../constants";
import type { AIGNERuntime } from "../runtime";
import { tryParse } from "../utils/try-parse";
import { runAgentWithStreaming } from "./agent";

export function createMiddleware(runtime: AIGNERuntime): Router {
  const router = Router();

  const runAgentPayloadSchema = Joi.object<{
    input?: { [key: string]: any };
    options?: { sessionId?: string; stream?: boolean };
  }>({
    input: Joi.object(),
    options: Joi.object({
      sessionId: Joi.string().empty(["", null]),
      stream: Joi.boolean(),
    }),
  });

  router.post(
    `/api/aigne/${runtime.id}/agents/:agentId/run`,
    compression(),
    session(),
    auth(),
    async (req, res) => {
      const { agentId } = req.params;

      try {
        if (!agentId) throw new Error("agentId are required");

        const userId = req.user?.did;
        if (!userId) throw new Error("Unauthorized");

        const {
          input = {},
          options: { sessionId = DEFAULT_SESSION_ID, ...options } = {},
        } = await runAgentPayloadSchema.validateAsync(req.body, {
          stripUnknown: true,
        });

        const scope = runtime.copy({
          state: {
            userId,
            sessionId,
            user: req.user,
          },
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
          projectId: runtime.id,
          agentId,
          error,
        });
      }
    },
  );

  router.get(`/api/aigne/${runtime.id}/agents/:agentId/definition`, async (req, res) => {
    const { agentId } = req.params;

    try {
      if (!agentId) throw new Error("agentId are required");

      const agent = await runtime
        .copy({ state: { userId: req.user?.did, user: req.user } })
        .resolve(agentId);

      res.json(agent.definition);
    } catch (error) {
      res.status(500).json({ error: { message: error.message } });
      logger.error("AIGNE Middleware: get agent definition error", {
        projectId: runtime.id,
        agentId,
        error,
      });
    }
  });

  const getHistoryQuerySchema = Joi.object<{
    sessionId?: string;
    k?: number;
    filter?: { [key: string]: any };
    sort?: { field: string; direction: "asc" | "desc" };
  }>({
    sessionId: Joi.string().empty(["", null]),
    k: Joi.number().min(1).max(100).default(10),
    filter: Joi.object().pattern(Joi.string(), Joi.any()),
    sort: Joi.object({
      field: Joi.string().required(),
      direction: Joi.string().valid("asc", "desc").required(),
    }),
  });

  router.get(
    `/api/aigne/${runtime.id}/agents/:agentId/histories`,
    session(),
    auth(),
    async (req, res) => {
      const { agentId } = req.params;

      try {
        if (!agentId) throw new Error("agentId are required");

        const userId = req.user?.did;
        if (!userId) throw new Error("Unauthorized");

        const { sessionId, k, sort, filter } = await getHistoryQuerySchema.validateAsync(
          { ...req.query, sort: tryParse(req.query.sort) },
          { stripUnknown: true },
        );

        const data = await runtime.historyManager?.filter({
          userId,
          sessionId,
          agentId,
          sort,
          filter,
          k,
        });

        res.json({ results: data?.results });
      } catch (error) {
        res.status(500).json({ error: { message: error.message } });
        logger.error("AIGNE Middleware: get agent history error", {
          projectId: runtime.id,
          agentId,
          error,
        });
      }
    },
  );

  return router;
}
