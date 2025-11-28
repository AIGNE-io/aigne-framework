import type { InferInsertModel } from "drizzle-orm";
import { z } from "zod";
import type { Trace } from "../server/models/trace.js";

export const AIGNEObserverOptionsSchema = z
  .object({ storage: z.string().optional() })
  .optional()
  .default({});

export type AIGNEObserverOptions = z.infer<typeof AIGNEObserverOptionsSchema>;

export type AttributeParams = {
  input?: { [key: string]: any };
  output?: { [key: string]: any };
  userContext?: { [key: string]: any };
  memories?: { [key: string]: any };
  status?: { [key: string]: any };
};

export type TraceFormatSpans = Omit<
  InferInsertModel<typeof Trace>,
  "id" | "rootId" | "attributes"
> & {
  id: string;
  rootId: string;
  attributes?: AttributeParams;
};
