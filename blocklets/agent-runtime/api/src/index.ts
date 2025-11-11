/** biome-ignore-all lint/style/noNonNullAssertion: <!> */
import "express-async-errors";

import path from "node:path";
import { AIGNEObserver } from "@aigne/observability-api";
import { call, getComponentMountPoint } from "@blocklet/sdk/lib/component";
import Config from "@blocklet/sdk/lib/config";
import { fallback } from "@blocklet/sdk/lib/middlewares/fallback";
import { sessionMiddleware } from "@blocklet/sdk/lib/middlewares/session";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv-flow";
import express, {
  type ErrorRequestHandler,
  type NextFunction,
  type Request,
  type Response,
} from "express";

import logger from "./libs/logger.js";
import routes from "./routes/index.js";

dotenv.config();

const { name, version } = require("../../package.json");

export const app = express();

const engineComponentId = Config.env.componentDid;
const isProduction =
  process.env.NODE_ENV === "production" || process.env.ABT_NODE_SERVICE_ENV === "production";

const MAX_REQUEST_BODY_SIZE = process.env.MAX_REQUEST_BODY_SIZE || "30 mb";

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

app.set("trust proxy", true);
app.use(cookieParser());

app.use(express.json({ limit: MAX_REQUEST_BODY_SIZE }));
app.use(express.urlencoded({ extended: true, limit: MAX_REQUEST_BODY_SIZE }));

app.use(cors());

app.use((req: Request, res: Response, next: NextFunction) => {
  const raw = String(req.headers["x-blocklet-component-id"] || "");
  const componentId = raw.split("/").pop();

  if (engineComponentId === componentId) {
    if (isProduction) {
      res
        .status(400)
        .send(
          "Agent Runtime is up and running.\nBut got nothing to show here.\nShould be used together with agent blocklets.",
        );
      return;
    }
  }

  return next();
});

const router = express.Router();
router.use("/api", sessionMiddleware({ accessKey: true }) as any, routes);
app.use(router);

if (isProduction) {
  const staticDir = path.resolve(process.env.BLOCKLET_APP_DIR!, "dist");
  app.use(express.static(staticDir, { maxAge: "30d", index: false }));
  app.use(fallback("index.html", { root: staticDir }) as any);

  app.use(<ErrorRequestHandler>((err, _req, res) => {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ success: false, error: message });
  }));
}

const port = parseInt(process.env.BLOCKLET_PORT!, 10);

export const server = app.listen(port, (err?: any) => {
  if (err) throw err;
  logger.info(`> ${name} v${version} ready on ${port}`);
});
