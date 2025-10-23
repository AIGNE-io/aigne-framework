import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { AFS, AFSHistory, type AFSModule, AFSStorageWithModule } from "@aigne/afs";

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

test("AFS should list modules correctly", async () => {
  const module: AFSModule = {
    moduleId: "test-module",
    path: "/test-module",
    description: "Test Module",
    list: async () => ({ list: [] }),
  };

  const afs = new AFS().use(module);

  expect(await afs.listModules()).toMatchInlineSnapshot(`
    [
      {
        "description": undefined,
        "moduleId": "AFSHistory",
        "path": "/history",
      },
      {
        "description": "Test Module",
        "moduleId": "test-module",
        "path": "/test-module",
      },
    ]
  `);
});

test("AFS should list entries correctly", async () => {
  const module: AFSModule = {
    moduleId: "test-module",
    path: "/foo/test-module",
    description: "Test Module",
    list: async () => ({ list: [] }),
  };

  const afs = new AFS().use(module);

  const listSpy = spyOn(module, "list").mockResolvedValue({
    list: [
      { id: "foo", path: "/foo" },
      { id: "bar", path: "/bar" },
    ],
  });

  expect(await afs.list("/")).toMatchInlineSnapshot(`
    {
      "list": [
        {
          "id": "AFSHistory",
          "path": "/history",
          "summary": undefined,
        },
        {
          "id": "test-module",
          "path": "/foo",
          "summary": "Test Module",
        },
      ],
      "message": undefined,
    }
  `);

  expect(await afs.list("/", { maxDepth: 2 })).toMatchInlineSnapshot(`
    {
      "list": [
        {
          "id": "AFSHistory",
          "path": "/history",
          "summary": undefined,
        },
        {
          "id": "test-module",
          "path": "/foo/test-module",
          "summary": "Test Module",
        },
      ],
      "message": undefined,
    }
  `);

  expect(await afs.list("/", { maxDepth: 3 })).toMatchInlineSnapshot(`
    {
      "list": [
        {
          "id": "AFSHistory",
          "path": "/history",
          "summary": undefined,
        },
        {
          "id": "foo",
          "path": "/foo/test-module/foo",
        },
        {
          "id": "bar",
          "path": "/foo/test-module/bar",
        },
      ],
      "message": undefined,
    }
  `);

  expect(listSpy.mock.lastCall).toMatchInlineSnapshot(`
    [
      "/",
      {
        "maxDepth": 1,
      },
    ]
  `);

  expect(await afs.list("/foo")).toMatchInlineSnapshot(`
    {
      "list": [
        {
          "id": "test-module",
          "path": "/test-module",
          "summary": "Test Module",
        },
      ],
      "message": undefined,
    }
  `);

  listSpy.mockClear();
  expect(await afs.list("/foo", { maxDepth: 2 })).toMatchInlineSnapshot(`
    {
      "list": [
        {
          "id": "foo",
          "path": "/foo/test-module/foo",
        },
        {
          "id": "bar",
          "path": "/foo/test-module/bar",
        },
      ],
      "message": undefined,
    }
  `);
  expect(listSpy.mock.lastCall).toMatchInlineSnapshot(`
    [
      "/",
      {
        "maxDepth": 1,
      },
    ]
  `);
});

test("AFS should search entries correctly", async () => {
  const module: AFSModule = {
    moduleId: "test-module",
    path: "/foo/test-module",
    search: async () => ({ list: [] }),
  };

  const afs = new AFS().use(module);

  const searchSpy = spyOn(module, "search").mockResolvedValue({
    list: [
      { id: "foo", path: "/foo" },
      { id: "bar", path: "/bar" },
    ],
  });

  expect(await afs.search("/bar", "foo")).toMatchInlineSnapshot(`
    {
      "list": [],
      "message": "",
    }
  `);

  expect(await afs.search("/", "foo")).toMatchInlineSnapshot(`
    {
      "list": [
        {
          "id": "foo",
          "path": "/foo/test-module/foo",
        },
        {
          "id": "bar",
          "path": "/foo/test-module/bar",
        },
      ],
      "message": "",
    }
  `);

  expect(searchSpy.mock.lastCall).toMatchInlineSnapshot(`
    [
      "/",
      "foo",
      undefined,
    ]
  `);

  searchSpy.mockClear();
  expect(await afs.search("/foo/test-module/bar", "foo")).toMatchInlineSnapshot(`
    {
      "list": [
        {
          "id": "foo",
          "path": "/foo/test-module/foo",
        },
        {
          "id": "bar",
          "path": "/foo/test-module/bar",
        },
      ],
      "message": "",
    }
  `);

  expect(searchSpy.mock.lastCall).toMatchInlineSnapshot(`
    [
      "/bar",
      "foo",
      undefined,
    ]
  `);
});

test("AFS should read entry correctly", async () => {
  const module: AFSModule = {
    moduleId: "test-module",
    path: "/foo/test-module",
    read: async () => ({}),
  };

  const afs = new AFS().use(module);

  const readSpy = spyOn(module, "read").mockResolvedValue({
    result: { id: "foo", path: "/foo", content: "Test Content" },
  });

  expect((await afs.read("/bar")).result).toMatchInlineSnapshot(`undefined`);

  expect((await afs.read("/foo/test-module/foo")).result).toMatchInlineSnapshot(`
    {
      "content": "Test Content",
      "id": "foo",
      "path": "/foo/test-module/foo",
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
    path: "/foo/test-module",
    write: async () => ({ result: { id: "foo", path: "/foo" } }),
  };

  const afs = new AFS().use(module);

  const writeSpy = spyOn(module, "write").mockResolvedValue({
    result: { id: "foo", path: "/foo", content: "Written Content" },
  });

  expect((await afs.write("/foo/test-module/foo", {})).result).toMatchInlineSnapshot(`
    {
      "content": "Written Content",
      "id": "foo",
      "path": "/foo/test-module/foo",
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

  expect((await afs.read(histories[0].path)).result).toMatchInlineSnapshot(
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

test("AFS.findModules should match modules correctly", () => {
  const moduleA: AFSModule = {
    moduleId: "module-a",
    path: "/foo/bar",
  };

  const afs = new AFS().use(moduleA);

  expect(afs["findModules"]("/")).toContainAllValues([
    {
      module: expect.any(AFSHistory),
      maxDepth: 0,
      subpath: "/",
      remainedModulePath: "/history",
    },
    {
      module: moduleA,
      maxDepth: 0,
      subpath: "/",
      remainedModulePath: "/foo",
    },
  ]);
  expect(afs["findModules"]("/foo")).toContainAllValues([
    {
      module: moduleA,
      maxDepth: 0,
      subpath: "/",
      remainedModulePath: "/bar",
    },
  ]);
  expect(afs["findModules"]("/foo/bar")).toContainAllValues([
    {
      module: moduleA,
      maxDepth: 1,
      subpath: "/",
      remainedModulePath: "/",
    },
  ]);
  expect(afs["findModules"]("/foo/bar/baz")).toContainAllValues([
    {
      module: moduleA,
      maxDepth: 1,
      subpath: "/baz",
      remainedModulePath: "/",
    },
  ]);

  expect(afs["findModules"]("/", { maxDepth: 2 })).toContainAllValues([
    {
      module: expect.any(AFSHistory),
      maxDepth: 1,
      subpath: "/",
      remainedModulePath: "/history",
    },
    {
      module: moduleA,
      maxDepth: 0,
      subpath: "/",
      remainedModulePath: "/foo/bar",
    },
  ]);
  expect(afs["findModules"]("/foo", { maxDepth: 2 })).toContainAllValues([
    {
      module: moduleA,
      maxDepth: 1,
      subpath: "/",
      remainedModulePath: "/bar",
    },
  ]);
  expect(afs["findModules"]("/foo/bar", { maxDepth: 2 })).toContainAllValues([
    {
      module: moduleA,
      maxDepth: 2,
      subpath: "/",
      remainedModulePath: "/",
    },
  ]);
  expect(afs["findModules"]("/foo/bar/baz", { maxDepth: 2 })).toContainAllValues([
    {
      module: moduleA,
      maxDepth: 2,
      subpath: "/baz",
      remainedModulePath: "/",
    },
  ]);
});
