import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { rmSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { withQuery } from "ufo";
import getObservabilityDbPath from "../../api/core/db-path.js";
import { startServer } from "../../api/server/base.js";

const observerDir = join(homedir(), ".aigne", "observability");
const mockDbFilePath = resolve(observerDir, "mock-observer.db");
const mockSettingFilePath = resolve(observerDir, "setting.yaml");

describe("Base Server", () => {
  beforeAll(() => {
    rmSync(mockDbFilePath, { recursive: true, force: true });
    rmSync(mockSettingFilePath, { recursive: true, force: true });
  });

  test("startServer should start server successfully", async () => {
    const port = 12345;
    const url = `http://localhost:${port}`;

    const { server } = await startServer({
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

  test("POST /tree and fetch it via /tree and /tree/:id and /tree/stats", async () => {
    const port = 12346;
    const url = `http://localhost:${port}`;

    const { server } = await startServer({
      port,
      dbUrl: getObservabilityDbPath("mock-observer.db"),
    });

    const validTrace = {
      id: "trace-1",
      rootId: "root-1",
      parentId: undefined,
      name: "test-trace",
      startTime: 1710000000,
      endTime: 1710000010,
      status: { code: "OK" },
      attributes: {
        input: { foo: "bar" },
        output: { foo: "bar" },
      },
    };

    // Step 1: POST trace
    const postRes = await fetch(`${url}/api/trace/tree`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([validTrace]),
    });
    expect(postRes.status).toBe(200);
    const postJson = await postRes.json();
    expect(postJson.message).toBe("ok");

    // Step 2: GET /tree list
    const listRes = await fetch(`${url}/api/trace/tree`);
    expect(listRes.status).toBe(200);
    const listJson = await listRes.json();
    expect(listJson.data.length).toBe(1);
    expect(listJson.data[0].id).toBe("trace-1");

    // Step 3: GET /tree/trace-1
    const detailRes = await fetch(`${url}/api/trace/tree/trace-1`);
    expect(detailRes.status).toBe(200);
    const detailJson = await detailRes.json();
    expect(detailJson.data.id).toBe("trace-1");
    expect(detailJson.data.children).toEqual([]);

    // Step 4: GET /tree/stats
    const statsRes = await fetch(`${url}/api/trace/tree/stats`);
    expect(statsRes.status).toBe(200);
    const statsJson = await statsRes.json();
    expect(statsJson.data.lastTraceChanged).toBe(true);

    const statsRes2 = await fetch(`${url}/api/trace/tree/stats`);
    expect(statsRes2.status).toBe(200);
    const statsJson2 = await statsRes2.json();
    expect(statsJson2.data.lastTraceChanged).toBe(false);

    // Step 5: GET /api/trace/tree/stats
    const validTrace1 = {
      id: "trace-2",
      rootId: "root-2",
      parentId: undefined,
      name: "test-trace-2",
      startTime: 1710000001,
      endTime: 1710000011,
      status: { code: "OK" },
      attributes: {
        input: { foo: "bar" },
        output: { foo: "bar" },
      },
      componentId: "z2qa9KiiADmMo5FGfidpzpXZwaNGWNeqJ7rLq",
    };
    const postRes1 = await fetch(`${url}/api/trace/tree`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([validTrace1]),
    });
    expect(postRes1.status).toBe(200);
    const postJson1 = await postRes1.json();
    expect(postJson1.message).toBe("ok");

    const listRes1 = await fetch(
      withQuery(`${url}/api/trace/tree`, { componentId: "z2qa9KiiADmMo5FGfidpzpXZwaNGWNeqJ7rLq" }),
    );
    expect(listRes1.status).toBe(200);
    const listJson1 = await listRes1.json();
    expect(listJson1.data.length).toBe(1);
    expect(listJson1.data[0].id).toBe("trace-2");

    // Step 6: GET /tree/stats
    const statsRes1 = await fetch(`${url}/api/trace/tree/stats`);
    expect(statsRes1.status).toBe(200);
    const statsJson1 = await statsRes1.json();
    expect(statsJson1.data.lastTraceChanged).toBe(true);

    // Step 7: GET /tree/components
    const componentsRes = await fetch(`${url}/api/trace/tree/components`);
    expect(componentsRes.status).toBe(200);
    const componentsJson = await componentsRes.json();
    expect(componentsJson.data.length).toBe(1);
    expect(componentsJson.data[0]).toBe("z2qa9KiiADmMo5FGfidpzpXZwaNGWNeqJ7rLq");

    // Step 8: GET /tree/trace-2
    const detailRes1 = await fetch(`${url}/api/trace/tree/trace-3`);
    expect(detailRes1.status).toBe(500);
    const detailJson1 = await detailRes1.json();
    expect(detailJson1.error).toBe("Not found trace: trace-3");

    // Step 9: DELETE /tree
    const deleteRes = await fetch(`${url}/api/trace/tree`, { method: "DELETE" });
    expect(deleteRes.status).toBe(200);
    const deleteJson = await deleteRes.json();
    expect(deleteJson.message).toBe("ok");

    // Step 10: GET /tree list
    const listRes10 = await fetch(`${url}/api/trace/tree`);
    expect(listRes10.status).toBe(200);
    const listJson10 = await listRes10.json();
    expect(listJson10.data.length).toBe(0);

    const listRes11 = await fetch(`${url}/api/trace/tree?page=100000000&pageSize=1000000000`);
    expect(listRes11.status).toBe(400);
    const listJson11 = await listRes11.json();
    expect(listJson11.error).toBe("Page number too large, would cause overflow");

    server.closeAllConnections();
    server.close();
  });

  test("GET /api/settings should return default when file not exists", async () => {
    const port = 12347;
    const url = `http://localhost:${port}`;
    rmSync(mockSettingFilePath, { recursive: true, force: true });

    const { server } = await startServer({
      port,
      dbUrl: getObservabilityDbPath("mock-observer.db"),
    });
    const res = await fetch(`${url}/api/settings`, { method: "GET" });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.live).toEqual(undefined);

    server.closeAllConnections();
    server.close();
  });

  test("POST /api/settings then GET /api/settings should persist and return settings", async () => {
    const port = 12348;
    const url = `http://localhost:${port}`;

    const { server } = await startServer({
      port,
      dbUrl: getObservabilityDbPath("mock-observer.db"),
    });

    const postRes = await fetch(`${url}/api/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ live: true }),
    });
    expect(postRes.status).toBe(200);
    const postJson = await postRes.json();
    expect(postJson.data.live).toEqual(true);

    const getRes = await fetch(`${url}/api/settings`, { method: "GET" });
    expect(getRes.status).toBe(200);
    const getJson = await getRes.json();
    expect(getJson.data.live).toEqual(true);

    server.closeAllConnections();
    server.close();
  });

  test("POST Error", async () => {
    const port = 12349;
    const url = `http://localhost:${port}`;

    const { server } = await startServer({
      port,
      dbUrl: getObservabilityDbPath("mock-observer.db"),
    });

    // Step 1: POST trace
    const postRes = await fetch(`${url}/api/trace/tree`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([]),
    });
    expect(postRes.status).toBe(500);
    const postJson = await postRes.json();
    expect(postJson.error).toBe("req.body is empty");

    server.closeAllConnections();
    server.close();
  });

  afterAll(() => {
    rmSync(mockDbFilePath, { recursive: true, force: true });
    rmSync(mockSettingFilePath, { recursive: true, force: true });
  });
});
