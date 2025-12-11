import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { AFS } from "@aigne/afs";
import { getAFSSkills } from "@aigne/core/prompt/skills/afs";

test("AFS'skill delete should invoke afs.delete", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const deleteSkill = skills.find((i) => i.name === "afs_delete");

  const deleteSpy = spyOn(afs, "delete").mockResolvedValue({
    message: "Deleted successfully",
  });

  assert(deleteSkill);
  expect(await deleteSkill.invoke({ path: "/foo/bar" })).toMatchInlineSnapshot(`
    {
      "message": "Deleted successfully",
      "path": "/foo/bar",
      "status": "success",
      "tool": "afs_delete",
    }
  `);

  expect(deleteSpy.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "/foo/bar",
        {
          "recursive": false,
        },
      ],
    ]
  `);
});

test("AFS'skill delete should handle recursive option", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const deleteSkill = skills.find((i) => i.name === "afs_delete");

  const deleteSpy = spyOn(afs, "delete").mockResolvedValue({
    message: "Deleted successfully",
  });

  assert(deleteSkill);
  await deleteSkill.invoke({ path: "/foo/bar", recursive: true });

  expect(deleteSpy.mock.lastCall).toMatchInlineSnapshot(`
    [
      "/foo/bar",
      {
        "recursive": true,
      },
    ]
  `);
});

test("AFS'skill delete should delete file by default (non-recursive)", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const deleteSkill = skills.find((i) => i.name === "afs_delete");

  const deleteSpy = spyOn(afs, "delete").mockResolvedValue({
    message: "File deleted",
  });

  assert(deleteSkill);
  await deleteSkill.invoke({ path: "/foo/file.txt" });

  expect(deleteSpy.mock.calls[0]?.[1]).toMatchObject({ recursive: false });
});

test("AFS'skill delete should handle directory deletion with recursive flag", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const deleteSkill = skills.find((i) => i.name === "afs_delete");

  const deleteSpy = spyOn(afs, "delete").mockResolvedValue({
    message: "Directory deleted recursively",
  });

  assert(deleteSkill);
  const result = await deleteSkill.invoke({ path: "/foo/directory", recursive: true });

  expect(result.status).toBe("success");
  expect(result.message).toBe("Directory deleted recursively");
  expect(deleteSpy.mock.calls[0]?.[0]).toBe("/foo/directory");
  expect(deleteSpy.mock.calls[0]?.[1]?.recursive).toBe(true);
});

test("AFS'skill delete should return appropriate message", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const deleteSkill = skills.find((i) => i.name === "afs_delete");

  spyOn(afs, "delete").mockResolvedValue({
    message: "Custom delete message",
  });

  assert(deleteSkill);
  const result = await deleteSkill.invoke({ path: "/test/path" });

  expect(result.message).toBe("Custom delete message");
  expect(result.tool).toBe("afs_delete");
});
