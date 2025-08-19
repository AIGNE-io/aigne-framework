import "express-async-errors";

import { AIGNEObserver } from "@aigne/observability-api";
import { call, getComponentMountPoint } from "@blocklet/sdk/lib/component";
import Config from "@blocklet/sdk/lib/config";
import fallback from "@blocklet/sdk/lib/middlewares/fallback";
import sessionMiddleware from "@blocklet/sdk/lib/middlewares/session";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv-flow";
import express, { type ErrorRequestHandler } from "express";
import path from "path";

import logger from "./libs/logger.js";
import routes from "./routes/index.js";

const AuthService = require("@blocklet/sdk/service/auth");

dotenv.config();

const { name, version } = require("../../package.json");

export const app = express();

const blocklet = new AuthService();
const COMPONENT_CACHE_TTL = 1 * 60 * 1000; // 1 minute
const componentCache = new Map();
const engineComponentId = Config.env.componentDid;
const user = sessionMiddleware({ accessKey: true });

const OBSERVABILITY_DID = "z2qa2GCqPJkufzqF98D8o7PWHrRRSHpYkNhEh";
AIGNEObserver.setExportFn(async (spans) => {
  if (!getComponentMountPoint(OBSERVABILITY_DID)) {
    logger.warn("Please install the Observability blocklet to enable tracing agents");
    return;
  }

  logger.info("Sending trace tree to Observability blocklet", { spans });

  await call({
    name: OBSERVABILITY_DID,
    method: "POST",
    path: "/api/trace/tree",
    data: (spans || []).map((x) => {
      return { ...x, componentId: "z2qa6yt75HHQL3cS4ao7j2aqVodExoBAN7xeS" };
    }),
  }).catch((err) => {
    logger.error("Failed to send trace tree to Observability blocklet", err);
  });
});

const debug = true;
app.use(async (req, res, next) => {
  const raw = String(req.headers["x-blocklet-component-id"] || "");
  const componentId = raw.split("/").pop();
  if (engineComponentId === componentId) {
    if (!debug) {
      return res
        .status(400)
        .send(
          "Agent Runtime is up and running.\nBut got nothing to show here.\nShould be used together with agent blocklets.",
        );
    }
  }

  if (!componentId) {
    return res.status(400).send("Agent Runtime: Bad Request");
  }

  const cachedChecker = componentCache.get(componentId);
  if (!cachedChecker || Date.now() - cachedChecker.timestamp > COMPONENT_CACHE_TTL) {
    const component = await blocklet.getComponent(componentId);
    componentCache.set(componentId, {
      component,
      timestamp: Date.now(),
    });
  }

  const cached = componentCache.get(componentId);
  const { component } = cached;
  if (!component) {
    return res.status(404).send("Static Server: Component Not Found");
  }

  const env = component.environments.find((x: { key: string }) => x.key === "BLOCKLET_APP_DIR");
  if (!env) {
    return res.status(404).send("Static Server: Component Not Valid");
  }

  req.mainDir = component.meta.main
    ? path.join(env.value, component.meta.main)
    : path.resolve(env.value);
  req.component = component;
  if (process.env.DOCKER_HOST_SERVER_DIR && process.env.DOCKER_CONTAINER_SERVER_DIR) {
    req.mainDir = req.mainDir.replace(
      new RegExp(process.env.DOCKER_HOST_SERVER_DIR, "g"),
      process.env.DOCKER_CONTAINER_SERVER_DIR,
    );
  }
  logger.warn("serve static from", req.mainDir);
  return next();
});

app.set("trust proxy", true);
app.use(cookieParser());
app.use(express.json({ limit: "1 mb" }));
app.use(express.urlencoded({ extended: true, limit: "1 mb" }));
app.use(cors());

const router = express.Router();
router.use("/api", user as any, routes);
app.use(router);

const isProduction =
  process.env.NODE_ENV === "production" || process.env.ABT_NODE_SERVICE_ENV === "production";

if (isProduction) {
  logger.info("process.env.BLOCKLET_APP_DIR", process.env.BLOCKLET_APP_DIR);
  const staticDir = path.resolve(process.env.BLOCKLET_APP_DIR!, "dist");
  app.use(express.static(staticDir, { maxAge: "30d", index: false }));
  app.use(fallback("index.html", { root: staticDir }) as any);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use(<ErrorRequestHandler>((err, _req, res, _next) => {
    // eslint-disable-next-line prettier/prettier
    logger.error(err.stack);
    res.status(500).send("Something broke!");
  }));
}

const port = parseInt(process.env.BLOCKLET_PORT!, 10);

export const server = app.listen(port, (err?: any) => {
  if (err) throw err;
  logger.info(`> ${name} v${version} ready on ${port}`);
});
