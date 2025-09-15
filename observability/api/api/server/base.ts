import type { Server } from "node:http";
import { initDatabase } from "@aigne/sqlite";
import chalk from "chalk";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv-flow";
import express, { type NextFunction, type Request, type Response } from "express";
import SSE from "express-sse";
import terminalLink from "terminal-link";
import { ZodError, z } from "zod";
import { migrate } from "./migrate.js";
import settingsRouter from "./routes/settings.js";
import traceRouter from "./routes/trace.js";

const sse = new SSE();

dotenv.config({ silent: true });

const expressMiddlewareSchema =
  z.custom<(req: Request, res: Response, next: NextFunction) => void>();

export interface FileData {
  mimeType: string;
  type: string;
  data: string;
}

export interface ImageData {
  base64: string;
}

function formatFn<T extends z.ZodTypeAny>(schema: T) {
  return z
    .function()
    .args(z.array(schema))
    .returns(z.promise(z.array(schema)))
    .optional();
}

const startServerOptionsSchema = z.object({
  port: z.number().int().positive(),
  dbUrl: z.string().min(1),
  traceTreeMiddleware: z.array(expressMiddlewareSchema).optional(),
  options: z
    .object({
      formatOutputFiles: formatFn(
        z.object({
          mimeType: z.string(),
          type: z.string(),
          data: z.string(),
        }),
      ),
      formatOutputImages: formatFn(
        z.object({
          base64: z.string(),
        }),
      ),
    })
    .optional(),
});

export type StartServerOptions = z.infer<typeof startServerOptionsSchema>;

const MAX_REQUEST_BODY_SIZE = process.env.MAX_REQUEST_BODY_SIZE || "30 mb";

export async function startServer(
  options: StartServerOptions,
): Promise<{ app: express.Express; server: Server }> {
  const { port, dbUrl } = startServerOptionsSchema.parse(options);

  const middleware = options.traceTreeMiddleware ?? [
    (_req: Request, _res: Response, next: NextFunction) => next(),
  ];

  const db = await initDatabase({ url: dbUrl });
  await migrate(db);

  const app: express.Express = express();
  app.locals.db = db;

  app.set("trust proxy", true);
  // @ts-ignore
  app.use(cookieParser());

  app.use(express.json({ limit: MAX_REQUEST_BODY_SIZE }));
  app.use(express.urlencoded({ extended: true, limit: MAX_REQUEST_BODY_SIZE }));

  app.use(cors());

  app.get("/api/sse", sse.init);
  app.use(
    "/api/trace",
    traceRouter({
      options: options.options,
      sse,
      middleware: Array.isArray(middleware) ? middleware : [middleware],
    }),
  );
  app.use(
    "/api/settings",
    settingsRouter({
      middleware: Array.isArray(middleware) ? middleware : [middleware],
    }),
  );
  app.get("/health", (_req: Request, res: Response) => {
    res.send("ok");
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      res.status(400).json({ success: false, error: err.message });
    } else {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ success: false, error: message });
    }
  });

  const server: Server = app.listen(Number(port), () => {
    const url = `http://localhost:${port}`;
    const renderedMessage = (message: string) => `Running observability server on ${message}`;

    const message = terminalLink.isSupported
      ? terminalLink(chalk.greenBright(url), url)
      : chalk.greenBright(url);
    const msg = renderedMessage(message);

    console.log(msg);
  });

  return { app, server };
}
