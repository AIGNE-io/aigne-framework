import { z } from "zod";

export const recordTraceSchema = z.object({
  id: z.string(),
  rootId: z.string(),
  parentId: z.string().optional(),
  name: z.string(),
  startTime: z.number().int(),
  endTime: z.number().int(),
  status: z.record(z.string(), z.any()),
  attributes: z.record(z.string(), z.any()),
  links: z.array(z.any()).optional(),
  events: z.array(z.any()).optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
});

export type RecordTrace = z.infer<typeof recordTraceSchema>;

export const recordTraceBatchSchema = z.array(recordTraceSchema);
