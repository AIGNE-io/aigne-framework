import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { AFS } from "@aigne/afs";
import { getAFSSkills } from "@aigne/core/prompt/skills/afs";

test("AFS'skill edit should invoke afs.read and afs.write", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const editSkill = skills.find((i) => i.name === "afs_edit");

  const originalContent = "line 1\nline 2\nline 3\nline 4";
  const readSpy = spyOn(afs, "read").mockResolvedValue({
    data: { id: "foo", path: "/foo/test.txt", content: originalContent },
  });

  const writeSpy = spyOn(afs, "write").mockResolvedValue({
    data: {
      id: "foo",
      path: "/foo/test.txt",
      content: "line 1\nreplaced line\nline 3\nline 4",
    },
  });

  assert(editSkill);
  const result = await editSkill.invoke({
    path: "/foo/test.txt",
    patches: [
      {
        start_line: 1,
        end_line: 2,
        replace: "replaced line",
        delete: false,
      },
    ],
  });

  expect(result.status).toBe("success");
  expect(result.tool).toBe("afs_edit");
  expect(result.path).toBe("/foo/test.txt");
  expect(result.data).toMatchInlineSnapshot(`
    "line 1
    replaced line
    line 3
    line 4"
  `);

  expect(readSpy.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "/foo/test.txt",
      ],
    ]
  `);

  expect(writeSpy.mock.calls[0]?.[0]).toBe("/foo/test.txt");
  expect(writeSpy.mock.calls[0]?.[1]).toMatchObject({
    content: "line 1\nreplaced line\nline 3\nline 4",
  });
});

test("AFS'skill edit should handle delete patches", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const editSkill = skills.find((i) => i.name === "afs_edit");

  const originalContent = "line 1\nline 2\nline 3\nline 4";
  spyOn(afs, "read").mockResolvedValue({
    data: { id: "foo", path: "/foo/test.txt", content: originalContent },
  });

  spyOn(afs, "write").mockResolvedValue({
    data: { id: "foo", path: "/foo/test.txt", content: "" },
  });

  assert(editSkill);
  const result = await editSkill.invoke({
    path: "/foo/test.txt",
    patches: [
      {
        start_line: 1,
        end_line: 3,
        delete: true,
      },
    ],
  });

  expect(result.data).toMatchInlineSnapshot(`
    "line 1
    line 4"
  `);
});

test("AFS'skill edit should handle multiple patches", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const editSkill = skills.find((i) => i.name === "afs_edit");

  const originalContent = "line 1\nline 2\nline 3\nline 4\nline 5";
  spyOn(afs, "read").mockResolvedValue({
    data: { id: "foo", path: "/foo/test.txt", content: originalContent },
  });

  spyOn(afs, "write").mockResolvedValue({
    data: { id: "foo", path: "/foo/test.txt", content: "" },
  });

  assert(editSkill);
  const result = await editSkill.invoke({
    path: "/foo/test.txt",
    patches: [
      {
        start_line: 1,
        end_line: 2,
        replace: "new line 2",
        delete: false,
      },
      {
        start_line: 3,
        end_line: 4,
        delete: true,
      },
    ],
  });

  expect(result.data).toMatchInlineSnapshot(`
    "line 1
    new line 2
    line 3
    line 5"
  `);
});

test("AFS'skill edit should handle multi-line replacement", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const editSkill = skills.find((i) => i.name === "afs_edit");

  const originalContent = "line 1\nline 2\nline 3\nline 4";
  spyOn(afs, "read").mockResolvedValue({
    data: { id: "foo", path: "/foo/test.txt", content: originalContent },
  });

  spyOn(afs, "write").mockResolvedValue({
    data: { id: "foo", path: "/foo/test.txt", content: "" },
  });

  assert(editSkill);
  const result = await editSkill.invoke({
    path: "/foo/test.txt",
    patches: [
      {
        start_line: 1,
        end_line: 3,
        replace: "new line 2a\nnew line 2b\nnew line 3a",
        delete: false,
      },
    ],
  });

  expect(result.data).toMatchInlineSnapshot(`
    "line 1
    new line 2a
    new line 2b
    new line 3a
    line 4"
  `);
});

test("AFS'skill edit should adjust line numbers for subsequent patches", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const editSkill = skills.find((i) => i.name === "afs_edit");

  const originalContent = "line 1\nline 2\nline 3\nline 4\nline 5\nline 6";
  spyOn(afs, "read").mockResolvedValue({
    data: { id: "foo", path: "/foo/test.txt", content: originalContent },
  });

  spyOn(afs, "write").mockResolvedValue({
    data: { id: "foo", path: "/foo/test.txt", content: "" },
  });

  assert(editSkill);
  // First patch deletes 2 lines (lines 1-2), which shifts everything down
  // Second patch should work on the adjusted line numbers
  const result = await editSkill.invoke({
    path: "/foo/test.txt",
    patches: [
      {
        start_line: 1,
        end_line: 3,
        delete: true,
      },
      {
        start_line: 3, // This is line 5 in the original file
        end_line: 4,
        replace: "replaced line",
        delete: false,
      },
    ],
  });

  expect(result.data).toMatchInlineSnapshot(`
    "line 1
    replaced line
    line 5
    line 6"
  `);
});

test("AFS'skill edit should throw error when no patches provided", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const editSkill = skills.find((i) => i.name === "afs_edit");

  assert(editSkill);

  try {
    await editSkill.invoke({
      path: "/foo/test.txt",
      patches: [],
    });
    expect(true).toBe(false); // Should not reach here
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain("Array must contain at least 1 element(s)");
  }
});

test("AFS'skill edit should throw error when file cannot be read", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const editSkill = skills.find((i) => i.name === "afs_edit");

  spyOn(afs, "read").mockResolvedValue({
    data: undefined,
  });

  assert(editSkill);

  try {
    await editSkill.invoke({
      path: "/foo/nonexistent.txt",
      patches: [
        {
          start_line: 0,
          end_line: 1,
          delete: true,
        },
      ],
    });
    expect(true).toBe(false); // Should not reach here
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe("Cannot read file content from: /foo/nonexistent.txt");
  }
});
