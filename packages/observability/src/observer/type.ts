import { z } from "zod";

export const AIGNEObserverOptionsSchema = z
  .object({
    server: z
      .object({
        host: z.string().optional(),
        port: z.number().optional(),
      })
      .optional(),
    storage: z.object({ url: z.string() }).optional().default({ url: "file:observer.sqlite3" }),
  })
  .optional()
  .default({});

export type AIGNEObserverOptions = z.infer<typeof AIGNEObserverOptionsSchema>;
