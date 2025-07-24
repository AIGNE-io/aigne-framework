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
  componentId: z.string().optional(),
  action: z.number().optional(),
});

export const createTraceSchema = recordTraceSchema.omit({});
export const updateTraceSchema = recordTraceSchema.partial();
export const createTraceBatchSchema = z.array(createTraceSchema);
export type TraceInput = z.infer<typeof createTraceSchema>;
export type TraceUpdate = z.infer<typeof updateTraceSchema>;
export type TraceBatch = z.infer<typeof createTraceBatchSchema>;
