import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { AFS, AFSHistory, type AFSModule } from "@aigne/afs";

test("AFS should mount module correctly", async () => {
  const afs = new AFS().mount({
    name: "test-module",
  });

  expect([...afs["modules"].entries()]).toMatchInlineSnapshot(`
    [
      [
        "/test-module",
        {
          "name": "test-module",
        },
      ],
    ]
  `);
});

test("AFS should list modules correctly", async () => {
  const module: AFSModule = {
    name: "test-module",
    description: "Test Module",
    list: async () => ({ list: [] }),
  };

  const afs = new AFS().mount(module);

  expect(await afs.listModules()).toMatchInlineSnapshot(`
    [
      {
        "description": "Test Module",
        "name": "test-module",
        "path": "/test-module",
      },
    ]
  `);
});

test("AFS should list entries correctly", async () => {
  const module: AFSModule = {
    name: "test-module",
    description: "Test Module",
    list: async () => ({ list: [] }),
  };

  const afs = new AFS().mount(module);

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
          "id": "test-module",
          "path": "/test-module",
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
          "id": "foo",
          "path": "/test-module/foo",
        },
        {
          "id": "bar",
          "path": "/test-module/bar",
        },
      ],
      "message": undefined,
    }
  `);

  expect(await afs.list("/", { maxDepth: 3 })).toMatchInlineSnapshot(`
    {
      "list": [
        {
          "id": "foo",
          "path": "/test-module/foo",
        },
        {
          "id": "bar",
          "path": "/test-module/bar",
        },
      ],
      "message": undefined,
    }
  `);

  expect(listSpy.mock.lastCall).toMatchInlineSnapshot(`
    [
      "/",
      {
        "maxDepth": 2,
      },
    ]
  `);

  expect(await afs.list("/foo")).toMatchInlineSnapshot(`
    {
      "list": [],
      "message": undefined,
    }
  `);

  listSpy.mockClear();
  expect(await afs.list("/foo", { maxDepth: 2 })).toMatchInlineSnapshot(`
    {
      "list": [],
      "message": undefined,
    }
  `);
  expect(listSpy.mock.lastCall).toMatchInlineSnapshot(`undefined`);
});

test("AFS should search entries correctly", async () => {
  const module: AFSModule = {
    name: "test-module",
    search: async () => ({ list: [] }),
  };

  const afs = new AFS().mount(module);

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
          "path": "/test-module/foo",
        },
        {
          "id": "bar",
          "path": "/test-module/bar",
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
      "list": [],
      "message": "",
    }
  `);

  expect(searchSpy.mock.lastCall).toMatchInlineSnapshot(`undefined`);
});

test("AFS should read entry correctly", async () => {
  const module: AFSModule = {
    name: "test-module",
    read: async () => ({}),
  };

  const afs = new AFS().mount(module);

  const readSpy = spyOn(module, "read").mockResolvedValue({
    result: { id: "foo", path: "/foo", content: "Test Content" },
  });

  expect((await afs.read("/bar")).result).toMatchInlineSnapshot(`undefined`);

  expect((await afs.read("/foo/test-module/foo")).result).toMatchInlineSnapshot(`undefined`);

  expect(readSpy.mock.calls).toMatchInlineSnapshot(`[]`);
});

test("AFS should write entry correctly", async () => {
  const module: AFSModule = {
    name: "test-module",
    write: async () => ({ result: { id: "foo", path: "/foo" } }),
  };

  const afs = new AFS().mount(module);

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
  const history = new AFSHistory();
  const afs = new AFS().mount(history);

  afs.emit("agentSucceed", {
    input: { message: "foo" },
    output: { message: "bar" },
  });

  await new Promise((resolve) => setTimeout(resolve, 100));

  const historyPath = (await afs.listModules()).find((i) => i.name === history.name)?.path;

  assert(historyPath);

  const histories = (await afs.list(historyPath)).list;

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
    name: "module-a",
  };

  const afs = new AFS().mount(moduleA);

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
