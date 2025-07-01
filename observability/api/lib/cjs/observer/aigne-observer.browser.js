"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIGNEObserver = void 0;
const type_js_1 = require("../core/type.js");
class AIGNEObserver {
    initPort;
    tracer = {
        startSpan: () => {
            return {
                spanContext: () => ({ traceId: "", spanId: "" }),
                parentSpanContext: () => ({ traceId: "", spanId: "" }),
                setAttribute: () => { },
                setAttributes: () => { },
                end: () => { },
                setStatus: () => { },
                setSpanContext: () => { },
            };
        },
    };
    constructor(options) {
        const parsed = type_js_1.AIGNEObserverOptionsSchema.parse(options);
        const initPort = parsed.server?.port ?? process.env.AIGNE_OBSERVER_PORT;
        this.initPort = initPort ? Number(initPort) : undefined;
    }
    async serve() { }
    async close() { }
}
exports.AIGNEObserver = AIGNEObserver;
