import { expect, spyOn, test } from "bun:test";
import { AFS, type AFSModule, AFSReadonlyError } from "@aigne/afs";

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
    list: async () => ({ data: [] }),
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
    list: async () => ({ data: [] }),
  };

  const afs = new AFS().mount(module);

  const listSpy = spyOn(module, "list").mockResolvedValue({
    data: [
      { id: "foo", path: "/foo" },
      { id: "bar", path: "/bar" },
    ],
  });

  expect(await afs.list("/")).toMatchInlineSnapshot(`
    {
      "data": [
        {
          "id": "test-module",
          "path": "/modules",
          "summary": "Test Module",
        },
      ],
    }
  `);

  expect(await afs.list("/", { maxDepth: 2 })).toMatchInlineSnapshot(`
    {
      "data": [
        {
          "id": "test-module",
          "path": "/modules/test-module",
          "summary": "Test Module",
        },
      ],
    }
  `);

  expect(await afs.list("/", { maxDepth: 3 })).toMatchInlineSnapshot(`
    {
      "data": [
        {
          "id": "foo",
          "path": "/modules/test-module/foo",
        },
        {
          "id": "bar",
          "path": "/modules/test-module/bar",
        },
      ],
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
      "data": [],
    }
  `);

  listSpy.mockClear();
  expect(await afs.list("/foo", { maxDepth: 2 })).toMatchInlineSnapshot(`
    {
      "data": [],
    }
  `);
  expect(listSpy.mock.lastCall).toMatchInlineSnapshot(`undefined`);
});

test("AFS should search entries correctly", async () => {
  const module: AFSModule = {
    name: "test-module",
    search: async () => ({ data: [] }),
  };

  const afs = new AFS().mount(module);

  const searchSpy = spyOn(module, "search").mockResolvedValue({
    data: [
      { id: "foo", path: "/foo" },
      { id: "bar", path: "/bar" },
    ],
  });

  expect(await afs.search("/bar", "foo")).toMatchInlineSnapshot(`
    {
      "data": [],
    }
  `);

  expect(await afs.search("/", "foo")).toMatchInlineSnapshot(`
    {
      "data": [
        {
          "id": "foo",
          "path": "/modules/test-module/foo",
        },
        {
          "id": "bar",
          "path": "/modules/test-module/bar",
        },
      ],
    }
  `);

  expect(searchSpy.mock.lastCall).toMatchInlineSnapshot(`
    [
      "/",
      "foo",
      {},
    ]
  `);

  searchSpy.mockClear();
  expect(await afs.search("/foo/test-module/bar", "foo")).toMatchInlineSnapshot(`
    {
      "data": [],
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
    data: { id: "foo", path: "/foo", content: "Test Content" },
  });

  expect((await afs.read("/bar")).data).toMatchInlineSnapshot(`undefined`);

  expect((await afs.read("/foo/test-module/foo")).data).toMatchInlineSnapshot(`undefined`);

  expect(readSpy.mock.calls).toMatchInlineSnapshot(`[]`);
});

test("AFS should write entry correctly", async () => {
  const module: AFSModule = {
    name: "test-module",
    accessMode: "readwrite",
    write: async () => ({ data: { id: "foo", path: "/foo" } }),
  };

  const afs = new AFS().mount(module);

  const writeSpy = spyOn(module, "write").mockResolvedValue({
    data: { id: "foo", path: "/foo", content: "Written Content" },
  });

  expect((await afs.write("/modules/test-module/foo", {})).data).toMatchInlineSnapshot(`
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
    accessMode: "readwrite",
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
    accessMode: "readwrite",
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
    accessMode: "readwrite",
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
    accessMode: "readwrite",
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
    accessMode: "readwrite",
    rename: async () => ({}),
  };

  const moduleB: AFSModule = {
    name: "module-b",
    accessMode: "readwrite",
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
    accessMode: "readwrite",
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
    accessMode: "readwrite",
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

// Readonly tests
test("AFS should block write on readonly module (default)", async () => {
  const module: AFSModule = {
    name: "test-module",
    // accessMode defaults to readonly
    write: async () => ({ data: { id: "foo", path: "/foo" } }),
  };

  const afs = new AFS().mount(module);

  // Should throw AFSReadonlyError
  try {
    await afs.write("/modules/test-module/foo", { content: "test" });
    expect.unreachable("Should have thrown AFSReadonlyError");
  } catch (error) {
    expect(error).toBeInstanceOf(AFSReadonlyError);
    expect((error as AFSReadonlyError).code).toBe("AFS_READONLY");
    expect((error as AFSReadonlyError).message).toBe(
      "Module 'test-module' is readonly, cannot perform write to /modules/test-module/foo",
    );
  }
});

test("AFS should block delete on readonly module", async () => {
  const module: AFSModule = {
    name: "test-module",
    accessMode: "readonly",
    delete: async () => ({ message: "Deleted" }),
  };

  const afs = new AFS().mount(module);

  try {
    await afs.delete("/modules/test-module/foo");
    expect.unreachable("Should have thrown AFSReadonlyError");
  } catch (error) {
    expect(error).toBeInstanceOf(AFSReadonlyError);
    expect((error as AFSReadonlyError).code).toBe("AFS_READONLY");
    expect((error as AFSReadonlyError).message).toBe(
      "Module 'test-module' is readonly, cannot perform delete to /modules/test-module/foo",
    );
  }
});

test("AFS should block rename on readonly module", async () => {
  const module: AFSModule = {
    name: "test-module",
    accessMode: "readonly",
    rename: async () => ({ message: "Renamed" }),
  };

  const afs = new AFS().mount(module);

  try {
    await afs.rename("/modules/test-module/foo", "/modules/test-module/bar");
    expect.unreachable("Should have thrown AFSReadonlyError");
  } catch (error) {
    expect(error).toBeInstanceOf(AFSReadonlyError);
    expect((error as AFSReadonlyError).code).toBe("AFS_READONLY");
    expect((error as AFSReadonlyError).message).toBe(
      "Module 'test-module' is readonly, cannot perform rename to /modules/test-module/foo",
    );
  }
});

test("AFS should allow read operations on readonly module", async () => {
  const module: AFSModule = {
    name: "test-module",
    accessMode: "readonly",
    list: async () => ({ data: [{ id: "foo", path: "/foo" }] }),
    read: async () => ({ data: { id: "foo", path: "/foo", content: "test" } }),
    search: async () => ({ data: [{ id: "foo", path: "/foo" }] }),
  };

  const afs = new AFS().mount(module);

  // Read operations should work
  const listResult = await afs.list("/modules/test-module");
  expect(listResult.data.length).toBe(1);

  const readResult = await afs.read("/modules/test-module/foo");
  expect(readResult.data?.content).toBe("test");

  const searchResult = await afs.search("/modules/test-module", "foo");
  expect(searchResult.data.length).toBe(1);
});

test("AFS should allow write operations on readwrite module", async () => {
  const module: AFSModule = {
    name: "test-module",
    accessMode: "readwrite",
    write: async () => ({ data: { id: "foo", path: "/foo" } }),
    delete: async () => ({ message: "Deleted" }),
    rename: async () => ({ message: "Renamed" }),
  };

  const afs = new AFS().mount(module);

  // All operations should work
  const writeResult = await afs.write("/modules/test-module/foo", { content: "test" });
  expect(writeResult.data.id).toBe("foo");

  const deleteResult = await afs.delete("/modules/test-module/foo");
  expect(deleteResult.message).toBe("Deleted");

  const renameResult = await afs.rename("/modules/test-module/foo", "/modules/test-module/bar");
  expect(renameResult.message).toBe("Renamed");
});
