import { beforeEach, expect, spyOn, test } from "bun:test";
import { AFS, type AFSContextPreset, type AFSModule } from "@aigne/afs";
import { JSONModule } from "./mocks/json-module.js";

let afs: AFS;
let preset: Required<AFSContextPreset>;

beforeEach(() => {
  preset = {
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
      search: {
        presets: {
          "test-preset": preset,
        },
      },
    },
  })
    .mount(moduleA)
    .mount(moduleB);
});

test("AFS search with preset should produce correct results", async () => {
  const selectSpy = spyOn(preset.select, "invoke");
  const perSpy = spyOn(preset.per, "invoke");
  const dedupeSpy = spyOn(preset.dedupe, "invoke");

  const options = { context: { test: true } };

  expect(await afs.search("/", "", { ...options, preset: "test-preset" })).toMatchInlineSnapshot(`
    {
      "data": 
    "Content of /modules/module-a/fileA/content
    Content A

    Content of /modules/module-b/fileC/content
    Content C"
    ,
    }
  `);

  expect(selectSpy.mock.lastCall?.[1]).toEqual(expect.objectContaining(options));
  expect(perSpy.mock.lastCall?.[1]).toEqual(expect.objectContaining(options));
  expect(dedupeSpy.mock.lastCall?.[1]).toEqual(expect.objectContaining(options));
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
