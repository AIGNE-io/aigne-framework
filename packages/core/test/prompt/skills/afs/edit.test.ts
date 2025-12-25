import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { AFS } from "@aigne/afs";
import { getAFSSkills } from "@aigne/core/prompt/skills/afs";

test("AFS edit should replace oldString with newString", async () => {
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
    oldString: "line 2",
    newString: "replaced line",
  });

  expect(result.status).toBe("success");
  expect(result.tool).toBe("afs_edit");
  expect(result.path).toBe("/foo/test.txt");
  expect(result.snippet).toMatchInlineSnapshot(`
    "   1| line 1
       2| replaced line
       3| line 3
       4| line 4"
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

test("AFS edit should handle multi-line replacement", async () => {
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
    oldString: "line 2\nline 3",
    newString: "new line 2a\nnew line 2b\nnew line 3a",
  });

  expect(result.snippet).toMatchInlineSnapshot(`
    "   1| line 1
       2| new line 2a
       3| new line 2b
       4| new line 3a
       5| line 4"
  `);
});

test("AFS edit should delete text when newString is empty", async () => {
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
    oldString: "line 2\n",
    newString: "",
  });

  expect(result.snippet).toMatchInlineSnapshot(`
    "   1| line 1
       2| line 3
       3| line 4"
  `);
});

test("AFS edit should replace all occurrences when replaceAll is true", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const editSkill = skills.find((i) => i.name === "afs_edit");

  const originalContent = "foo bar foo baz foo";
  spyOn(afs, "read").mockResolvedValue({
    data: { id: "foo", path: "/foo/test.txt", content: originalContent },
  });

  spyOn(afs, "write").mockResolvedValue({
    data: { id: "foo", path: "/foo/test.txt", content: "" },
  });

  assert(editSkill);
  const result = await editSkill.invoke({
    path: "/foo/test.txt",
    oldString: "foo",
    newString: "qux",
    replaceAll: true,
  });

  expect(result.snippet).toMatchInlineSnapshot(`"   1| qux bar qux baz qux"`);
  expect(result.message).toContain("3 occurrences");
});

test("AFS edit should throw error when oldString equals newString", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const editSkill = skills.find((i) => i.name === "afs_edit");

  assert(editSkill);

  try {
    await editSkill.invoke({
      path: "/foo/test.txt",
      oldString: "same text",
      newString: "same text",
    });
    expect(true).toBe(false); // Should not reach here
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe("oldString and newString must be different");
  }
});

test("AFS edit should throw error when oldString not found", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const editSkill = skills.find((i) => i.name === "afs_edit");

  const originalContent = "line 1\nline 2\nline 3";
  spyOn(afs, "read").mockResolvedValue({
    data: { id: "foo", path: "/foo/test.txt", content: originalContent },
  });

  assert(editSkill);

  try {
    await editSkill.invoke({
      path: "/foo/test.txt",
      oldString: "nonexistent text",
      newString: "replacement",
    });
    expect(true).toBe(false); // Should not reach here
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe("oldString not found in file: /foo/test.txt");
  }
});

test("AFS edit should throw error when oldString appears multiple times without replaceAll", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const editSkill = skills.find((i) => i.name === "afs_edit");

  const originalContent = "foo bar foo baz foo";
  spyOn(afs, "read").mockResolvedValue({
    data: { id: "foo", path: "/foo/test.txt", content: originalContent },
  });

  assert(editSkill);

  try {
    await editSkill.invoke({
      path: "/foo/test.txt",
      oldString: "foo",
      newString: "qux",
    });
    expect(true).toBe(false); // Should not reach here
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain("appears 3 times");
    expect((error as Error).message).toContain("replaceAll=true");
  }
});

test("AFS edit should throw error when file cannot be read", async () => {
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
      oldString: "some text",
      newString: "new text",
    });
    expect(true).toBe(false); // Should not reach here
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe("Cannot read file content from: /foo/nonexistent.txt");
  }
});

test("AFS edit should preserve indentation exactly", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const editSkill = skills.find((i) => i.name === "afs_edit");

  const originalContent = "function foo() {\n  const x = 1;\n  return x;\n}";
  spyOn(afs, "read").mockResolvedValue({
    data: { id: "foo", path: "/foo/test.ts", content: originalContent },
  });

  spyOn(afs, "write").mockResolvedValue({
    data: { id: "foo", path: "/foo/test.ts", content: "" },
  });

  assert(editSkill);
  const result = await editSkill.invoke({
    path: "/foo/test.ts",
    oldString: "  const x = 1;",
    newString: "  const x = 42;\n  const y = 100;",
  });

  expect(result.snippet).toMatchInlineSnapshot(`
    "   1| function foo() {
       2|   const x = 42;
       3|   const y = 100;
       4|   return x;
       5| }"
  `);
});
