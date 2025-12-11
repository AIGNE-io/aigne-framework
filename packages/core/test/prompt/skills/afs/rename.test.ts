import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { AFS } from "@aigne/afs";
import { getAFSSkills } from "@aigne/core/prompt/skills/afs";

test("AFS'skill rename should invoke afs.rename", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const renameSkill = skills.find((i) => i.name === "afs_rename");

  const renameSpy = spyOn(afs, "rename").mockResolvedValue({
    message: "Renamed successfully",
  });

  assert(renameSkill);
  expect(
    await renameSkill.invoke({ oldPath: "/foo/old.txt", newPath: "/foo/new.txt" }),
  ).toMatchInlineSnapshot(`
    {
      "message": "Renamed successfully",
      "newPath": "/foo/new.txt",
      "oldPath": "/foo/old.txt",
      "status": "success",
      "tool": "afs_rename",
    }
  `);

  expect(renameSpy.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "/foo/old.txt",
        "/foo/new.txt",
        {
          "overwrite": false,
        },
      ],
    ]
  `);
});

test("AFS'skill rename should handle overwrite option", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const renameSkill = skills.find((i) => i.name === "afs_rename");

  const renameSpy = spyOn(afs, "rename").mockResolvedValue({
    message: "Renamed successfully",
  });

  assert(renameSkill);
  await renameSkill.invoke({
    oldPath: "/foo/old.txt",
    newPath: "/foo/new.txt",
    overwrite: true,
  });

  expect(renameSpy.mock.lastCall).toMatchInlineSnapshot(`
    [
      "/foo/old.txt",
      "/foo/new.txt",
      {
        "overwrite": true,
      },
    ]
  `);
});

test("AFS'skill rename should not overwrite by default", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const renameSkill = skills.find((i) => i.name === "afs_rename");

  const renameSpy = spyOn(afs, "rename").mockResolvedValue({
    message: "Renamed successfully",
  });

  assert(renameSkill);
  await renameSkill.invoke({ oldPath: "/test/a.txt", newPath: "/test/b.txt" });

  expect(renameSpy.mock.calls[0]?.[2]).toMatchObject({ overwrite: false });
});

test("AFS'skill rename should handle directory rename", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const renameSkill = skills.find((i) => i.name === "afs_rename");

  const renameSpy = spyOn(afs, "rename").mockResolvedValue({
    message: "Directory renamed",
  });

  assert(renameSkill);
  const result = await renameSkill.invoke({
    oldPath: "/foo/old-dir",
    newPath: "/foo/new-dir",
  });

  expect(result.status).toBe("success");
  expect(result.message).toBe("Directory renamed");
  expect(renameSpy.mock.calls[0]?.[0]).toBe("/foo/old-dir");
  expect(renameSpy.mock.calls[0]?.[1]).toBe("/foo/new-dir");
});

test("AFS'skill rename should handle move to different directory", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const renameSkill = skills.find((i) => i.name === "afs_rename");

  spyOn(afs, "rename").mockResolvedValue({
    message: "File moved",
  });

  assert(renameSkill);
  const result = await renameSkill.invoke({
    oldPath: "/foo/file.txt",
    newPath: "/bar/file.txt",
  });

  expect(result.status).toBe("success");
  expect(result.oldPath).toBe("/foo/file.txt");
  expect(result.newPath).toBe("/bar/file.txt");
});

test("AFS'skill rename should handle rename with overwrite", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const renameSkill = skills.find((i) => i.name === "afs_rename");

  const renameSpy = spyOn(afs, "rename").mockResolvedValue({
    message: "File overwritten",
  });

  assert(renameSkill);
  const result = await renameSkill.invoke({
    oldPath: "/test/source.txt",
    newPath: "/test/target.txt",
    overwrite: true,
  });

  expect(result.status).toBe("success");
  expect(renameSpy.mock.calls[0]?.[2]?.overwrite).toBe(true);
});
