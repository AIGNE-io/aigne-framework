import { expect, type Mock, spyOn, test } from "bun:test";
import { AFS, AFSHistory } from "@aigne/afs";
import { UserProfileMemory } from "@aigne/afs-user-profile-memory";
import { AIGNE } from "@aigne/core";

test("UserProfileMemory should update memory based on conversation", async () => {
  const aigne = new AIGNE();

  const userProfileMemory = new UserProfileMemory({ context: aigne.newContext() });

  const afs = new AFS().mount(new AFSHistory()).mount(userProfileMemory);

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

  afs.emit("agentSucceed", { input: { message: "I'm Bob" }, output: { text: "Hello Bob!" } });

  await waitMockCalled(updateProfileSpy);

  expect(
    (await userProfileMemory.search("/", "")).list.map((i) => i.content),
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
