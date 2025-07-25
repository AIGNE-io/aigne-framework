import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { rmSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import getObservabilityDbPath from "../../api/core/db-path.js";
import { startObservabilityCLIServer } from "../../api/server/cli.js";

const observerDir = join(homedir(), ".aigne", "observability");
const mockDbFilePath = resolve(observerDir, "mock-observer.db");
const mockSettingFilePath = resolve(observerDir, "setting.yaml");

describe("CLI Server", () => {
  beforeAll(() => {
    rmSync(mockDbFilePath, { recursive: true, force: true });
    rmSync(mockSettingFilePath, { recursive: true, force: true });
  });

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

  afterAll(() => {
    rmSync(mockDbFilePath, { recursive: true, force: true });
    rmSync(mockSettingFilePath, { recursive: true, force: true });
  });
});
