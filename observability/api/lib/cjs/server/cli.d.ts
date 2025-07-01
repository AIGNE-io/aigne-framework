import type { Server } from "node:http";
import express from "express";
import { type StartServerOptions } from "./index.js";
export declare function startObservabilityCLIServer(options: StartServerOptions): Promise<{
    app: express.Express;
    server: Server;
}>;
