import { type Runnable, logger } from "@aigne/core";
import type { Response } from "express";

export async function runAgentWithStreaming<T extends { [key: string]: any }>(
  res: Response,
  agent: Runnable<T>,
  input: T,
) {
  try {
    const stream = await agent.run(input ?? {}, { stream: true });

    for await (const chunk of stream) {
      writeEvent(res, chunk);
    }
  } catch (error) {
    logger.error("AIGNE Middleware: runAgentWithStreaming error", { error });
    writeEvent(res, { error: { message: error.message } });
  }

  res.end();
}

function writeEvent(res: Response, data: object) {
  if (!res.headersSent) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();
  }

  res.write(`data: ${JSON.stringify(data)}\n\n`);
  res.flush();
}
