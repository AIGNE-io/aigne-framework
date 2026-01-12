import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { AFS, type AFSEntry } from "@aigne/afs";
import { getAFSSkills } from "@aigne/core/prompt/skills/afs";

test("AFS'skill list should invoke afs.list", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const list = skills.find((i) => i.name === "afs_list");

  const listSpy = spyOn(afs, "list").mockResolvedValue({ data: [] });

  assert(list);
  expect(await list.invoke({ path: "/foo/bar", options: { maxDepth: 2 } })).toMatchInlineSnapshot(`
    {
      "data": [],
      "options": {
        "maxDepth": 2,
      },
      "path": "/foo/bar",
      "status": "success",
      "tool": "afs_list",
    }
  `);

  expect(listSpy.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "/foo/bar",
        {
          "format": "simple-list",
          "maxDepth": 2,
        },
      ],
    ]
  `);
});

test("AFS'skill list should use default maxDepth when not provided", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const list = skills.find((i) => i.name === "afs_list");

  const listSpy = spyOn(afs, "list").mockResolvedValue({ data: [] });

  assert(list);
  await list.invoke({ path: "/foo/bar" });

  expect(listSpy.mock.calls[0]).toMatchInlineSnapshot(`
    [
      "/foo/bar",
      {
        "format": "simple-list",
      },
    ]
  `);
});

test("AFS'skill list should return formatted tree structure", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const list = skills.find((i) => i.name === "afs_list");

  const mockList: AFSEntry[] = [
    { id: "file1.txt", path: "/foo/bar/file1.txt" },
    { id: "dir1", path: "/foo/bar/dir1", metadata: { childrenCount: 1 } },
    { id: "file2.txt", path: "/foo/bar/dir1/file2.txt" },
    { id: "agent1", path: "/agents/agent1", metadata: { execute: { name: "agent1" } } },
  ];

  spyOn(afs, "list").mockResolvedValue({ data: mockList });

  assert(list);
  const result = await list.invoke({ path: "/foo/bar" });

  expect(result).toMatchInlineSnapshot(`
    {
      "data": [
        {
          "id": "file1.txt",
          "path": "/foo/bar/file1.txt",
        },
        {
          "id": "dir1",
          "metadata": {
            "childrenCount": 1,
          },
          "path": "/foo/bar/dir1",
        },
        {
          "id": "file2.txt",
          "path": "/foo/bar/dir1/file2.txt",
        },
        {
          "id": "agent1",
          "metadata": {
            "execute": {
              "name": "agent1",
            },
          },
          "path": "/agents/agent1",
        },
      ],
      "path": "/foo/bar",
      "status": "success",
      "tool": "afs_list",
    }
  `);
});

test("AFS'skill list should handle empty directory", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const list = skills.find((i) => i.name === "afs_list");

  spyOn(afs, "list").mockResolvedValue({ data: [] });

  assert(list);
  const result = await list.invoke({ path: "/empty/dir" });

  expect(result.status).toBe("success");
  expect(result.tool).toBe("afs_list");
  expect(result.path).toBe("/empty/dir");
});

test("AFS'skill list should handle different maxDepth values", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const list = skills.find((i) => i.name === "afs_list");

  const listSpy = spyOn(afs, "list").mockResolvedValue({ data: [] });

  assert(list);

  // Test maxDepth: 1
  await list.invoke({ path: "/foo", options: { maxDepth: 1 } });
  expect(listSpy.mock.calls[0]?.[1]).toMatchObject({ maxDepth: 1 });

  // Test maxDepth: 3
  await list.invoke({ path: "/foo", options: { maxDepth: 3 } });
  expect(listSpy.mock.calls[1]?.[1]).toMatchObject({ maxDepth: 3 });

  // Test maxDepth: 0 (should list only immediate children)
  await list.invoke({ path: "/foo", options: { maxDepth: 0 } });
  expect(listSpy.mock.calls[2]?.[1]).toMatchObject({ maxDepth: 0 });
});
