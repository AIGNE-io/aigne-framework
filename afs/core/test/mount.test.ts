import { expect, test } from "bun:test";
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
