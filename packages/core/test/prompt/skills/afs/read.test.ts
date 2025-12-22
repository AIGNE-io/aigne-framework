import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { AFS } from "@aigne/afs";
import { getAFSSkills } from "@aigne/core/prompt/skills/afs";

test("AFS'skill read should invoke afs.read", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const read = skills.find((i) => i.name === "afs_read");

  const readSpy = spyOn(afs, "read").mockResolvedValue({
    data: { id: "foo", path: "/foo", content: "bar" },
  });

  assert(read);
  expect(await read.invoke({ path: "/foo" })).toMatchInlineSnapshot(`
    {
      "data": {
        "content": "bar",
        "id": "foo",
        "path": "/foo",
      },
      "path": "/foo",
      "status": "success",
      "tool": "afs_read",
    }
  `);

  expect(readSpy.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "/foo",
      ],
    ]
  `);
});

test("AFS'skill read should handle withLineNumbers option", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const read = skills.find((i) => i.name === "afs_read");

  spyOn(afs, "read").mockResolvedValue({
    data: {
      id: "foo",
      path: "/foo/test.txt",
      content: "line 1\nline 2\nline 3",
    },
  });

  assert(read);
  const result = await read.invoke({ path: "/foo/test.txt", withLineNumbers: true });

  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "content": 
    "1| line 1
    2| line 2
    3| line 3"
    ,
        "id": "foo",
        "path": "/foo/test.txt",
      },
      "path": "/foo/test.txt",
      "status": "success",
      "tool": "afs_read",
      "withLineNumbers": true,
    }
  `);
});

test("AFS'skill read should handle file not found", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const read = skills.find((i) => i.name === "afs_read");

  spyOn(afs, "read").mockResolvedValue({
    data: undefined,
  });

  assert(read);
  const result = await read.invoke({ path: "/nonexistent.txt" });

  expect(result.status).toBe("success");
  expect(result.tool).toBe("afs_read");
  expect(result.result).toBeUndefined();
});

test("AFS'skill read should return file content", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const read = skills.find((i) => i.name === "afs_read");

  const fileContent = "Hello World\nThis is a test file";
  spyOn(afs, "read").mockResolvedValue({
    data: {
      id: "test-id",
      path: "/test/file.txt",
      content: fileContent,
    },
  });

  assert(read);
  const result = await read.invoke({ path: "/test/file.txt" });

  expect(result.data?.content).toBe(fileContent);
  expect(result.data?.path).toBe("/test/file.txt");
});
