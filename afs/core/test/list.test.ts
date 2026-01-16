import { beforeEach, describe, expect, test } from "bun:test";
import { AFS, type AFSContextPreset } from "@aigne/afs";
import { JSONModule } from "./mocks/json-module.js";

let afs: AFS;
let testPreset: Required<AFSContextPreset>;

beforeEach(() => {
  testPreset = {
    view: "test-view",
    select: {
      invoke: async () => {
        return { data: ["/modules/module-a/fileA/content", "/modules/module-b/fileC/content"] };
      },
    },
    per: {
      invoke: async (input) => {
        return {
          data: {
            ...input.data,
            content: `Content of ${input.data.path}\n${input.data.content}`,
          },
        };
      },
    },
    dedupe: {
      invoke: async (input) => {
        return {
          data: input.data
            .map((i) => (typeof i === "object" && i && Reflect.get(i, "content")) || "")
            .filter(Boolean)
            .join("\n\n"),
        };
      },
    },
    format: "default",
  };

  const moduleA = new JSONModule({
    name: "module-a",
    description: "Module A",
    data: {
      fileA: { content: "Content A" },
      fileB: { content: "Content B" },
    },
  });

  const moduleB = new JSONModule({
    name: "module-b",
    description: "Module B",
    data: {
      fileC: { content: "Content C" },
    },
  });

  afs = new AFS({
    context: {
      list: {
        presets: {
          "test-preset": testPreset,
        },
      },
    },
  })
    .mount(moduleA)
    .mount(moduleB);
});

describe("list root path '/'", () => {
  test("with default maxDepth=1", async () => {
    const result = await afs.list("/");

    expect(result).toMatchInlineSnapshot(`
      {
        "data": [
          {
            "id": "modules",
            "path": "/modules",
            "summary": "All mounted modules",
          },
        ],
      }
    `);
  });

  test("with maxDepth=2", async () => {
    const result = await afs.list("/", { maxDepth: 2 });

    expect(result).toMatchInlineSnapshot(`
      {
        "data": [
          {
            "id": "modules",
            "path": "/modules",
            "summary": "All mounted modules",
          },
          {
            "id": "module-a",
            "path": "/modules/module-a",
            "summary": "Module A",
          },
          {
            "id": "module-b",
            "path": "/modules/module-b",
            "summary": "Module B",
          },
        ],
      }
    `);
  });

  test("with maxDepth=3", async () => {
    const result = await afs.list("/", { maxDepth: 3 });

    expect(result).toMatchInlineSnapshot(`
      {
        "data": [
          {
            "id": "modules",
            "path": "/modules",
            "summary": "All mounted modules",
          },
          {
            "content": undefined,
            "createdAt": undefined,
            "id": "/",
            "metadata": {
              "childrenCount": 2,
              "type": "directory",
            },
            "path": "/modules/module-a",
            "updatedAt": undefined,
          },
          {
            "content": undefined,
            "createdAt": undefined,
            "id": "/fileA",
            "metadata": {
              "childrenCount": 1,
              "type": "directory",
            },
            "path": "/modules/module-a/fileA",
            "updatedAt": undefined,
          },
          {
            "content": undefined,
            "createdAt": undefined,
            "id": "/fileB",
            "metadata": {
              "childrenCount": 1,
              "type": "directory",
            },
            "path": "/modules/module-a/fileB",
            "updatedAt": undefined,
          },
          {
            "content": undefined,
            "createdAt": undefined,
            "id": "/",
            "metadata": {
              "childrenCount": 1,
              "type": "directory",
            },
            "path": "/modules/module-b",
            "updatedAt": undefined,
          },
          {
            "content": undefined,
            "createdAt": undefined,
            "id": "/fileC",
            "metadata": {
              "childrenCount": 1,
              "type": "directory",
            },
            "path": "/modules/module-b/fileC",
            "updatedAt": undefined,
          },
        ],
      }
    `);
  });

  test("with maxDepth=4", async () => {
    const result = await afs.list("/", { maxDepth: 4 });

    expect(result).toMatchInlineSnapshot(`
      {
        "data": [
          {
            "id": "modules",
            "path": "/modules",
            "summary": "All mounted modules",
          },
          {
            "content": undefined,
            "createdAt": undefined,
            "id": "/",
            "metadata": {
              "childrenCount": 2,
              "type": "directory",
            },
            "path": "/modules/module-a",
            "updatedAt": undefined,
          },
          {
            "content": undefined,
            "createdAt": undefined,
            "id": "/fileA",
            "metadata": {
              "childrenCount": 1,
              "type": "directory",
            },
            "path": "/modules/module-a/fileA",
            "updatedAt": undefined,
          },
          {
            "content": undefined,
            "createdAt": undefined,
            "id": "/fileB",
            "metadata": {
              "childrenCount": 1,
              "type": "directory",
            },
            "path": "/modules/module-a/fileB",
            "updatedAt": undefined,
          },
          {
            "content": "Content A",
            "createdAt": undefined,
            "id": "/fileA/content",
            "metadata": {
              "childrenCount": undefined,
              "type": "file",
            },
            "path": "/modules/module-a/fileA/content",
            "updatedAt": undefined,
          },
          {
            "content": "Content B",
            "createdAt": undefined,
            "id": "/fileB/content",
            "metadata": {
              "childrenCount": undefined,
              "type": "file",
            },
            "path": "/modules/module-a/fileB/content",
            "updatedAt": undefined,
          },
          {
            "content": undefined,
            "createdAt": undefined,
            "id": "/",
            "metadata": {
              "childrenCount": 1,
              "type": "directory",
            },
            "path": "/modules/module-b",
            "updatedAt": undefined,
          },
          {
            "content": undefined,
            "createdAt": undefined,
            "id": "/fileC",
            "metadata": {
              "childrenCount": 1,
              "type": "directory",
            },
            "path": "/modules/module-b/fileC",
            "updatedAt": undefined,
          },
          {
            "content": "Content C",
            "createdAt": undefined,
            "id": "/fileC/content",
            "metadata": {
              "childrenCount": undefined,
              "type": "file",
            },
            "path": "/modules/module-b/fileC/content",
            "updatedAt": undefined,
          },
        ],
      }
    `);
  });

  test("with tree format", async () => {
    const result = await afs.list("/", { format: "tree" });

    expect(result).toMatchInlineSnapshot(`
      {
        "data": 
      "└── modules
      "
      ,
      }
    `);
  });

  test("with tree format and maxDepth=2", async () => {
    const result = await afs.list("/", { format: "tree", maxDepth: 2 });

    expect(result).toMatchInlineSnapshot(`
      {
        "data": 
      "└── modules
          ├── module-a
          └── module-b
      "
      ,
      }
    `);
  });

  test("with tree format and maxDepth=3", async () => {
    const result = await afs.list("/", { format: "tree", maxDepth: 3 });

    expect(result).toMatchInlineSnapshot(`
      {
        "data": 
      "└── modules
          ├── module-a [2 items]
          │   ├── fileA [1 items]
          │   └── fileB [1 items]
          └── module-b [1 items]
              └── fileC [1 items]
      "
      ,
      }
    `);
  });

  test("with tree format and maxDepth=4", async () => {
    const result = await afs.list("/", { format: "tree", maxDepth: 4 });

    expect(result).toMatchInlineSnapshot(`
      {
        "data": 
      "└── modules
          ├── module-a [2 items]
          │   ├── fileA [1 items]
          │   │   └── content
          │   └── fileB [1 items]
          │       └── content
          └── module-b [1 items]
              └── fileC [1 items]
                  └── content
      "
      ,
      }
    `);
  });

  test("with simple-list format", async () => {
    const result = await afs.list("/", { format: "simple-list" });

    expect(result).toMatchInlineSnapshot(`
      {
        "data": [
          "/modules",
        ],
      }
    `);
  });

  test("with simple-list format and maxDepth=2", async () => {
    const result = await afs.list("/", { format: "simple-list", maxDepth: 2 });

    expect(result).toMatchInlineSnapshot(`
      {
        "data": [
          "/modules",
          "/modules/module-a",
          "/modules/module-b",
        ],
      }
    `);
  });

  test("with simple-list format and maxDepth=3", async () => {
    const result = await afs.list("/", { format: "simple-list", maxDepth: 3 });

    expect(result).toMatchInlineSnapshot(`
      {
        "data": [
          "/modules",
          "/modules/module-a [2 items]",
          "/modules/module-a/fileA [1 items]",
          "/modules/module-a/fileB [1 items]",
          "/modules/module-b [1 items]",
          "/modules/module-b/fileC [1 items]",
        ],
      }
    `);
  });

  test("with simple-list format and maxDepth=4", async () => {
    const result = await afs.list("/", { format: "simple-list", maxDepth: 4 });

    expect(result).toMatchInlineSnapshot(`
      {
        "data": [
          "/modules",
          "/modules/module-a [2 items]",
          "/modules/module-a/fileA [1 items]",
          "/modules/module-a/fileB [1 items]",
          "/modules/module-a/fileA/content",
          "/modules/module-a/fileB/content",
          "/modules/module-b [1 items]",
          "/modules/module-b/fileC [1 items]",
          "/modules/module-b/fileC/content",
        ],
      }
    `);
  });
});

describe("list '/modules'", () => {
  test("should return all mounted modules", async () => {
    const result = await afs.list("/modules");

    expect(result).toMatchInlineSnapshot(`
      {
        "data": [
          {
            "id": "module-a",
            "path": "/modules/module-a",
            "summary": "Module A",
          },
          {
            "id": "module-b",
            "path": "/modules/module-b",
            "summary": "Module B",
          },
        ],
      }
    `);
  });
});

describe("list specific module '/modules/xxx'", () => {
  test("with default format", async () => {
    const result = await afs.list("/modules/module-a");

    expect(result).toMatchInlineSnapshot(`
      {
        "data": [
          {
            "content": undefined,
            "createdAt": undefined,
            "id": "/",
            "metadata": {
              "childrenCount": 2,
              "type": "directory",
            },
            "path": "/modules/module-a",
            "updatedAt": undefined,
          },
          {
            "content": undefined,
            "createdAt": undefined,
            "id": "/fileA",
            "metadata": {
              "childrenCount": 1,
              "type": "directory",
            },
            "path": "/modules/module-a/fileA",
            "updatedAt": undefined,
          },
          {
            "content": undefined,
            "createdAt": undefined,
            "id": "/fileB",
            "metadata": {
              "childrenCount": 1,
              "type": "directory",
            },
            "path": "/modules/module-a/fileB",
            "updatedAt": undefined,
          },
        ],
      }
    `);
  });

  test("with tree format", async () => {
    const result = await afs.list("/modules/module-a", { format: "tree" });

    expect(result.data).toMatchInlineSnapshot(
      `
        "└── modules
            └── module-a [2 items]
                ├── fileA [1 items]
                └── fileB [1 items]
        "
      `,
    );
  });

  test("with simple-list format", async () => {
    const result = await afs.list("/modules/module-a", { format: "simple-list" });

    expect(result.data).toMatchInlineSnapshot(`
      [
        "/modules/module-a [2 items]",
        "/modules/module-a/fileA [1 items]",
        "/modules/module-a/fileB [1 items]",
      ]
    `);
  });
});

describe("list with presets", () => {
  test("should apply preset correctly", async () => {
    const result = await afs.list("/modules", { preset: "test-preset" });

    expect(result).toMatchInlineSnapshot(`
      {
        "data": 
      "Content of /modules/module-a/fileA/content
      Content A

      Content of /modules/module-b/fileC/content
      Content C"
      ,
      }
    `);
  });

  test("should reject preset with tree format", async () => {
    await expect(
      afs.list("/modules", { preset: "test-preset", format: "tree" }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Tree format requires entries to be AFSEntry objects"`,
    );
  });
});
