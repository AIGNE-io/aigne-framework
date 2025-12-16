import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { AFS } from "@aigne/afs";
import { getAFSSkills } from "@aigne/core/prompt/skills/afs";

test("AFS'skill write should invoke afs.write", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const write = skills.find((i) => i.name === "afs_write");

  const writeSpy = spyOn(afs, "write").mockResolvedValue({
    data: {
      id: "foo",
      path: "/foo",
      content: "bar",
    },
  });

  assert(write);
  expect(await write.invoke({ path: "/foo", content: "bar" })).toMatchInlineSnapshot(`
    {
      "data": {
        "content": "bar",
        "id": "foo",
        "path": "/foo",
      },
      "path": "/foo",
      "status": "success",
      "tool": "afs_write",
    }
  `);

  expect(writeSpy.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "/foo",
        {
          "content": "bar",
        },
        {
          "append": false,
        },
      ],
    ]
  `);
});

test("AFS'skill write should handle append mode", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const write = skills.find((i) => i.name === "afs_write");

  const writeSpy = spyOn(afs, "write").mockResolvedValue({
    data: {
      id: "foo",
      path: "/foo/test.txt",
      content: "existing content\nappended content",
    },
  });

  assert(write);
  await write.invoke({ path: "/foo/test.txt", content: "appended content", append: true });

  expect(writeSpy.mock.calls[0]?.[0]).toBe("/foo/test.txt");
  expect(writeSpy.mock.calls[0]?.[1]).toMatchObject({ content: "appended content" });
  expect(writeSpy.mock.calls[0]?.[2]).toMatchObject({ append: true });
});

test("AFS'skill write should overwrite by default", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const write = skills.find((i) => i.name === "afs_write");

  const writeSpy = spyOn(afs, "write").mockResolvedValue({
    data: {
      id: "foo",
      path: "/foo/test.txt",
      content: "new content",
    },
  });

  assert(write);
  await write.invoke({ path: "/foo/test.txt", content: "new content" });

  expect(writeSpy.mock.calls[0]?.[2]).toMatchObject({ append: false });
});

test("AFS'skill write should handle multiline content", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const write = skills.find((i) => i.name === "afs_write");

  const multilineContent = "line 1\nline 2\nline 3\nline 4";
  const writeSpy = spyOn(afs, "write").mockResolvedValue({
    data: {
      id: "test",
      path: "/test/file.txt",
      content: multilineContent,
    },
  });

  assert(write);
  const result = await write.invoke({ path: "/test/file.txt", content: multilineContent });

  expect(result.status).toBe("success");
  expect(result.data?.content).toBe(multilineContent);
  expect(writeSpy.mock.calls[0]?.[1]?.content).toBe(multilineContent);
});

test("AFS'skill write should handle empty content", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const write = skills.find((i) => i.name === "afs_write");

  const writeSpy = spyOn(afs, "write").mockResolvedValue({
    data: {
      id: "empty",
      path: "/test/empty.txt",
      content: "",
    },
  });

  assert(write);
  const result = await write.invoke({ path: "/test/empty.txt", content: "" });

  expect(result.status).toBe("success");
  expect(writeSpy.mock.calls[0]?.[1]?.content).toBe("");
});
