import type { MetadataStore } from "./metadata/index.js";
import type { AFSModule, ImageSlot } from "./type.js";
import { sha256Hash } from "./utils.js";

/**
 * Normalize description for intentKey computation
 * - Trim whitespace
 * - Convert to lowercase
 * - Collapse multiple spaces to single space
 */
function normalizeDesc(desc: string): string {
  return desc.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Generate human-readable slug from description
 * - Convert to lowercase
 * - Remove non-alphanumeric characters (except spaces and hyphens)
 * - Replace spaces with hyphens
 * - Limit to 50 characters
 */
function generateSlug(desc: string): string {
  return desc
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 50)
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Compute intentKey from description or use explicit key
 */
async function computeIntentKey(desc: string, key?: string): Promise<string> {
  if (key) {
    // Explicit key takes precedence
    return key;
  }

  // Hash normalized description
  const normalized = normalizeDesc(desc);
  return sha256Hash(normalized);
}

/**
 * Slot scanner for detecting image slots in documents
 */
export class SlotScanner {
  // Slot pattern: <!-- afs:image id="..." desc="..." --> or <!-- afs:image id="..." key="..." desc="..." -->
  private static SLOT_PATTERN =
    /<!--\s*afs:image\s+id="([a-z0-9._-]+)"(?:\s+key="([a-z0-9._-]+)")?\s+desc="([^"]+)"\s*-->/g;

  constructor(private metadataStore: MetadataStore) {}

  /**
   * Scan document content for image slots
   * @param module AFSModule instance
   * @param ownerPath Document path
   * @param content Document content (markdown text)
   * @param ownerRevision Source revision of the owner document
   * @returns Array of parsed image slots
   */
  async scan(
    module: AFSModule,
    ownerPath: string,
    content: string,
    ownerRevision: string,
  ): Promise<ImageSlot[]> {
    const slots: ImageSlot[] = [];
    const seenIds = new Set<string>();

    // Reset regex state
    SlotScanner.SLOT_PATTERN.lastIndex = 0;

    let match: RegExpExecArray | null = SlotScanner.SLOT_PATTERN.exec(content);
    while (match !== null) {
      const [_fullMatch, id, key, desc] = match;

      // Validate: captured groups must be present
      if (!id || !desc) {
        continue; // Skip malformed slots
      }

      // Validate: id must be unique within owner
      if (seenIds.has(id)) {
        throw new Error(`Duplicate slot id "${id}" in ${ownerPath}`);
      }
      seenIds.add(id);

      // Compute intentKey and slug
      const intentKey = await computeIntentKey(desc, key);
      const slug = generateSlug(desc);
      const assetPath = `/.afs/images/by-intent/${intentKey}`;

      slots.push({ id, desc, key, intentKey, assetPath });

      // Upsert slot to database
      await this.metadataStore.upsertSlot(module.name, {
        ownerPath,
        slotId: id,
        ownerRevision,
        slotType: "image",
        desc,
        intentKey,
        assetPath,
        slug,
      });

      // Ensure image node exists in source_metadata
      await this.ensureImageNode(module, assetPath, intentKey);

      // Get next match
      match = SlotScanner.SLOT_PATTERN.exec(content);
    }

    return slots;
  }

  /**
   * Ensure image node exists in source_metadata
   * Sets kind="image" and sourceRevision="intent:<intentKey>"
   */
  private async ensureImageNode(
    module: AFSModule,
    assetPath: string,
    intentKey: string,
  ): Promise<void> {
    const existing = await this.metadataStore.getSourceMetadata(module.name, assetPath);

    if (!existing) {
      // Create new source metadata for the image node
      await this.metadataStore.setSourceMetadata(module.name, assetPath, {
        sourceRevision: `intent:${intentKey}`,
        updatedAt: new Date(),
        kind: "image",
        driversHint: ["image-generate"],
      });
    }
  }
}
