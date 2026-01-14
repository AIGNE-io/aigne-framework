import { expect, type Mock, spyOn, test } from "bun:test";
import assert from "node:assert";
import { AFS } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";
import { UserProfileMemory } from "@aigne/afs-user-profile-memory";
import { AIGNE } from "@aigne/core";
import { v7 } from "@aigne/uuid";

test("UserProfileMemory should update memory based on conversation", async () => {
  const aigne = new AIGNE();

  const userProfileMemory = new UserProfileMemory({});

  const afs = new AFS().mount(new AFSHistory()).mount(userProfileMemory);

  const historyModel = (await afs.listModules()).find((i) => i.module instanceof AFSHistory)?.path;
  assert(historyModel, "History model not found");

  spyOn(userProfileMemory.extractor, "process").mockReturnValueOnce({
    ops: [
      {
        op: "add",
        path: "/name",
        value: JSON.stringify([
          {
            name: "Bob",
          },
        ]),
      },
    ],
  });

  const updateProfileSpy = spyOn(userProfileMemory, "updateProfile");

  await afs.write(
    `${historyModel}/by-session/session-001/new`,
    {
      sessionId: v7(),
      content: { input: { message: "I'm Bob" }, output: { text: "Hello Bob!" } },
    },
    {
      context: aigne.newContext(),
    },
  );

  await waitMockCalled(updateProfileSpy);

  expect(
    (await userProfileMemory.search("/", "")).data.map((i) => i.content),
  ).toMatchInlineSnapshot(`
    [
      {
        "name": [
          {
            "name": "Bob",
          },
        ],
      },
    ]
  `);
});

async function waitMockCalled(spy: Mock<(...args: any[]) => any>, times = 1) {
  while (spy.mock.calls.length < times || spy.mock.results.length < times) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  await spy.mock.results[times - 1]?.value;
}
