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
      "offset": 0,
      "path": "/foo",
      "returnedLines": 1,
      "status": "success",
      "tool": "afs_read",
      "totalLines": 1,
      "truncated": false,
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
  expect(result.totalLines).toBe(2);
  expect(result.returnedLines).toBe(2);
  expect(result.truncated).toBe(false);
});

test("AFS'skill read should handle offset parameter", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const read = skills.find((i) => i.name === "afs_read");

  const fileContent = "line 1\nline 2\nline 3\nline 4\nline 5";
  spyOn(afs, "read").mockResolvedValue({
    data: {
      id: "test-id",
      path: "/test/file.txt",
      content: fileContent,
    },
  });

  assert(read);
  const result = await read.invoke({ path: "/test/file.txt", offset: 2 });

  expect(result.data?.content).toBe("line 3\nline 4\nline 5");
  expect(result.totalLines).toBe(5);
  expect(result.returnedLines).toBe(3);
  expect(result.offset).toBe(2);
  expect(result.truncated).toBe(true);
  expect(result.message).toContain("Showing lines 3-5 of 5");
});

test("AFS'skill read should handle limit parameter", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const read = skills.find((i) => i.name === "afs_read");

  const fileContent = "line 1\nline 2\nline 3\nline 4\nline 5";
  spyOn(afs, "read").mockResolvedValue({
    data: {
      id: "test-id",
      path: "/test/file.txt",
      content: fileContent,
    },
  });

  assert(read);
  const result = await read.invoke({ path: "/test/file.txt", limit: 3 });

  expect(result.data?.content).toBe("line 1\nline 2\nline 3");
  expect(result.totalLines).toBe(5);
  expect(result.returnedLines).toBe(3);
  expect(result.truncated).toBe(true);
  expect(result.message).toContain("Showing lines 1-3 of 5");
});

test("AFS'skill read should handle offset and limit together", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const read = skills.find((i) => i.name === "afs_read");

  const fileContent = "line 1\nline 2\nline 3\nline 4\nline 5";
  spyOn(afs, "read").mockResolvedValue({
    data: {
      id: "test-id",
      path: "/test/file.txt",
      content: fileContent,
    },
  });

  assert(read);
  const result = await read.invoke({ path: "/test/file.txt", offset: 1, limit: 2 });

  expect(result.data?.content).toBe("line 2\nline 3");
  expect(result.totalLines).toBe(5);
  expect(result.returnedLines).toBe(2);
  expect(result.offset).toBe(1);
  expect(result.truncated).toBe(true);
  expect(result.message).toContain("Showing lines 2-3 of 5");
});

test("AFS'skill read should truncate long lines", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const read = skills.find((i) => i.name === "afs_read");

  const longLine = "x".repeat(2500);
  const fileContent = `short line\n${longLine}\nanother short`;
  spyOn(afs, "read").mockResolvedValue({
    data: {
      id: "test-id",
      path: "/test/file.txt",
      content: fileContent,
    },
  });

  assert(read);
  const result = await read.invoke({ path: "/test/file.txt" });

  const lines = result.data?.content?.split("\n") ?? [];
  expect(lines[0]).toBe("short line");
  expect(lines[1]).toContain("... [truncated]");
  expect(lines[1]?.length).toBeLessThan(2100); // 2000 + "... [truncated]"
  expect(lines[2]).toBe("another short");
});

test("AFS'skill read formatOutput should return pure text content when data.content is string", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const read = skills.find((i) => i.name === "afs_read");

  assert(read);

  const output = {
    status: "success",
    tool: "afs_read",
    path: "/test/file.txt",
    data: {
      id: "test-id",
      path: "/test/file.txt",
      content: "Hello World\nThis is a test file",
    },
    totalLines: 2,
    returnedLines: 2,
    offset: 0,
    truncated: false,
  };

  const formatted = await read.formatOutput(output);
  expect(formatted).toBe("Hello World\nThis is a test file");
});

test("AFS'skill read formatOutput should return JSON when data is undefined", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const read = skills.find((i) => i.name === "afs_read");

  assert(read);

  const output = {
    status: "success",
    tool: "afs_read",
    path: "/nonexistent.txt",
    data: undefined,
  };

  const formatted = await read.formatOutput(output);
  expect(formatted).toMatchInlineSnapshot(`
    "status: success
    tool: afs_read
    path: /nonexistent.txt
    data: null
    "
  `);
});
