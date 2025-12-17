import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AFS } from "@aigne/afs";
import { LocalFS } from "@aigne/afs-local-fs";

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

test("AFS'skill list should respect gitignore by default", async () => {
  expect(
    (await gitAFS.list("/modules/project", { maxDepth: 3, format: "tree" })).data,
  ).toMatchInlineSnapshot(`
    "└── modules
        └── project [5 items]
            ├── .gitignore
            ├── README.md
            ├── index.js
            ├── src [3 items]
            │   ├── .gitignore
            │   ├── main.js
            │   └── utils [1 items]
            │       └── helper.js
            └── tests [1 items]
                └── test.spec.js
    "
  `);

  expect(
    (await gitAFS.list("/modules/project/src", { maxDepth: 3, format: "tree" })).data,
  ).toMatchInlineSnapshot(`
    "└── modules
        └── project
            └── src [3 items]
                ├── .gitignore
                ├── main.js
                └── utils [1 items]
                    └── helper.js
    "
  `);
});

test("AFS'skill list should show all files when gitignore is disabled", async () => {
  const result = await gitAFS.list("/modules/project", {
    maxDepth: 3,
    disableGitignore: true,
    format: "tree",
  });

  expect(result.data).toMatchInlineSnapshot(`
    "└── modules
        └── project [10 items]
            ├── .env
            ├── .git [0 items]
            ├── .gitignore
            ├── README.md
            ├── build [1 items]
            │   └── output.js
            ├── debug.log
            ├── index.js
            ├── node_modules [1 items]
            │   └── package.json
            ├── src [6 items]
            │   ├── .gitignore
            │   ├── data.cache
            │   ├── debug.log
            │   ├── main.js
            │   ├── test.tmp
            │   └── utils [2 items]
            │       ├── helper.js
            │       └── test.tmp
            └── tests [1 items]
                └── test.spec.js
    "
  `);
});

test("AFS'skill list should handle nested .gitignore files correctly", async () => {
  const result = await gitAFS.list("/modules/project/src", { maxDepth: 2, format: "tree" });

  expect(result.data).toMatchInlineSnapshot(`
    "└── modules
        └── project
            └── src [3 items]
                ├── .gitignore
                ├── main.js
                └── utils [1 items]
                    └── helper.js
    "
  `);
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

  // Test with maxChildren: 5 to limit children at each level
  const result = await testAFS.list("/modules/nested-test", {
    maxDepth: 2,
    maxChildren: 5,
    format: "tree",
  });

  // Verify the result structure with inline snapshot
  expect(result.data).toMatchInlineSnapshot(`
    "└── modules
        └── nested-test [11 items, truncated]
            ├── dir0 [8 items, truncated]
            │   ├── file0.txt
            │   ├── file1.txt
            │   ├── file2.txt
            │   ├── file3.txt
            │   └── file4.txt
            ├── dir1 [8 items, truncated]
            │   ├── file0.txt
            │   ├── file1.txt
            │   ├── file2.txt
            │   ├── file3.txt
            │   └── file4.txt
            ├── dir2 [8 items, truncated]
            │   ├── file0.txt
            │   ├── file1.txt
            │   ├── file2.txt
            │   ├── file3.txt
            │   └── file4.txt
            ├── dir3 [8 items, truncated]
            │   ├── file0.txt
            │   ├── file1.txt
            │   ├── file2.txt
            │   ├── file3.txt
            │   └── file4.txt
            └── dir4 [8 items, truncated]
                ├── file0.txt
                ├── file1.txt
                ├── file2.txt
                ├── file3.txt
                └── file4.txt
    "
  `);

  // Cleanup
  await rm(nestedDir, { recursive: true, force: true });
});
