import { afterAll, beforeAll, expect, spyOn, test } from "bun:test";
import { rmSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import getObservabilityDbPath from "../../api/core/db-path.js";
import { startObservabilityCLIServer } from "../../api/server/cli.js";
import * as utils from "../../api/server/utils/index.js";

const observerDir = join(homedir(), ".aigne", "observability");
const mockDbFilePath = resolve(observerDir, "mock-observer.db");
const mockSettingFilePath = resolve(observerDir, "mock-setting.yaml");

beforeAll(() => {
  rmSync(mockDbFilePath, { recursive: true, force: true });
});

spyOn(utils, "getGlobalSettingPath").mockReturnValue(mockSettingFilePath);

test("startObservabilityCLIServer should start server successfully", async () => {
  const port = 12345;
  const url = `http://localhost:${port}`;

  const { server } = await startObservabilityCLIServer({
    port,
    dbUrl: getObservabilityDbPath("mock-observer.db"),
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

test("startObservabilityCLIServer should start server successfully with static file", async () => {
  const port = 12345;
  const url = `http://localhost:${port}`;

  const { server } = await startObservabilityCLIServer({
    port,
    dbUrl: getObservabilityDbPath("mock-observer.db"),
  });

  const res = await fetch(`${url}/api/static/model-prices.json`, { method: "GET" });
  expect(res.status).toBe(200);
  const text = await res.text();
  expect(text).toContain("window._modelPricesAndContextWindow");

  server.closeAllConnections();
  server.close();
});

afterAll(() => {
  rmSync(mockDbFilePath, { recursive: true, force: true });
  rmSync(mockSettingFilePath, { recursive: true, force: true });
});
