import { beforeEach, describe, expect, test } from "bun:test";
import { AFS, type AFSEntry, AFSReadonlyError } from "@aigne/afs";
import { JSONModule } from "./mocks/json-module.js";

let readonlyAFS: AFS;
let readwriteAFS: AFS;

beforeEach(() => {
  const readonlyModule = new JSONModule({
    name: "readonly-module",
    description: "Readonly Module",
    accessMode: "readonly",
    data: {
      fileA: { content: "Content A" },
      fileB: { content: "Content B" },
    },
  });

  const readwriteModule = new JSONModule({
    name: "readwrite-module",
    description: "Readwrite Module",
    accessMode: "readwrite",
    data: {
      fileA: { content: "Content A" },
      fileB: { content: "Content B" },
    },
  });

  readonlyAFS = new AFS().mount(readonlyModule);
  readwriteAFS = new AFS().mount(readwriteModule);
});

describe("readonly module", () => {
  test("should block write operations", async () => {
    try {
      await readonlyAFS.write("/modules/readonly-module/fileA/content", { content: "New Content" });
      expect.unreachable("Should have thrown AFSReadonlyError");
    } catch (error) {
      expect(error).toBeInstanceOf(AFSReadonlyError);
      expect((error as AFSReadonlyError).code).toBe("AFS_READONLY");
      expect((error as AFSReadonlyError).message).toContain("readonly");
      expect((error as AFSReadonlyError).message).toContain("write");
    }
  });

  test("should block delete operations", async () => {
    try {
      await readonlyAFS.delete("/modules/readonly-module/fileA/content");
      expect.unreachable("Should have thrown AFSReadonlyError");
    } catch (error) {
      expect(error).toBeInstanceOf(AFSReadonlyError);
      expect((error as AFSReadonlyError).code).toBe("AFS_READONLY");
      expect((error as AFSReadonlyError).message).toContain("readonly");
      expect((error as AFSReadonlyError).message).toContain("delete");
    }
  });

  test("should block rename operations", async () => {
    try {
      await readonlyAFS.rename(
        "/modules/readonly-module/fileA/content",
        "/modules/readonly-module/renamed/content",
      );
      expect.unreachable("Should have thrown AFSReadonlyError");
    } catch (error) {
      expect(error).toBeInstanceOf(AFSReadonlyError);
      expect((error as AFSReadonlyError).code).toBe("AFS_READONLY");
      expect((error as AFSReadonlyError).message).toContain("readonly");
      expect((error as AFSReadonlyError).message).toContain("rename");
    }
  });

  test("should allow read operations", async () => {
    const result = await readonlyAFS.read("/modules/readonly-module/fileA/content");

    expect(result.data?.content).toBe("Content A");
  });

  test("should allow list operations", async () => {
    const result = await readonlyAFS.list("/modules/readonly-module");

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data.some((entry: AFSEntry) => entry.path.includes("fileA"))).toBe(true);
  });

  test("should allow search operations", async () => {
    const result = await readonlyAFS.search("/modules/readonly-module", "Content A");

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data.some((entry: AFSEntry) => entry.content === "Content A")).toBe(true);
  });
});

describe("readwrite module", () => {
  test("should allow write operations", async () => {
    const result = await readwriteAFS.write("/modules/readwrite-module/fileA/content", {
      content: "Updated Content",
    });

    expect(result.data?.content).toBe("Updated Content");

    // Verify the write
    const readResult = await readwriteAFS.read("/modules/readwrite-module/fileA/content");
    expect(readResult.data?.content).toBe("Updated Content");
  });

  test("should allow delete operations", async () => {
    const result = await readwriteAFS.delete("/modules/readwrite-module/fileA/content");

    expect(result.message).toContain("Successfully deleted");

    // Verify the delete
    const readResult = await readwriteAFS.read("/modules/readwrite-module/fileA/content");
    expect(readResult.data).toBeUndefined();
  });

  test("should allow rename operations", async () => {
    const result = await readwriteAFS.rename(
      "/modules/readwrite-module/fileA/content",
      "/modules/readwrite-module/renamed/content",
    );

    expect(result.message).toContain("Successfully renamed");

    // Verify old path doesn't exist
    const oldRead = await readwriteAFS.read("/modules/readwrite-module/fileA/content");
    expect(oldRead.data).toBeUndefined();

    // Verify new path exists
    const newRead = await readwriteAFS.read("/modules/readwrite-module/renamed/content");
    expect(newRead.data?.content).toBe("Content A");
  });

  test("should allow all read operations", async () => {
    // Read
    const readResult = await readwriteAFS.read("/modules/readwrite-module/fileA/content");
    expect(readResult.data?.content).toBe("Content A");

    // List
    const listResult = await readwriteAFS.list("/modules/readwrite-module");
    expect(listResult.data.length).toBeGreaterThan(0);

    // Search
    const searchResult = await readwriteAFS.search("/modules/readwrite-module", "Content A");
    expect(searchResult.data.length).toBeGreaterThan(0);
  });
});

describe("default access mode", () => {
  test("should default to readonly when accessMode is not specified", async () => {
    // Use a plain AFSModule without accessMode specified
    const defaultModule = {
      name: "default-module",
      // accessMode is undefined, should default to readonly
      write: async () => ({ data: { id: "foo", path: "/foo" } }),
    };

    const defaultAFS = new AFS().mount(defaultModule);

    try {
      await defaultAFS.write("/modules/default-module/foo", { content: "New Content" });
      expect.unreachable("Should have thrown AFSReadonlyError");
    } catch (error) {
      expect(error).toBeInstanceOf(AFSReadonlyError);
    }
  });
});
