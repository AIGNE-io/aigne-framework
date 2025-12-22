import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { AFS, type AFSEntry } from "@aigne/afs";
import { getAFSSkills } from "@aigne/core/prompt/skills/afs";

test("AFS'skill search should invoke afs.search", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const search = skills.find((i) => i.name === "afs_search");

  const mockResults: AFSEntry[] = [
    { id: "file1", path: "/foo/bar/file1.txt" },
    { id: "file2", path: "/foo/bar/file2.txt" },
  ];

  const searchSpy = spyOn(afs, "search").mockResolvedValue({
    data: mockResults,
  });

  assert(search);
  expect(await search.invoke({ path: "/foo/bar", query: "test" })).toMatchInlineSnapshot(`
    {
      "data": [
        {
          "id": "file1",
          "path": "/foo/bar/file1.txt",
        },
        {
          "id": "file2",
          "path": "/foo/bar/file2.txt",
        },
      ],
      "path": "/foo/bar",
      "query": "test",
      "status": "success",
      "tool": "afs_search",
    }
  `);

  expect(searchSpy.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "/foo/bar",
        "test",
        undefined,
      ],
    ]
  `);
});

test("AFS'skill search should handle case-sensitive option", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const search = skills.find((i) => i.name === "afs_search");

  const searchSpy = spyOn(afs, "search").mockResolvedValue({
    data: [],
  });

  assert(search);
  await search.invoke({
    path: "/foo",
    query: "Test",
    options: { caseSensitive: true },
  });

  expect(searchSpy.mock.calls[0]?.[0]).toBe("/foo");
  expect(searchSpy.mock.calls[0]?.[1]).toBe("Test");
  expect(searchSpy.mock.calls[0]?.[2]).toMatchObject({ caseSensitive: true });
});

test("AFS'skill search should handle limit option", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const search = skills.find((i) => i.name === "afs_search");

  const searchSpy = spyOn(afs, "search").mockResolvedValue({
    data: [],
  });

  assert(search);
  await search.invoke({
    path: "/foo",
    query: "test",
    options: { limit: 10 },
  });

  expect(searchSpy.mock.calls[0]?.[2]).toMatchObject({ limit: 10 });
});

test("AFS'skill search should handle both caseSensitive and limit options", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const search = skills.find((i) => i.name === "afs_search");

  const searchSpy = spyOn(afs, "search").mockResolvedValue({
    data: [],
  });

  assert(search);
  const result = await search.invoke({
    path: "/test",
    query: "pattern",
    options: { caseSensitive: true, limit: 5 },
  });

  expect(result.status).toBe("success");
  expect(result.tool).toBe("afs_search");
  expect(result.options).toMatchObject({ caseSensitive: true, limit: 5 });
  expect(searchSpy.mock.calls[0]?.[2]).toMatchObject({
    caseSensitive: true,
    limit: 5,
  });
});

test("AFS'skill search should return empty list when no results found", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const search = skills.find((i) => i.name === "afs_search");

  spyOn(afs, "search").mockResolvedValue({
    data: [],
  });

  assert(search);
  const result = await search.invoke({ path: "/foo", query: "nonexistent" });

  expect(result.status).toBe("success");
  expect(result.data).toEqual([]);
});

test("AFS'skill search should include message when provided", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const search = skills.find((i) => i.name === "afs_search");

  spyOn(afs, "search").mockResolvedValue({
    data: [],
    message: "Search completed with 0 results",
  });

  assert(search);
  const result = await search.invoke({ path: "/foo", query: "test" });

  expect(result.message).toBe("Search completed with 0 results");
});

test("AFS'skill search should return multiple results", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const search = skills.find((i) => i.name === "afs_search");

  const mockResults: AFSEntry[] = [
    { id: "1", path: "/src/file1.ts" },
    { id: "2", path: "/src/file2.ts" },
    { id: "3", path: "/src/utils/helper.ts" },
  ];

  spyOn(afs, "search").mockResolvedValue({
    data: mockResults,
  });

  assert(search);
  const result = await search.invoke({ path: "/src", query: "function" });

  expect(result.status).toBe("success");
  expect(result.data).toHaveLength(3);
  expect(result.data[0]?.path).toBe("/src/file1.ts");
  expect(result.data[2]?.path).toBe("/src/utils/helper.ts");
});
