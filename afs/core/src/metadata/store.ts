import { and, eq, initDatabase } from "@aigne/sqlite";
import type { View } from "../type.js";
import { migrate } from "./migrate.js";
import { sourceMetadataTable, viewMetadataTable } from "./models/index.js";
import type { MetadataStore, SourceMetadata, ViewMetadata, ViewState } from "./type.js";

export interface SQLiteMetadataStoreOptions {
  url?: string;
}

/**
 * SQLite-based metadata store implementation
 */
export class SQLiteMetadataStore implements MetadataStore {
  private db: ReturnType<typeof initDatabase>;
  private sourceTable = sourceMetadataTable;
  private viewTable = viewMetadataTable;

  constructor(options?: SQLiteMetadataStoreOptions) {
    this.db = initDatabase({ url: options?.url }).then(async (db) => {
      // Run migrations
      await migrate(Promise.resolve(db));
      return db;
    });
  }

  // Source metadata operations
  async getSourceMetadata(module: string, path: string): Promise<SourceMetadata | null> {
    const db = await this.db;
    const rows = await db
      .select({
        module: this.sourceTable.module,
        path: this.sourceTable.path,
        sourceRevision: this.sourceTable.sourceRevision,
        updatedAt: this.sourceTable.updatedAt,
        driversHint: this.sourceTable.driversHint,
      })
      .from(this.sourceTable)
      .where(and(eq(this.sourceTable.module, module), eq(this.sourceTable.path, path)))
      .limit(1)
      .execute();

    const row = rows[0];
    if (!row) return null;

    return {
      module: row.module,
      path: row.path,
      sourceRevision: row.sourceRevision,
      updatedAt: row.updatedAt,
      driversHint: row.driversHint ? JSON.parse(row.driversHint) : undefined,
    };
  }

  async setSourceMetadata(
    module: string,
    path: string,
    metadata: Omit<SourceMetadata, "module" | "path">,
  ): Promise<void> {
    const db = await this.db;
    const now = new Date();

    // Try to update first
    const updated = await db
      .update(this.sourceTable)
      .set({
        sourceRevision: metadata.sourceRevision,
        updatedAt: metadata.updatedAt,
        driversHint: metadata.driversHint ? JSON.stringify(metadata.driversHint) : null,
      })
      .where(and(eq(this.sourceTable.module, module), eq(this.sourceTable.path, path)))
      .returning({
        id: this.sourceTable.id,
      })
      .execute();

    // If no rows updated, insert new record
    if (!updated.length) {
      await db
        .insert(this.sourceTable)
        .values({
          module,
          path,
          sourceRevision: metadata.sourceRevision,
          updatedAt: metadata.updatedAt,
          driversHint: metadata.driversHint ? JSON.stringify(metadata.driversHint) : null,
          createdAt: now,
        })
        .execute();
    }
  }

  async deleteSourceMetadata(module: string, path: string): Promise<void> {
    const db = await this.db;
    await db
      .delete(this.sourceTable)
      .where(and(eq(this.sourceTable.module, module), eq(this.sourceTable.path, path)))
      .execute();
  }

  // View metadata operations
  async getViewMetadata(module: string, path: string, view: View): Promise<ViewMetadata | null> {
    const db = await this.db;
    const viewKey = JSON.stringify(view);

    const rows = await db
      .select({
        module: this.viewTable.module,
        path: this.viewTable.path,
        view: this.viewTable.view,
        state: this.viewTable.state,
        derivedFrom: this.viewTable.derivedFrom,
        generatedAt: this.viewTable.generatedAt,
        error: this.viewTable.error,
        storagePath: this.viewTable.storagePath,
      })
      .from(this.viewTable)
      .where(
        and(
          eq(this.viewTable.module, module),
          eq(this.viewTable.path, path),
          eq(this.viewTable.view, viewKey),
        ),
      )
      .limit(1)
      .execute();

    const row = rows[0];
    if (!row) return null;

    return {
      module: row.module,
      path: row.path,
      view: JSON.parse(row.view),
      state: row.state as ViewState,
      derivedFrom: row.derivedFrom,
      generatedAt: row.generatedAt || undefined,
      error: row.error || undefined,
      storagePath: row.storagePath || undefined,
    };
  }

  async setViewMetadata(
    module: string,
    path: string,
    view: View,
    metadata: Partial<ViewMetadata>,
  ): Promise<void> {
    const db = await this.db;
    const viewKey = JSON.stringify(view);
    const now = new Date();

    // Get existing record
    const existing = await this.getViewMetadata(module, path, view);

    const merged = {
      state: metadata.state || existing?.state || "stale",
      derivedFrom: metadata.derivedFrom || existing?.derivedFrom || "",
      generatedAt: metadata.generatedAt || existing?.generatedAt || null,
      error: metadata.error !== undefined ? metadata.error : existing?.error || null,
      storagePath: metadata.storagePath || existing?.storagePath || null,
    };

    // Try to update first
    const updated = await db
      .update(this.viewTable)
      .set({
        state: merged.state,
        derivedFrom: merged.derivedFrom,
        generatedAt: merged.generatedAt,
        error: merged.error,
        storagePath: merged.storagePath,
        updatedAt: now,
      })
      .where(
        and(
          eq(this.viewTable.module, module),
          eq(this.viewTable.path, path),
          eq(this.viewTable.view, viewKey),
        ),
      )
      .returning({
        id: this.viewTable.id,
      })
      .execute();

    // If no rows updated, insert new record
    if (!updated.length) {
      await db
        .insert(this.viewTable)
        .values({
          module,
          path,
          view: viewKey,
          state: merged.state,
          derivedFrom: merged.derivedFrom,
          generatedAt: merged.generatedAt,
          error: merged.error,
          storagePath: merged.storagePath,
          createdAt: now,
          updatedAt: now,
        })
        .execute();
    }
  }

  async listViewMetadata(module: string, path: string): Promise<ViewMetadata[]> {
    const db = await this.db;

    const rows = await db
      .select({
        module: this.viewTable.module,
        path: this.viewTable.path,
        view: this.viewTable.view,
        state: this.viewTable.state,
        derivedFrom: this.viewTable.derivedFrom,
        generatedAt: this.viewTable.generatedAt,
        error: this.viewTable.error,
        storagePath: this.viewTable.storagePath,
      })
      .from(this.viewTable)
      .where(and(eq(this.viewTable.module, module), eq(this.viewTable.path, path)))
      .execute();

    return rows.map((row) => ({
      module: row.module,
      path: row.path,
      view: JSON.parse(row.view),
      state: row.state as ViewState,
      derivedFrom: row.derivedFrom,
      generatedAt: row.generatedAt || undefined,
      error: row.error || undefined,
      storagePath: row.storagePath || undefined,
    }));
  }

  async deleteViewMetadata(module: string, path: string, view?: View): Promise<void> {
    const db = await this.db;

    if (view) {
      const viewKey = JSON.stringify(view);
      await db
        .delete(this.viewTable)
        .where(
          and(
            eq(this.viewTable.module, module),
            eq(this.viewTable.path, path),
            eq(this.viewTable.view, viewKey),
          ),
        )
        .execute();
    } else {
      await db
        .delete(this.viewTable)
        .where(and(eq(this.viewTable.module, module), eq(this.viewTable.path, path)))
        .execute();
    }
  }

  // Batch operations
  async markViewsAsStale(module: string, path: string): Promise<void> {
    const db = await this.db;
    const now = new Date();

    await db
      .update(this.viewTable)
      .set({
        state: "stale",
        updatedAt: now,
      })
      .where(and(eq(this.viewTable.module, module), eq(this.viewTable.path, path)))
      .execute();
  }

  async listStaleViews(): Promise<ViewMetadata[]> {
    const db = await this.db;

    const rows = await db
      .select({
        module: this.viewTable.module,
        path: this.viewTable.path,
        view: this.viewTable.view,
        state: this.viewTable.state,
        derivedFrom: this.viewTable.derivedFrom,
        generatedAt: this.viewTable.generatedAt,
        error: this.viewTable.error,
        storagePath: this.viewTable.storagePath,
      })
      .from(this.viewTable)
      .where(eq(this.viewTable.state, "stale"))
      .execute();

    return rows.map((row) => ({
      module: row.module,
      path: row.path,
      view: JSON.parse(row.view),
      state: row.state as ViewState,
      derivedFrom: row.derivedFrom,
      generatedAt: row.generatedAt || undefined,
      error: row.error || undefined,
      storagePath: row.storagePath || undefined,
    }));
  }

  async listGeneratingViews(): Promise<ViewMetadata[]> {
    const db = await this.db;

    const rows = await db
      .select({
        module: this.viewTable.module,
        path: this.viewTable.path,
        view: this.viewTable.view,
        state: this.viewTable.state,
        derivedFrom: this.viewTable.derivedFrom,
        generatedAt: this.viewTable.generatedAt,
        error: this.viewTable.error,
        storagePath: this.viewTable.storagePath,
      })
      .from(this.viewTable)
      .where(eq(this.viewTable.state, "generating"))
      .execute();

    return rows.map((row) => ({
      module: row.module,
      path: row.path,
      view: JSON.parse(row.view),
      state: row.state as ViewState,
      derivedFrom: row.derivedFrom,
      generatedAt: row.generatedAt || undefined,
      error: row.error || undefined,
      storagePath: row.storagePath || undefined,
    }));
  }

  // Cleanup operations
  async cleanupOrphanedViewMetadata(): Promise<void> {
    const db = await this.db;

    // Get all distinct (module, path) pairs from view_metadata
    const rows = await db
      .selectDistinct({ module: this.viewTable.module, path: this.viewTable.path })
      .from(this.viewTable)
      .execute();

    for (const { module, path } of rows) {
      const sourceMeta = await this.getSourceMetadata(module, path);
      if (!sourceMeta) {
        // Source doesn't exist, delete all view metadata for this module + path
        await this.deleteViewMetadata(module, path);
      }
    }
  }

  async cleanupFailedViews(_olderThan?: Date): Promise<void> {
    const db = await this.db;
    // Note: drizzle doesn't have a direct < operator for dates
    // For now, we delete all failed views regardless of age

    await db.delete(this.viewTable).where(eq(this.viewTable.state, "failed")).execute();
  }
}
