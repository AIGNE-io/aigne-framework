import type { Server } from "node:http";
import express from "express";
import { z } from "zod";
declare const startServerOptionsSchema: z.ZodObject<{
    port: z.ZodNumber;
    dbUrl: z.ZodString;
    traceTreeMiddleware: z.ZodOptional<z.ZodArray<z.ZodFunction<z.ZodTuple<[z.ZodType<express.Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, z.ZodTypeDef, express.Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>>, z.ZodType<express.Response<any, Record<string, any>>, z.ZodTypeDef, express.Response<any, Record<string, any>>>, z.ZodType<express.NextFunction, z.ZodTypeDef, express.NextFunction>], z.ZodUnknown>, z.ZodVoid>, "many">>;
}, "strip", z.ZodTypeAny, {
    port: number;
    dbUrl: string;
    traceTreeMiddleware?: ((args_0: express.Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, args_1: express.Response<any, Record<string, any>>, args_2: express.NextFunction, ...args: unknown[]) => void)[] | undefined;
}, {
    port: number;
    dbUrl: string;
    traceTreeMiddleware?: ((args_0: express.Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, args_1: express.Response<any, Record<string, any>>, args_2: express.NextFunction, ...args: unknown[]) => void)[] | undefined;
}>;
export type StartServerOptions = z.infer<typeof startServerOptionsSchema>;
export declare function startServer(options: StartServerOptions): Promise<{
    app: express.Express;
    server: Server;
}>;
export {};
