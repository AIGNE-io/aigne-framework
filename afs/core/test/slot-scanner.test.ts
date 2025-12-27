import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { rmSync } from "node:fs";
import { SQLiteMetadataStore } from "../src/metadata/index.js";
import { SlotScanner } from "../src/slot-scanner.js";
import type { AFSModule } from "../src/type.js";

// Mock module for testing
class MockModule implements AFSModule {
  readonly name = "test-module";
  private files = new Map<string, string>();

  async read(path: string) {
    const content = this.files.get(path);
    return content ? { data: { id: path, path, content } } : { data: undefined };
  }

  async write(path: string, payload: { content: string }) {
    this.files.set(path, payload.content);
    return { data: { id: path, path, content: payload.content } };
  }
}

describe("SlotScanner", () => {
  const testDbPath = ".test-slot-scanner.db";
  let metadataStore: SQLiteMetadataStore;
  let scanner: SlotScanner;
  let module: MockModule;

  beforeEach(() => {
    metadataStore = new SQLiteMetadataStore({ url: `file:${testDbPath}` });
    scanner = new SlotScanner(metadataStore);
    module = new MockModule();
  });

  afterEach(() => {
    rmSync(testDbPath, { force: true });
  });

  describe("Basic slot parsing", () => {
    test("should parse single image slot", async () => {
      const content = `
# Document

Some text here.

<!-- afs:image id="hero" desc="A beautiful sunset over mountains" -->

More text.
`;

      const slots = await scanner.scan(module, "/test.md", content, "rev1");

      expect(slots.length).toBe(1);
      const slot = slots[0];
      expect(slot).toBeDefined();
      expect(slot?.id).toBe("hero");
      expect(slot?.desc).toBe("A beautiful sunset over mountains");
      expect(slot?.key).toBeUndefined();
      expect(slot?.intentKey).toBeDefined();
      expect(slot?.assetPath).toBe(`/.afs/images/by-intent/${slot?.intentKey}`);
    });

    test("should parse multiple image slots", async () => {
      const content = `
<!-- afs:image id="img1" desc="First image" -->
<!-- afs:image id="img2" desc="Second image" -->
<!-- afs:image id="img3" desc="Third image" -->
`;

      const slots = await scanner.scan(module, "/multi.md", content, "rev1");

      expect(slots.length).toBe(3);
      expect(slots[0]?.id).toBe("img1");
      expect(slots[1]?.id).toBe("img2");
      expect(slots[2]?.id).toBe("img3");
    });

    test("should parse slot with explicit key", async () => {
      const content = `<!-- afs:image id="logo" key="company-logo" desc="Company brand logo" -->`;

      const slots = await scanner.scan(module, "/test.md", content, "rev1");

      expect(slots.length).toBe(1);
      expect(slots[0]?.key).toBe("company-logo");
      expect(slots[0]?.intentKey).toBe("company-logo"); // Explicit key takes precedence
    });

    test("should handle slots with various id formats", async () => {
      const content = `
<!-- afs:image id="simple" desc="Test" -->
<!-- afs:image id="with-dash" desc="Test" -->
<!-- afs:image id="with_underscore" desc="Test" -->
<!-- afs:image id="with.dot" desc="Test" -->
<!-- afs:image id="mix-all_these.123" desc="Test" -->
`;

      const slots = await scanner.scan(module, "/test.md", content, "rev1");

      expect(slots.length).toBe(5);
      expect(slots.map((s) => s.id)).toEqual([
        "simple",
        "with-dash",
        "with_underscore",
        "with.dot",
        "mix-all_these.123",
      ]);
    });
  });

  describe("IntentKey computation", () => {
    test("should generate same intentKey for same description", async () => {
      const content1 = `<!-- afs:image id="img1" desc="A red car" -->`;
      const content2 = `<!-- afs:image id="img2" desc="A red car" -->`;

      const slots1 = await scanner.scan(module, "/doc1.md", content1, "rev1");
      const slots2 = await scanner.scan(module, "/doc2.md", content2, "rev1");

      expect(slots1[0]?.intentKey).toBe(slots2[0]?.intentKey);
    });

    test("should generate same intentKey for descriptions differing only in whitespace/case", async () => {
      const content1 = `<!-- afs:image id="img1" desc="A Beautiful Sunset" -->`;
      const content2 = `<!-- afs:image id="img2" desc="a  beautiful   sunset" -->`;

      const slots1 = await scanner.scan(module, "/doc1.md", content1, "rev1");
      const slots2 = await scanner.scan(module, "/doc2.md", content2, "rev1");

      // Normalization: trim, lowercase, collapse spaces
      expect(slots1[0]?.intentKey).toBe(slots2[0]?.intentKey);
    });

    test("should generate different intentKey for different descriptions", async () => {
      const content = `
<!-- afs:image id="img1" desc="A red car" -->
<!-- afs:image id="img2" desc="A blue car" -->
`;

      const slots = await scanner.scan(module, "/test.md", content, "rev1");

      expect(slots[0]?.intentKey).not.toBe(slots[1]?.intentKey);
    });

    test("should use explicit key instead of hash", async () => {
      const content1 = `<!-- afs:image id="img1" key="shared-logo" desc="Company logo" -->`;
      const content2 = `<!-- afs:image id="img2" key="shared-logo" desc="Brand logo" -->`;

      const slots1 = await scanner.scan(module, "/doc1.md", content1, "rev1");
      const slots2 = await scanner.scan(module, "/doc2.md", content2, "rev1");

      // Same explicit key = same intentKey, even though descriptions differ
      expect(slots1[0]?.intentKey).toBe("shared-logo");
      expect(slots2[0]?.intentKey).toBe("shared-logo");
      expect(slots1[0]?.intentKey).toBe(slots2[0]?.intentKey);
    });
  });

  describe("Error handling", () => {
    test("should reject duplicate slot ids within same document", async () => {
      const content = `
<!-- afs:image id="dup" desc="First" -->
<!-- afs:image id="dup" desc="Second" -->
`;

      await expect(scanner.scan(module, "/test.md", content, "rev1")).rejects.toThrow(
        'Duplicate slot id "dup"',
      );
    });

    test("should allow same id in different documents", async () => {
      const content = `<!-- afs:image id="hero" desc="Test" -->`;

      const slots1 = await scanner.scan(module, "/doc1.md", content, "rev1");
      const slots2 = await scanner.scan(module, "/doc2.md", content, "rev1");

      expect(slots1.length).toBe(1);
      expect(slots2.length).toBe(1);
      expect(slots1[0]?.id).toBe("hero");
      expect(slots2[0]?.id).toBe("hero");
    });

    test("should skip malformed slots", async () => {
      const content = `
<!-- afs:image id="valid" desc="This is valid" -->
<!-- afs:image desc="Missing id" -->
<!-- afs:image id="missing-desc" -->
<!-- not a valid slot at all -->
`;

      const slots = await scanner.scan(module, "/test.md", content, "rev1");

      // Only the valid one should be parsed
      expect(slots.length).toBe(1);
      expect(slots[0]?.id).toBe("valid");
    });
  });

  describe("Database integration", () => {
    test("should upsert slot metadata to database", async () => {
      const content = `<!-- afs:image id="test-img" desc="Test image" -->`;

      await scanner.scan(module, "/test.md", content, "rev1");

      const slot = await metadataStore.getSlot(module.name, "/test.md", "test-img");

      expect(slot).toBeDefined();
      expect(slot?.slotId).toBe("test-img");
      expect(slot?.ownerPath).toBe("/test.md");
      expect(slot?.desc).toBe("Test image");
      expect(slot?.slotType).toBe("image");
    });

    test("should create image node in source_metadata", async () => {
      const content = `<!-- afs:image id="test" desc="Test" -->`;

      const slots = await scanner.scan(module, "/test.md", content, "rev1");
      const slot = slots[0];
      expect(slot).toBeDefined();
      const imagePath = slot?.assetPath;

      const sourceMeta = await metadataStore.getSourceMetadata(module.name, imagePath ?? "");

      expect(sourceMeta).toBeDefined();
      expect(sourceMeta?.kind).toBe("image");
      expect(sourceMeta?.sourceRevision).toBe(`intent:${slot?.intentKey}`);
      expect(sourceMeta?.driversHint).toContain("image-generate");
    });

    test("should update slot when content changes", async () => {
      const content1 = `<!-- afs:image id="img" desc="Old description" -->`;
      const content2 = `<!-- afs:image id="img" desc="New description" -->`;

      await scanner.scan(module, "/test.md", content1, "rev1");
      await scanner.scan(module, "/test.md", content2, "rev2");

      const slot = await metadataStore.getSlot(module.name, "/test.md", "img");

      expect(slot?.desc).toBe("New description");
      expect(slot?.ownerRevision).toBe("rev2");
    });

    test("should list all slots for a document", async () => {
      const content = `
<!-- afs:image id="img1" desc="First" -->
<!-- afs:image id="img2" desc="Second" -->
<!-- afs:image id="img3" desc="Third" -->
`;

      await scanner.scan(module, "/test.md", content, "rev1");

      const slots = await metadataStore.listSlots(module.name, "/test.md");

      expect(slots.length).toBe(3);
      expect(slots.map((s) => s.slotId).sort()).toEqual(["img1", "img2", "img3"]);
    });

    test("should query slot by asset path", async () => {
      const content = `<!-- afs:image id="test" desc="Test image" -->`;

      const slots = await scanner.scan(module, "/test.md", content, "rev1");
      const assetPath = slots[0]?.assetPath ?? "";

      const slot = await metadataStore.getSlotByAssetPath(module.name, assetPath);

      expect(slot).toBeDefined();
      expect(slot?.slotId).toBe("test");
      expect(slot?.assetPath).toBe(assetPath);
    });
  });

  describe("Intent-based deduplication", () => {
    test("should reuse same asset path for identical descriptions", async () => {
      const content1 = `<!-- afs:image id="img1" desc="sunset over ocean" -->`;
      const content2 = `<!-- afs:image id="img2" desc="Sunset Over Ocean" -->`; // Case/whitespace differ

      const slots1 = await scanner.scan(module, "/doc1.md", content1, "rev1");
      const slots2 = await scanner.scan(module, "/doc2.md", content2, "rev1");

      // Same normalized description = same intentKey = same assetPath
      expect(slots1[0]?.assetPath).toBe(slots2[0]?.assetPath);

      // Both slots should point to the same image node
      const allSlots = [
        ...(await metadataStore.listSlots(module.name, "/doc1.md")),
        ...(await metadataStore.listSlots(module.name, "/doc2.md")),
      ];

      expect(allSlots.length).toBe(2);
      expect(allSlots[0]?.assetPath).toBe(allSlots[1]?.assetPath);
    });

    test("should create multiple image nodes for different intents", async () => {
      const content = `
<!-- afs:image id="img1" desc="A red apple" -->
<!-- afs:image id="img2" desc="A green apple" -->
<!-- afs:image id="img3" desc="A yellow banana" -->
`;

      const slots = await scanner.scan(module, "/test.md", content, "rev1");

      const assetPaths = slots.map((s) => s.assetPath);

      // All different descriptions = different asset paths
      expect(new Set(assetPaths).size).toBe(3);

      // All should have corresponding image nodes
      for (const assetPath of assetPaths) {
        const meta = await metadataStore.getSourceMetadata(module.name, assetPath);
        expect(meta?.kind).toBe("image");
      }
    });
  });
});
