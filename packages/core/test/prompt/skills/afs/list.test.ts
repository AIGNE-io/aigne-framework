import { afterAll, beforeAll, expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AFS, type AFSEntry } from "@aigne/afs";
import { LocalFS } from "@aigne/afs-local-fs";
import { getAFSSkills } from "@aigne/core/prompt/skills/afs";

let gitTestDir: string;
let gitAFS: AFS;

beforeAll(async () => {
  // Create a complex test directory structure with multiple .gitignore files
  gitTestDir = join(tmpdir(), `afs-gitignore-test-${Date.now()}`);
  await mkdir(gitTestDir, { recursive: true });
  await mkdir(join(gitTestDir, ".git"), { recursive: true });

  // Create root .gitignore
  await writeFile(
    join(gitTestDir, ".gitignore"),
    `*.log
node_modules/
.env
build/
`,
  );

  // Create root level files
  await writeFile(join(gitTestDir, "README.md"), "# Project");
  await writeFile(join(gitTestDir, "index.js"), "console.log('main')");
  await writeFile(join(gitTestDir, "debug.log"), "debug info"); // should be ignored
  await writeFile(join(gitTestDir, ".env"), "SECRET=123"); // should be ignored

  // Create build directory (should be ignored)
  await mkdir(join(gitTestDir, "build"), { recursive: true });
  await writeFile(join(gitTestDir, "build", "output.js"), "built file");

  // Create node_modules directory (should be ignored)
  await mkdir(join(gitTestDir, "node_modules"), { recursive: true });
  await writeFile(join(gitTestDir, "node_modules", "package.json"), "{}");

  // Create src directory with its own .gitignore
  await mkdir(join(gitTestDir, "src"), { recursive: true });
  await writeFile(
    join(gitTestDir, "src", ".gitignore"),
    `*.tmp
*.cache
`,
  );
  await writeFile(join(gitTestDir, "src", "main.js"), "main code");
  await writeFile(join(gitTestDir, "src", "test.tmp"), "temp file"); // should be ignored by src/.gitignore
  await writeFile(join(gitTestDir, "src", "data.cache"), "cache data"); // should be ignored by src/.gitignore
  await writeFile(join(gitTestDir, "src", "debug.log"), "src debug"); // should be ignored by root .gitignore

  // Create src/utils subdirectory
  await mkdir(join(gitTestDir, "src", "utils"), { recursive: true });
  await writeFile(join(gitTestDir, "src", "utils", "helper.js"), "helper code");
  await writeFile(join(gitTestDir, "src", "utils", "test.tmp"), "utils temp"); // should be ignored

  // Create tests directory
  await mkdir(join(gitTestDir, "tests"), { recursive: true });
  await writeFile(join(gitTestDir, "tests", "test.spec.js"), "test code");

  // Initialize AFS with LocalFS
  const localFS = new LocalFS({ name: "project", localPath: gitTestDir });
  gitAFS = new AFS();
  gitAFS.mount(localFS);
});

afterAll(async () => {
  // Clean up test directory
  await rm(gitTestDir, { recursive: true, force: true });
});

test("AFS'skill list should invoke afs.list", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const list = skills.find((i) => i.name === "afs_list");

  const listSpy = spyOn(afs, "list").mockResolvedValue({ list: [] });

  assert(list);
  expect(await list.invoke({ path: "/foo/bar", options: { maxDepth: 2 } })).toMatchInlineSnapshot(`
    {
      "options": {
        "maxDepth": 2,
      },
      "path": "/foo/bar",
      "result": "",
      "status": "success",
      "tool": "afs_list",
    }
  `);

  expect(listSpy.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "/foo/bar",
        {
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

  const listSpy = spyOn(afs, "list").mockResolvedValue({ list: [] });

  assert(list);
  await list.invoke({ path: "/foo/bar" });

  expect(listSpy.mock.calls[0]).toMatchInlineSnapshot(`
    [
      "/foo/bar",
      undefined,
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

  spyOn(afs, "list").mockResolvedValue({ list: mockList });

  assert(list);
  const result = await list.invoke({ path: "/foo/bar" });

  expect(result).toMatchInlineSnapshot(`
    {
      "path": "/foo/bar",
      "result": 
    "├── foo
    │   └── bar
    │       ├── file1.txt
    │       └── dir1 [1 items]
    │           └── file2.txt
    └── agents
        └── agent1 [executable]
    "
    ,
      "status": "success",
      "tool": "afs_list",
    }
  `);
});

test("AFS'skill list should handle empty directory", async () => {
  const afs = new AFS();
  const skills = await getAFSSkills(afs);
  const list = skills.find((i) => i.name === "afs_list");

  spyOn(afs, "list").mockResolvedValue({ list: [] });

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

  const listSpy = spyOn(afs, "list").mockResolvedValue({ list: [] });

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

test("AFS'skill list should respect gitignore by default", async () => {
  const skills = await getAFSSkills(gitAFS);
  const list = skills.find((i) => i.name === "afs_list");

  assert(list);

  expect(
    (await list.invoke({ path: "/modules/project", options: { maxDepth: 3 } })).result,
  ).toMatchInlineSnapshot(`
    "└── modules
        └── project
            ├── tests [1 items]
            │   └── test.spec.js
            ├── index.js
            ├── README.md
            ├── .gitignore
            ├── .git
            └── src [3 items]
                ├── utils [1 items]
                │   └── helper.js
                ├── main.js
                └── .gitignore
    "
  `);

  expect(
    (await list.invoke({ path: "/modules/project/src", options: { maxDepth: 3 } })).result,
  ).toMatchInlineSnapshot(`
    "└── modules
        └── project
            └── src
                ├── utils [1 items]
                │   └── helper.js
                ├── main.js
                └── .gitignore
    "
  `);
});

test("AFS'skill list should show all files when gitignore is disabled", async () => {
  const skills = await getAFSSkills(gitAFS);
  const list = skills.find((i) => i.name === "afs_list");

  assert(list);
  const result = await list.invoke({
    path: "/modules/project",
    options: { maxDepth: 3, disableGitignore: true },
  });

  expect(result.status).toBe("success");
  expect(result.tool).toBe("afs_list");

  expect(result.result).toMatchInlineSnapshot(`
    "└── modules
        └── project
            ├── node_modules [1 items]
            │   └── package.json
            ├── tests [1 items]
            │   └── test.spec.js
            ├── index.js
            ├── README.md
            ├── .gitignore
            ├── .env
            ├── debug.log
            ├── build [1 items]
            │   └── output.js
            ├── .git
            └── src [6 items]
                ├── test.tmp
                ├── utils [2 items]
                │   ├── test.tmp
                │   └── helper.js
                ├── main.js
                ├── .gitignore
                ├── debug.log
                └── data.cache
    "
  `);
});

test("AFS'skill list should handle nested .gitignore files correctly", async () => {
  const skills = await getAFSSkills(gitAFS);
  const list = skills.find((i) => i.name === "afs_list");

  assert(list);
  const result = await list.invoke({ path: "/modules/project/src", options: { maxDepth: 2 } });

  expect(result.status).toBe("success");

  expect(result.result).toMatchInlineSnapshot(`
    "└── modules
        └── project
            └── src
                ├── utils [1 items]
                │   └── helper.js
                ├── main.js
                └── .gitignore
    "
  `);
});

test("AFS'skill list should pass disableGitignore option through to underlying AFS", async () => {
  const skills = await getAFSSkills(gitAFS);
  const list = skills.find((i) => i.name === "afs_list");

  const listSpy = spyOn(gitAFS, "list");

  assert(list);
  await list.invoke({
    path: "/modules/project",
    options: { maxDepth: 2, disableGitignore: true },
  });

  // Verify that disableGitignore was passed to afs.list
  expect(listSpy.mock.calls[0]?.[1]).toMatchObject({
    maxDepth: 2,
    disableGitignore: true,
  });
});

test("AFS'skill list should handle maxChildren with nested directories", async () => {
  // Create a test directory with nested structure
  const nestedDir = join(tmpdir(), `afs-nested-maxchildren-test-${Date.now()}`);
  await mkdir(nestedDir, { recursive: true });

  // Create multiple directories at root level
  for (let i = 0; i < 8; i++) {
    await mkdir(join(nestedDir, `dir${i}`), { recursive: true });
    // Create files in each directory
    for (let j = 0; j < 8; j++) {
      await writeFile(join(nestedDir, `dir${i}`, `file${j}.txt`), `content ${i}-${j}`);
    }
  }

  // Create some root-level files
  for (let i = 0; i < 3; i++) {
    await writeFile(join(nestedDir, `root${i}.txt`), `root content ${i}`);
  }

  const localFS = new LocalFS({ name: "nested-test", localPath: nestedDir });
  const testAFS = new AFS();
  testAFS.mount(localFS);

  const skills = await getAFSSkills(testAFS);
  const list = skills.find((i) => i.name === "afs_list");

  assert(list);

  // Test with maxChildren: 5 to limit children at each level
  const result = await list.invoke({
    path: "/modules/nested-test",
    options: { maxDepth: 2, maxChildren: 5 },
  });

  expect(result.status).toBe("success");
  expect(result.tool).toBe("afs_list");

  // Verify the result structure with inline snapshot
  expect(result.result).toMatchInlineSnapshot(`
    "└── modules
        └── nested-test
            ├── dir2 [8 items, truncated]
            │   ├── file2.txt
            │   ├── file3.txt
            │   ├── file1.txt
            │   ├── file0.txt
            │   └── file4.txt
            ├── dir5 [8 items, truncated]
            │   ├── file2.txt
            │   ├── file3.txt
            │   ├── file1.txt
            │   ├── file0.txt
            │   └── file4.txt
            ├── dir4 [8 items, truncated]
            │   ├── file2.txt
            │   ├── file3.txt
            │   ├── file1.txt
            │   ├── file0.txt
            │   └── file4.txt
            ├── dir3 [8 items, truncated]
            │   ├── file2.txt
            │   ├── file3.txt
            │   ├── file1.txt
            │   ├── file0.txt
            │   └── file4.txt
            └── root1.txt
    "
  `);

  // Cleanup
  await rm(nestedDir, { recursive: true, force: true });
});
