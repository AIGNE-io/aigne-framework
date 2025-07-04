import { afterAll, beforeAll, expect, spyOn, test } from "bun:test";
import { rmSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import type { NextFunction, Request, Response } from "express";
import getObservabilityDbPath from "../../api/core/db-path.js";
import { startObservabilityBlockletServer } from "../../api/server/index.js";
import * as utils from "../../api/server/utils/index.js";

const observerDir = join(homedir(), ".aigne", "observability");
const mockDbFilePath = resolve(observerDir, "mock-observer.db");
const mockSettingFilePath = resolve(observerDir, "mock-setting.yaml");

beforeAll(() => {
  rmSync(mockDbFilePath, { recursive: true, force: true });
});

spyOn(utils, "getGlobalSettingPath").mockReturnValue(mockSettingFilePath);

function requireAdminRole(_req: Request, _res: Response, next: NextFunction) {
  next();
}

test("startObservabilityBlockletServer should start server successfully", async () => {
  const port = 12345;
  const url = `http://localhost:${port}`;

  const { server } = await startObservabilityBlockletServer({
    port,
    dbUrl: getObservabilityDbPath("mock-observer.db"),
    traceTreeMiddleware: [requireAdminRole],
  });

  const res = await fetch(`${url}/health`, {
    method: "GET",
  });

  expect(res.status).toBe(200);
  const text = await res.text();
  expect(text).toContain("ok");

  server.closeAllConnections();
  server.close();
});

afterAll(() => {
  rmSync(mockDbFilePath, { recursive: true, force: true });
  rmSync(mockSettingFilePath, { recursive: true, force: true });
});
