import { expect, spyOn, test } from "bun:test";
import { AFS, type AFSModule } from "@aigne/afs";

test("AFS should mount module correctly", async () => {
  const afs = new AFS().mount({
    name: "test-module",
  });

  expect([...afs["modules"].entries()]).toMatchInlineSnapshot(`
    [
      [
        "/modules/test-module",
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

  expect(
    (await afs.listModules()).map((i) => ({ ...i, module: undefined })),
  ).toMatchInlineSnapshot(`
    [
      {
        "description": "Test Module",
        "module": undefined,
        "name": "test-module",
        "path": "/modules/test-module",
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
          "path": "/modules",
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
          "id": "test-module",
          "path": "/modules/test-module",
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
          "id": "foo",
          "path": "/modules/test-module/foo",
        },
        {
          "id": "bar",
          "path": "/modules/test-module/bar",
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
          "path": "/modules/test-module/foo",
        },
        {
          "id": "bar",
          "path": "/modules/test-module/bar",
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

  expect((await afs.write("/modules/test-module/foo", {})).result).toMatchInlineSnapshot(`
    {
      "content": "Written Content",
      "id": "foo",
      "path": "/modules/test-module/foo",
    }
  `);

  expect(writeSpy.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "/foo",
        {},
        undefined,
      ],
    ]
  `);
});

test("AFS.findModules should match modules correctly", () => {
  const moduleA: AFSModule = {
    name: "module-a",
  };

  const afs = new AFS().mount(moduleA);

  // Test matching at root level - should match modules
  expect(afs["findModules"]("/")).toContainAllValues([
    {
      module: moduleA,
      modulePath: "/modules/module-a",
      maxDepth: 0,
      subpath: "/",
      remainedModulePath: "/modules",
    },
  ]);

  // Test matching /modules - should show module-a at depth 0
  expect(afs["findModules"]("/modules")).toContainAllValues([
    {
      module: moduleA,
      modulePath: "/modules/module-a",
      maxDepth: 0,
      subpath: "/",
      remainedModulePath: "/module-a",
    },
  ]);

  // Test matching /modules/module-a - should match with subpath /
  expect(afs["findModules"]("/modules/module-a")).toContainAllValues([
    {
      module: moduleA,
      modulePath: "/modules/module-a",
      maxDepth: 1,
      subpath: "/",
      remainedModulePath: "/",
    },
  ]);

  // Test matching /modules/module-a/foo - should match with subpath /foo
  expect(afs["findModules"]("/modules/module-a/foo")).toContainAllValues([
    {
      module: moduleA,
      modulePath: "/modules/module-a",
      maxDepth: 1,
      subpath: "/foo",
      remainedModulePath: "/",
    },
  ]);

  // Test with maxDepth 2 at root
  expect(afs["findModules"]("/", { maxDepth: 2 })).toContainAllValues([
    {
      module: moduleA,
      modulePath: "/modules/module-a",
      maxDepth: 0,
      subpath: "/",
      remainedModulePath: "/modules/module-a",
    },
  ]);

  // Test with maxDepth 2 at /modules
  expect(afs["findModules"]("/modules", { maxDepth: 2 })).toContainAllValues([
    {
      module: moduleA,
      modulePath: "/modules/module-a",
      maxDepth: 1,
      subpath: "/",
      remainedModulePath: "/module-a",
    },
  ]);

  // Test with maxDepth 2 at /modules/module-a
  expect(afs["findModules"]("/modules/module-a", { maxDepth: 2 })).toContainAllValues([
    {
      module: moduleA,
      modulePath: "/modules/module-a",
      maxDepth: 2,
      subpath: "/",
      remainedModulePath: "/",
    },
  ]);

  // Test with maxDepth 2 at /modules/module-a/foo
  expect(afs["findModules"]("/modules/module-a/foo", { maxDepth: 2 })).toContainAllValues([
    {
      module: moduleA,
      modulePath: "/modules/module-a",
      maxDepth: 2,
      subpath: "/foo",
      remainedModulePath: "/",
    },
  ]);
});

test("AFS should delete entry correctly", async () => {
  const module: AFSModule = {
    name: "test-module",
    delete: async () => ({ message: "Deleted successfully" }),
  };

  const afs = new AFS().mount(module);

  const deleteSpy = spyOn(module, "delete").mockResolvedValue({
    message: "Deleted successfully",
  });

  // Test successful delete
  expect(await afs.delete("/modules/test-module/foo")).toMatchInlineSnapshot(`
    {
      "message": "Deleted successfully",
    }
  `);

  expect(deleteSpy.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "/foo",
        undefined,
      ],
    ]
  `);

  // Test delete with options
  deleteSpy.mockClear();
  await afs.delete("/modules/test-module/bar", { recursive: true });

  expect(deleteSpy.mock.lastCall).toMatchInlineSnapshot(`
    [
      "/bar",
      {
        "recursive": true,
      },
    ]
  `);
});

test("AFS should throw error when deleting without delete support", async () => {
  const module: AFSModule = {
    name: "test-module",
  };

  const afs = new AFS().mount(module);

  // Test error when module doesn't support delete
  expect(async () => await afs.delete("/modules/test-module/foo")).toThrow(
    "No module found for path: /modules/test-module/foo",
  );
});

test("AFS should throw error when deleting non-existent path", async () => {
  const module: AFSModule = {
    name: "test-module",
    delete: async () => ({}),
  };

  const afs = new AFS().mount(module);

  // Test error when path doesn't exist
  expect(async () => await afs.delete("/non-existent/foo")).toThrow(
    "No module found for path: /non-existent/foo",
  );
});

test("AFS should rename entry correctly", async () => {
  const module: AFSModule = {
    name: "test-module",
    rename: async () => ({ message: "Renamed successfully" }),
  };

  const afs = new AFS().mount(module);

  const renameSpy = spyOn(module, "rename").mockResolvedValue({
    message: "Renamed successfully",
  });

  // Test successful rename
  expect(
    await afs.rename("/modules/test-module/foo", "/modules/test-module/bar"),
  ).toMatchInlineSnapshot(`
    {
      "message": "Renamed successfully",
    }
  `);

  expect(renameSpy.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "/foo",
        "/bar",
        undefined,
      ],
    ]
  `);

  // Test rename with options
  renameSpy.mockClear();
  await afs.rename("/modules/test-module/old", "/modules/test-module/new", { overwrite: true });

  expect(renameSpy.mock.lastCall).toMatchInlineSnapshot(`
    [
      "/old",
      "/new",
      {
        "overwrite": true,
      },
    ]
  `);
});

test("AFS should throw error when renaming across different modules", async () => {
  const moduleA: AFSModule = {
    name: "module-a",
    rename: async () => ({}),
  };

  const moduleB: AFSModule = {
    name: "module-b",
    rename: async () => ({}),
  };

  const afs = new AFS().mount(moduleA).mount(moduleB);

  // Test error when renaming across different modules
  expect(async () => await afs.rename("/modules/module-a/foo", "/modules/module-b/bar")).toThrow(
    "Cannot rename across different modules. Both paths must be in the same module.",
  );
});

test("AFS should throw error when renaming without rename support", async () => {
  const module: AFSModule = {
    name: "test-module",
  };

  const afs = new AFS().mount(module);

  // Test error when module doesn't support rename
  expect(
    async () => await afs.rename("/modules/test-module/foo", "/modules/test-module/bar"),
  ).toThrow("Module does not support rename operation: /modules/test-module");
});

test("AFS should throw error when renaming non-existent paths", async () => {
  const module: AFSModule = {
    name: "test-module",
    rename: async () => ({}),
  };

  const afs = new AFS().mount(module);

  // Test error when old path doesn't exist
  expect(async () => await afs.rename("/non-existent/foo", "/modules/test-module/bar")).toThrow(
    "Cannot rename across different modules. Both paths must be in the same module.",
  );

  // Test error when new path is in non-existent module
  expect(async () => await afs.rename("/modules/test-module/foo", "/non-existent/bar")).toThrow(
    "Cannot rename across different modules. Both paths must be in the same module.",
  );
});
