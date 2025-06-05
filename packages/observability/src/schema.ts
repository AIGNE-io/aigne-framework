import { z } from "zod";

export const recordTraceSchema = z.object({
  id: z.string(),
  rootId: z.string(),
  parentId: z.string().optional(),
  name: z.string(),
  input: z.object({}).passthrough(),
  startedAt: z.number().int(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
});

export const updateTraceSchema = z.object({
  id: z.string(),
  status: z.enum(["succeed", "failed"]),
  endedAt: z.number().int(),
  output: z.object({}).passthrough().optional(),
  error: z.object({}).passthrough().optional(),
  metadata: z.object({}).passthrough().optional(),
});
