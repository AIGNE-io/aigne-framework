import express from "express";
import type SSE from "express-sse";
declare const _default: ({ sse, middleware }: {
    sse: SSE;
    middleware: express.RequestHandler[];
}) => import("express-serve-static-core").Router;
export default _default;
