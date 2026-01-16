import { beforeEach, describe, expect, test } from "bun:test";
import { AFS } from "@aigne/afs";
import { JSONModule } from "./mocks/json-module.js";

let afs: AFS;

beforeEach(() => {
  const moduleA = new JSONModule({
    name: "module-a",
    description: "Module A",
    data: {
      fileA: { content: "Content A" },
      fileB: { content: "Content B" },
      nested: {
        deep: { value: "Deep Value" },
      },
    },
  });

  afs = new AFS().mount(moduleA);
});

describe("read", () => {
  test("should read file entry", async () => {
    const result = await afs.read("/modules/module-a/fileA/content");

    expect(result.data).toMatchInlineSnapshot(`
      {
        "content": "Content A",
        "createdAt": undefined,
        "id": "/fileA/content",
        "metadata": {
          "childrenCount": undefined,
          "type": "file",
        },
        "path": "/modules/module-a/fileA/content",
        "updatedAt": undefined,
      }
    `);
  });

  test("should read directory entry", async () => {
    const result = await afs.read("/modules/module-a/fileA");

    expect(result.data).toMatchInlineSnapshot(`
      {
        "content": undefined,
        "createdAt": undefined,
        "id": "/fileA",
        "metadata": {
          "childrenCount": 1,
          "type": "directory",
        },
        "path": "/modules/module-a/fileA",
        "updatedAt": undefined,
      }
    `);
  });

  test("should read nested entry", async () => {
    const result = await afs.read("/modules/module-a/nested/deep/value");

    expect(result.data).toMatchInlineSnapshot(`
      {
        "content": "Deep Value",
        "createdAt": undefined,
        "id": "/nested/deep/value",
        "metadata": {
          "childrenCount": undefined,
          "type": "file",
        },
        "path": "/modules/module-a/nested/deep/value",
        "updatedAt": undefined,
      }
    `);
  });

  test("should return undefined for non-existent path", async () => {
    const result = await afs.read("/modules/module-a/nonexistent");

    expect(result.data).toBeUndefined();
    expect(result.message).toMatch(/not found/i);
  });

  test("should return undefined for non-existent module", async () => {
    const result = await afs.read("/modules/nonexistent/foo");

    expect(result.data).toBeUndefined();
  });
});
