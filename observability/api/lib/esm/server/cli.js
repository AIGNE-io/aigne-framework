import path from "node:path";
import express from "express";
import { startServer } from "./index.js";
export async function startObservabilityCLIServer(options) {
    const { app, server } = await startServer(options);
    // @ts-ignore
    const distPath = path.join(import.meta.dirname, "../../../dist");
    app.use(express.static(distPath));
    app.get("/{*splat}", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });
    return { app, server };
}
