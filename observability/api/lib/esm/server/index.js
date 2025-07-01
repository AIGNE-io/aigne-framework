import { initDatabase } from "@aigne/sqlite";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv-flow";
import express from "express";
import SSE from "express-sse";
import { z } from "zod";
import { ZodError } from "zod";
import { migrate } from "./migrate.js";
import settingsRouter from "./routes/settings.js";
import traceRouter from "./routes/trace.js";
const sse = new SSE();
dotenv.config({ silent: true });
const expressMiddlewareSchema = z
    .function()
    .args(z.custom(), z.custom(), z.custom())
    .returns(z.void());
const startServerOptionsSchema = z.object({
    port: z.number().int().positive(),
    dbUrl: z.string().min(1),
    traceTreeMiddleware: z.array(expressMiddlewareSchema).optional(),
});
export async function startServer(options) {
    const { port, dbUrl } = startServerOptionsSchema.parse(options);
    const middleware = options.traceTreeMiddleware ?? [
        (_req, _res, next) => next(),
    ];
    const db = await initDatabase({ url: dbUrl });
    await migrate(db);
    const app = express();
    app.locals.db = db;
    app.set("trust proxy", true);
    app.use(cookieParser());
    app.use(express.json({ limit: "1 mb" }));
    app.use(express.urlencoded({ extended: true, limit: "1 mb" }));
    app.use(cors());
    app.get("/api/sse", sse.init);
    app.use("/api/trace", traceRouter({
        sse,
        middleware: Array.isArray(middleware) ? middleware : [middleware],
    }));
    app.use("/api/settings", settingsRouter({
        middleware: Array.isArray(middleware) ? middleware : [middleware],
    }));
    app.use((err, _req, res, _next) => {
        if (err instanceof ZodError) {
            res.status(400).json({ success: false, error: err.errors });
        }
        else {
            const message = err instanceof Error ? err.message : "Unknown error";
            res.status(500).json({ success: false, error: message });
        }
    });
    const server = app.listen(Number(port), () => {
        console.log(`Running observability server on http://localhost:${port}`);
    });
    return { app, server };
}
