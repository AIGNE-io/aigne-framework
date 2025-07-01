"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startObservabilityCLIServer = startObservabilityCLIServer;
const node_path_1 = __importDefault(require("node:path"));
const express_1 = __importDefault(require("express"));
const index_js_1 = require("./index.js");
async function startObservabilityCLIServer(options) {
    const { app, server } = await (0, index_js_1.startServer)(options);
    // @ts-ignore
    const distPath = node_path_1.default.join(import.meta.dirname, "../../../dist");
    app.use(express_1.default.static(distPath));
    app.get("/{*splat}", (_req, res) => {
        res.sendFile(node_path_1.default.join(distPath, "index.html"));
    });
    return { app, server };
}
