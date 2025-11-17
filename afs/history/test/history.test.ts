import { expect, test } from "bun:test";
import assert from "node:assert";
import { AFS } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";

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
