import { createHash } from "node:crypto";
import pLimit from "p-limit";
import type { MetadataStore, ViewMetadata } from "./metadata/index.js";
import type { AFSDriver, AFSEntry, AFSModule, AFSReadResult, ReadOptions, View } from "./type.js";

/**
 * View processor for handling view generation and caching
 * V1 implementation: Simplified without job deduplication
 */
export class ViewProcessor {
  constructor(
    private metadataStore: MetadataStore,
    private drivers: AFSDriver[],
  ) {}

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
  computeRevision(entry: AFSEntry): string {
    if (typeof entry.content === "string") {
      const hash = createHash("sha256").update(entry.content).digest("hex").substring(0, 16);
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
  async processView(
    module: AFSModule,
    path: string,
    view: View,
    options?: { context?: any },
  ): Promise<AFSEntry> {
    try {
      // 1. Get or create source metadata
      let sourceMeta = await this.metadataStore.getSourceMetadata(module.name, path);

      if (!sourceMeta) {
        // Read source to create metadata
        const sourceResult = await module.read?.(path);
        if (!sourceResult?.result) {
          throw new Error(`Source file not found: ${path}`);
        }

        const sourceRevision = this.computeRevision(sourceResult.result);
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
      if (!sourceResult?.result) {
        throw new Error(`Source file not found: ${path}`);
      }

      // 4. Find and call driver
      const driver = this.findDriver(view);
      if (!driver) {
        throw new Error(`No driver found for view: ${JSON.stringify(view)}`);
      }

      const result = await driver.process(module, path, view, {
        sourceEntry: sourceResult.result,
        metadata: { derivedFrom: sourceMeta.sourceRevision },
        context: options?.context,
      });

      // 5. Update to ready
      await this.metadataStore.setViewMetadata(module.name, path, view, {
        state: "ready",
        generatedAt: new Date(),
        storagePath: result.result.metadata?.storagePath,
        error: undefined,
      });

      return result.result;
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
    if (!result?.result) {
      throw new Error(`View storage file not found: ${viewMeta.storagePath}`);
    }

    return {
      ...result.result,
      path, // Return logical path, not storage path
      metadata: {
        ...result.result.metadata,
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
    options: ReadOptions | undefined,
  ): Promise<AFSReadResult> {
    // No view, read source directly
    if (!options?.view) {
      return (await module.read?.(path)) || { result: undefined };
    }

    // 1. Query view metadata
    const viewMeta = await this.metadataStore.getViewMetadata(module.name, path, options.view);
    const isStale = await this.isViewStale(module, path, options.view);

    // 2. If view is ready and not stale, return it
    if (viewMeta?.state === "ready" && !isStale) {
      const result = await this.readViewResult(module, path, viewMeta);
      return { result, viewStatus: { fallback: false } };
    }

    // 3. Need to generate view
    const wait = options.wait || "strict"; // Default to strict

    if (wait === "strict") {
      // Wait for generation to complete
      const result = await this.processView(module, path, options.view, {
        context: options.context,
      });
      return { result, viewStatus: { fallback: false } };
    } else {
      // Fallback: trigger background generation, return source
      this.processView(module, path, options.view, { context: options.context }).catch((error) => {
        console.error(`Background view processing failed for ${path}:`, error);
      });

      const sourceResult = await module.read?.(path);
      return {
        result: sourceResult?.result,
        message: `View (${JSON.stringify(options.view)}) is being processed in background`,
        viewStatus: { fallback: true },
      };
    }
  }

  /**
   * Update source metadata after write
   */
  async handleWrite(module: AFSModule, path: string, entry: AFSEntry): Promise<void> {
    const newRevision = this.computeRevision(entry);

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
    }
  }

  /**
   * Clean up metadata after delete
   */
  async handleDelete(module: AFSModule, path: string): Promise<void> {
    await this.metadataStore.deleteViewMetadata(module.name, path);
    await this.metadataStore.deleteSourceMetadata(module.name, path);
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
          this.processView(module, path, view, { context: options?.context }).catch((error) => {
            console.error(`Prefetch failed for ${path}:`, error);
          }),
        ),
      ),
    );
  }
}
