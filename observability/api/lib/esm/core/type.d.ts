import { z } from "zod";
export declare const AIGNEObserverOptionsSchema: z.ZodDefault<z.ZodOptional<z.ZodObject<{
    server: z.ZodOptional<z.ZodObject<{
        host: z.ZodOptional<z.ZodString>;
        port: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        host?: string | undefined;
        port?: number | undefined;
    }, {
        host?: string | undefined;
        port?: number | undefined;
    }>>;
    storage: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
    }, {
        url: string;
    }>>>;
}, "strip", z.ZodTypeAny, {
    storage: {
        url: string;
    };
    server?: {
        host?: string | undefined;
        port?: number | undefined;
    } | undefined;
}, {
    server?: {
        host?: string | undefined;
        port?: number | undefined;
    } | undefined;
    storage?: {
        url: string;
    } | undefined;
}>>>;
export type AIGNEObserverOptions = z.infer<typeof AIGNEObserverOptionsSchema>;
