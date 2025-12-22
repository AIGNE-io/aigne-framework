import { beforeEach, expect, spyOn, test } from "bun:test";
import { AFS, type AFSContextPreset } from "@aigne/afs";
import { JSONModule } from "./mocks/json-module.js";

let afs: AFS;
let preset: Required<AFSContextPreset>;

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

  preset = {
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
      search: {
        presets: {
          "test-preset": preset,
        },
      },
    },
  }).mount(module);
});

test("AFS search with preset should produce correct results", async () => {
  const selectSpy = spyOn(preset.select, "invoke");
  const perSpy = spyOn(preset.per, "invoke");
  const dedupeSpy = spyOn(preset.dedupe, "invoke");

  const options = { context: { test: true } };

  expect(await afs.search("/", "", { ...options, preset: "test-preset" })).toMatchInlineSnapshot(`
    {
      "data": 
    "Content of /modules/test-module/foo
    This is foo

    Content of /modules/test-module/bar
    This is bar"
    ,
    }
  `);

  expect(selectSpy.mock.lastCall?.[1]).toEqual(expect.objectContaining(options));
  expect(perSpy.mock.lastCall?.[1]).toEqual(expect.objectContaining(options));
  expect(dedupeSpy.mock.lastCall?.[1]).toEqual(expect.objectContaining(options));
});
