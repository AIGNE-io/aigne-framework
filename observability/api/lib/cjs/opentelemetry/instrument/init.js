"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initOpenTelemetry = initOpenTelemetry;
const sdk_node_1 = require("@opentelemetry/sdk-node");
const sdk_trace_base_1 = require("@opentelemetry/sdk-trace-base");
const http_exporter_js_1 = __importDefault(require("../exporter/http-exporter.js"));
async function initOpenTelemetry({ dbPath }) {
    const traceExporter = new http_exporter_js_1.default({ dbPath });
    const spanProcessor = new sdk_trace_base_1.SimpleSpanProcessor(traceExporter);
    const sdk = new sdk_node_1.NodeSDK({
        spanProcessor,
        instrumentations: [],
    });
    await sdk.start();
    console.log("Observability OpenTelemetry SDK Started, You can run `npx aigne observe` to start the observability server.");
    return traceExporter;
}
