import pLimit from "p-limit";
import type { MetadataStore, ViewMetadata } from "./metadata/index.js";
import { SlotScanner } from "./slot-scanner.js";
import type {
  AFSDriver,
  AFSEntry,
  AFSModule,
  AFSReadOptions,
  AFSReadResult,
  View,
} from "./type.js";
import { sha256Hash } from "./utils.js";

/**
 * View processor for handling view generation and caching
 * V1 implementation: Simplified without job deduplication
 */
export class ViewProcessor {
  private slotScanner: SlotScanner;

  constructor(
    private metadataStore: MetadataStore,
    private drivers: AFSDriver[],
  ) {
    this.slotScanner = new SlotScanner(metadataStore);
  }

  /**
   * Find a driver that can handle the given view
   */
  findDriver(view: View): AFSDriver | null {
    const capable = this.drivers.filter((d) => d.canHandle(view));

    if (capable.length === 0) {
      return null;
    }

    if (capable.length > 1) {
      throw new Error(
        `Multiple drivers can handle view ${JSON.stringify(view)}: ${capable.map((d) => d.name).join(", ")}`,
      );
    }

    return capable[0] || null;
  }

  /**
   * Compute source revision for an entry
   * - For text content: SHA-256 hash
   * - For binary/other: mtime + size
   */
  async computeRevision(entry: AFSEntry): Promise<string> {
    if (typeof entry.content === "string") {
      const hash = await sha256Hash(entry.content);
      return `hash:sha256:${hash}`;
    }

    const mtime = entry.updatedAt?.getTime() || Date.now();
    const size = entry.metadata?.size || 0;
    return `mtime:${mtime}:size:${size}`;
  }

  /**
   * Check if a view is stale (outdated)
   */
  async isViewStale(module: AFSModule, path: string, view: View): Promise<boolean> {
    const viewMeta = await this.metadataStore.getViewMetadata(module.name, path, view);
    if (!viewMeta) return true; // Missing view is stale

    if (viewMeta.state === "stale" || viewMeta.state === "failed") {
      return true;
    }

    if (viewMeta.state === "generating") {
      return false; // Currently generating, not stale
    }

    // Check if derivedFrom matches current sourceRevision
    const sourceMeta = await this.metadataStore.getSourceMetadata(module.name, path);
    if (!sourceMeta) return true;

    return viewMeta.derivedFrom !== sourceMeta.sourceRevision;
  }

  /**
   * Process a view (generate or regenerate)
   * V1: Direct execution without job deduplication
   */
  async processView(module: AFSModule, path: string, view: View, context: any): Promise<AFSEntry> {
    try {
      // 1. Get or create source metadata
      let sourceMeta = await this.metadataStore.getSourceMetadata(module.name, path);

      if (!sourceMeta) {
        // Read source to create metadata
        const sourceResult = await module.read?.(path);
        if (!sourceResult?.data) {
          throw new Error(`Source file not found: ${path}`);
        }

        const sourceRevision = await this.computeRevision(sourceResult.data);
        await this.metadataStore.setSourceMetadata(module.name, path, {
          sourceRevision,
          updatedAt: new Date(),
          driversHint: this.drivers.map((d) => d.name),
        });

        sourceMeta = await this.metadataStore.getSourceMetadata(module.name, path);
      }

      if (!sourceMeta) {
        throw new Error(`Failed to create source metadata for ${path}`);
      }

      // 2. Mark as generating
      await this.metadataStore.setViewMetadata(module.name, path, view, {
        state: "generating",
        derivedFrom: sourceMeta.sourceRevision,
      });

      // 3. Read source
      const sourceResult = await module.read?.(path);
      if (!sourceResult?.data) {
        throw new Error(`Source file not found: ${path}`);
      }

      // 4. Find and call driver
      const driver = this.findDriver(view);
      if (!driver) {
        throw new Error(`No driver found for view: ${JSON.stringify(view)}`);
      }

      const result = await driver.process(module, path, view, {
        sourceEntry: sourceResult.data,
        metadata: { derivedFrom: sourceMeta.sourceRevision },
        context,
      });

      // 5. Update to ready
      await this.metadataStore.setViewMetadata(module.name, path, view, {
        state: "ready",
        generatedAt: new Date(),
        storagePath: result.data.metadata?.storagePath,
        error: undefined,
      });

      return result.data;
    } catch (error: any) {
      // 6. Mark as failed
      await this.metadataStore.setViewMetadata(module.name, path, view, {
        state: "failed",
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Read view result from storage
   */
  async readViewResult(module: AFSModule, path: string, viewMeta: ViewMetadata): Promise<AFSEntry> {
    if (!viewMeta.storagePath) {
      throw new Error(`View metadata missing storagePath for ${path}`);
    }

    const result = await module.read?.(viewMeta.storagePath);
    if (!result?.data) {
      throw new Error(`View storage file not found: ${viewMeta.storagePath}`);
    }

    return {
      ...result.data,
      path, // Return logical path, not storage path
      metadata: {
        ...result.data.metadata,
        view: viewMeta.view,
      },
    };
  }

  /**
   * Handle read operation with view support
   */
  async handleRead(
    module: AFSModule,
    path: string,
    options: AFSReadOptions | undefined,
    context: any,
  ): Promise<AFSReadResult> {
    // No view, read source directly
    if (!options?.view) {
      return (await module.read?.(path)) || { data: undefined };
    }

    // 1. Query view metadata
    const viewMeta = await this.metadataStore.getViewMetadata(module.name, path, options.view);
    const isStale = await this.isViewStale(module, path, options.view);

    // 2. If view is ready and not stale, return it
    if (viewMeta?.state === "ready" && !isStale) {
      const data = await this.readViewResult(module, path, viewMeta);
      return { data };
    }

    // 3. Need to generate view
    const wait = options.wait || "strict"; // Default to strict

    if (wait === "strict") {
      // Wait for generation to complete
      const data = await this.processView(module, path, options.view, context);
      return { data };
    } else {
      // Fallback: trigger background generation, return source
      this.processView(module, path, options.view, context).catch((error) => {
        console.error(`Background view processing failed for ${path}:`, error);
      });

      const sourceResult = await module.read?.(path);
      return {
        data: sourceResult?.data,
        message: `View (${JSON.stringify(options.view)}) is being processed in background`,
        viewStatus: { fallback: true },
      };
    }
  }

  /**
   * Update source metadata after write
   */
  async handleWrite(module: AFSModule, path: string, entry: AFSEntry): Promise<void> {
    const newRevision = await this.computeRevision(entry);

    // Get old metadata
    const oldMeta = await this.metadataStore.getSourceMetadata(module.name, path);

    // Update source metadata
    await this.metadataStore.setSourceMetadata(module.name, path, {
      sourceRevision: newRevision,
      updatedAt: new Date(),
      driversHint: this.drivers.map((d) => d.name),
    });

    // If revision changed, mark all views as stale
    if (!oldMeta || oldMeta.sourceRevision !== newRevision) {
      await this.metadataStore.markViewsAsStale(module.name, path);

      // Mark dependent views as stale (for images that depend on this document)
      await this.markDependentViewsStale(module.name, path);
    }

    // Scan for image slots if content is text
    if (typeof entry.content === "string") {
      await this.slotScanner.scan(module, path, entry.content, newRevision);
    }
  }

  /**
   * Mark views that depend on the given input path as stale
   * Used for dependency propagation (e.g., images depend on owner document context)
   */
  private async markDependentViewsStale(module: string, inPath: string): Promise<void> {
    // Query all dependencies where this path is an input
    const deps = await this.metadataStore.listDependenciesByInput(module, inPath);

    // Mark each dependent view as stale
    for (const dep of deps) {
      // Parse viewKey back to View object
      const view: View = {};
      dep.outViewKey.split(";").forEach((pair) => {
        const [key, value] = pair.split("=");
        if (key && value) {
          view[key as keyof View] = value;
        }
      });

      await this.metadataStore.setViewMetadata(module, dep.outPath, view, {
        state: "stale",
      });
    }
  }

  /**
   * Clean up metadata after delete
   */
  async handleDelete(module: AFSModule, path: string): Promise<void> {
    await this.metadataStore.deleteViewMetadata(module.name, path);
    await this.metadataStore.deleteSourceMetadata(module.name, path);
    await this.metadataStore.deleteSlots(module.name, path);
  }

  /**
   * Prefetch views for batch generation
   */
  async prefetch(
    module: AFSModule,
    paths: string[],
    view: View,
    options?: { concurrency?: number; context?: any },
  ): Promise<void> {
    const tasksToGenerate: string[] = [];

    // Check which paths need generation
    for (const path of paths) {
      const isStale = await this.isViewStale(module, path, view);
      const viewMeta = await this.metadataStore.getViewMetadata(module.name, path, view);

      if (isStale || !viewMeta || viewMeta.state !== "ready") {
        tasksToGenerate.push(path);
      }
    }

    // Generate with concurrency limit using p-limit
    const concurrency = options?.concurrency || 5;
    const limit = pLimit(concurrency);

    await Promise.all(
      tasksToGenerate.map((path) =>
        limit(() =>
          this.processView(module, path, view, options?.context).catch((error) => {
            console.error(`Prefetch failed for ${path}:`, error);
          }),
        ),
      ),
    );
  }
}
