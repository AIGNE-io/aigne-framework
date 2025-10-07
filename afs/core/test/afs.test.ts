import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { AFS, AFSHistory, type AFSModule, AFSStorageWithModule } from "@aigne/fs";

test("AFS should use AFSHistory module default", async () => {
  const afs = new AFS({});

  expect([...afs["modules"].values()]).toContainEqual(
    expect.objectContaining({ path: AFSHistory.Path }),
  );
});

test("AFS should support use new module", async () => {
  const afs = new AFS().use({
    moduleId: "test-module",
    path: "/test-module",
  });

  expect([...afs["modules"].values()]).toContainEqual(
    expect.objectContaining({ moduleId: "test-module", path: "/test-module" }),
  );
});

test("AFS should initialize a storage for a new module", async () => {
  const module: AFSModule = {
    moduleId: "test-module",
    path: "/test-module",
  };

  const afs = new AFS().use(module);

  const storage = afs.storage(module);

  assert(storage instanceof AFSStorageWithModule);

  expect(((await storage["table"]) as any)[Symbol.for("drizzle:Name")]).toMatchInlineSnapshot(
    `"Entries_test-module"`,
  );
});

test("AFS should list entries correctly", async () => {
  const module: AFSModule = {
    moduleId: "test-module",
    path: "/test-module",
    list: async () => ({ list: [] }),
  };

  const afs = new AFS().use(module);

  const listSpy = spyOn(module, "list").mockResolvedValue({ list: [{ id: "foo", path: "/foo" }] });

  expect(await afs.list("/")).toMatchInlineSnapshot(`
    {
      "list": [
        {
          "id": "foo",
          "path": "/test-module/foo",
        },
      ],
    }
  `);

  expect(listSpy.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "/test-module",
        {
          "maxDepth": 4,
        },
      ],
    ]
  `);
});

test("AFS should read entry correctly", async () => {
  const module: AFSModule = {
    moduleId: "test-module",
    path: "/test-module",
    read: async () => undefined,
  };

  const afs = new AFS().use(module);

  const readSpy = spyOn(module, "read").mockResolvedValue({ id: "foo", path: "/foo" });

  expect(await afs.read("/test-module/foo")).toMatchInlineSnapshot(`
    {
      "id": "foo",
      "path": "/test-module/foo",
    }
  `);

  expect(readSpy.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "/foo",
      ],
    ]
  `);
});

test("AFS should write entry correctly", async () => {
  const module: AFSModule = {
    moduleId: "test-module",
    path: "/test-module",
    write: async () => ({ id: "foo", path: "/foo" }),
  };

  const afs = new AFS().use(module);

  const writeSpy = spyOn(module, "write").mockResolvedValue({ id: "foo", path: "/foo" });

  expect(await afs.write("/test-module/foo", {})).toMatchInlineSnapshot(`
    {
      "id": "foo",
      "path": "/test-module/foo",
    }
  `);

  expect(writeSpy.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "/foo",
        {},
      ],
    ]
  `);
});

test("AFS should search entries correctly", async () => {
  const module: AFSModule = {
    moduleId: "test-module",
    path: "/test-module",
    search: async () => ({ list: [] }),
  };

  const afs = new AFS().use(module);

  const searchSpy = spyOn(module, "search").mockResolvedValue({
    list: [{ id: "foo", path: "/foo" }],
  });

  expect(await afs.search("/", "foo")).toMatchInlineSnapshot(`
    {
      "list": [
        {
          "id": "foo",
          "path": "/test-module/foo",
        },
      ],
    }
  `);

  expect(searchSpy.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "/test-module",
        "foo",
        undefined,
      ],
    ]
  `);
});

test("AFS should record history correctly", async () => {
  const afs = new AFS();

  afs.emit("agentSucceed", {
    input: { message: "foo" },
    output: { message: "bar" },
  });

  await new Promise((resolve) => setTimeout(resolve, 100));

  const histories = (await afs.list(AFSHistory.Path)).list;

  expect(histories.map(({ createdAt, id, path, updatedAt, ...i }) => i)).toMatchInlineSnapshot(`
    [
      {
        "content": {
          "input": {
            "message": "foo",
          },
          "output": {
            "message": "bar",
          },
        },
        "linkTo": null,
        "metadata": null,
        "sessionId": null,
        "summary": null,
        "userId": null,
      },
    ]
  `);

  assert(histories[0]);

  expect(await afs.read(histories[0].path)).toMatchInlineSnapshot(
    {
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      id: expect.any(String),
      path: expect.any(String),
    },
    `
    {
      "content": {
        "input": {
          "message": "foo",
        },
        "output": {
          "message": "bar",
        },
      },
      "createdAt": Any<Date>,
      "id": Any<String>,
      "linkTo": null,
      "metadata": null,
      "path": Any<String>,
      "sessionId": null,
      "summary": null,
      "updatedAt": Any<Date>,
      "userId": null,
    }
  `,
  );
});
