import { beforeEach, expect, test } from "bun:test";
import { AFS, type AFSContextPreset } from "@aigne/afs";
import { JSONModule } from "./mocks/json-module.js";

let afs: AFS;
let testPreset: Required<AFSContextPreset>;

beforeEach(() => {
  const module = new JSONModule({
    name: "test-module",
    data: {
      children: {
        foo: {
          content: "This is foo",
          children: {
            nested: {
              content: "Nested content",
            },
          },
        },
        bar: {
          content: "This is bar",
        },
        baz: {
          content: "This is baz",
        },
      },
    },
  });

  testPreset = {
    view: "test-view",
    select: {
      invoke: async () => {
        return { data: ["/modules/test-module/foo", "/modules/test-module/bar"] };
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

  afs = new AFS({
    context: {
      list: {
        presets: {
          "test-preset": testPreset,
        },
      },
    },
  }).mount(module);
});

test("AFS list should return correct structure with default format", async () => {
  expect((await afs.list("/modules/test-module", {})).data).toMatchInlineSnapshot(`
    [
      {
        "content": undefined,
        "description": undefined,
        "id": "/",
        "metadata": {
          "childrenCount": 3,
          "type": "directory",
        },
        "path": "/modules/test-module",
        "summary": undefined,
      },
      {
        "content": "This is foo",
        "description": undefined,
        "id": "/foo",
        "metadata": {
          "childrenCount": 1,
          "type": "directory",
        },
        "path": "/modules/test-module/foo",
        "summary": undefined,
      },
      {
        "content": "This is bar",
        "description": undefined,
        "id": "/bar",
        "metadata": {
          "childrenCount": undefined,
          "type": "file",
        },
        "path": "/modules/test-module/bar",
        "summary": undefined,
      },
      {
        "content": "This is baz",
        "description": undefined,
        "id": "/baz",
        "metadata": {
          "childrenCount": undefined,
          "type": "file",
        },
        "path": "/modules/test-module/baz",
        "summary": undefined,
      },
    ]
  `);

  expect((await afs.list("/", { maxDepth: 10 })).data).toMatchInlineSnapshot(`
    [
      {
        "content": undefined,
        "description": undefined,
        "id": "/",
        "metadata": {
          "childrenCount": 3,
          "type": "directory",
        },
        "path": "/modules/test-module",
        "summary": undefined,
      },
      {
        "content": "This is foo",
        "description": undefined,
        "id": "/foo",
        "metadata": {
          "childrenCount": 1,
          "type": "directory",
        },
        "path": "/modules/test-module/foo",
        "summary": undefined,
      },
      {
        "content": "This is bar",
        "description": undefined,
        "id": "/bar",
        "metadata": {
          "childrenCount": undefined,
          "type": "file",
        },
        "path": "/modules/test-module/bar",
        "summary": undefined,
      },
      {
        "content": "This is baz",
        "description": undefined,
        "id": "/baz",
        "metadata": {
          "childrenCount": undefined,
          "type": "file",
        },
        "path": "/modules/test-module/baz",
        "summary": undefined,
      },
      {
        "content": "Nested content",
        "description": undefined,
        "id": "/foo/nested",
        "metadata": {
          "childrenCount": undefined,
          "type": "file",
        },
        "path": "/modules/test-module/foo/nested",
        "summary": undefined,
      },
    ]
  `);
});

test("AFS list should return correct tree structure", async () => {
  expect((await afs.list("/modules/test-module", { format: "tree" })).data).toMatchInlineSnapshot(
    `
      "└── modules
          └── test-module [3 items]
              ├── foo [1 items]
              ├── bar
              └── baz
      "
    `,
  );

  expect((await afs.list("/", { format: "tree", maxDepth: 10 })).data).toMatchInlineSnapshot(`
    "└── modules
        └── test-module [3 items]
            ├── foo [1 items]
            │   └── nested
            ├── bar
            └── baz
    "
  `);
});

test("AFS list should return correct simple-list structure", async () => {
  expect(
    (await afs.list("/modules/test-module", { format: "simple-list" })).data,
  ).toMatchInlineSnapshot(`
    [
      "/modules/test-module [3 items]",
      "/modules/test-module/foo [1 items]",
      "/modules/test-module/bar",
      "/modules/test-module/baz",
    ]
  `);

  expect(
    (await afs.list("/", { format: "simple-list", maxDepth: 10 })).data,
  ).toMatchInlineSnapshot(`
    [
      "/modules/test-module [3 items]",
      "/modules/test-module/foo [1 items]",
      "/modules/test-module/bar",
      "/modules/test-module/baz",
      "/modules/test-module/foo/nested",
    ]
  `);
});

test("AFS list should apply preset correctly", async () => {
  expect(await afs.list("/modules/test-module", { preset: "test-preset" })).toMatchInlineSnapshot(`
    {
      "data": 
    "Content of /modules/test-module/foo
    This is foo

    Content of /modules/test-module/bar
    This is bar"
    ,
    }
    `);
});

test("AFS list should apply preset correctly", async () => {
  expect(
    afs.list("/modules/test-module", { preset: "test-preset", format: "tree" }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Tree format requires entries to be AFSEntry objects"`,
  );
});
