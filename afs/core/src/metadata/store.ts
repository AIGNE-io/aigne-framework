import { and, eq, initDatabase } from "@aigne/sqlite";
import type { View } from "../type.js";
import { normalizeViewKey } from "../view-key.js";
import { migrate } from "./migrate.js";
import {
  depsMetadataTable,
  slotsMetadataTable,
  sourceMetadataTable,
  viewMetadataTable,
} from "./models/index.js";
import type {
  DependencyMetadata,
  MetadataStore,
  SlotMetadata,
  SourceMetadata,
  ViewMetadata,
  ViewState,
} from "./type.js";

export interface SQLiteMetadataStoreOptions {
  url?: string;
}

/**
 * SQLite-based metadata store implementation
 */
/**
 * Parse normalized viewKey back to View object
 * Format: "language=en;format=png" -> {language:"en", format:"png"}
 */
function parseViewKey(viewKey: string): View {
  const view: View = {};
  viewKey.split(";").forEach((pair) => {
    const [key, value] = pair.split("=");
    if (key && value) {
      view[key as keyof View] = value;
    }
  });
  return view;
}

export class SQLiteMetadataStore implements MetadataStore {
  private db: ReturnType<typeof initDatabase>;
  private sourceTable = sourceMetadataTable;
  private viewTable = viewMetadataTable;
  private slotsTable = slotsMetadataTable;
  private depsTable = depsMetadataTable;

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
        kind: this.sourceTable.kind,
        attrsJson: this.sourceTable.attrsJson,
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
      kind: row.kind as "doc" | "image" | "unknown" | undefined,
      attrs: row.attrsJson ? JSON.parse(row.attrsJson) : undefined,
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
        kind: metadata.kind,
        attrsJson: metadata.attrs ? JSON.stringify(metadata.attrs) : null,
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
          kind: metadata.kind,
          attrsJson: metadata.attrs ? JSON.stringify(metadata.attrs) : null,
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
    const viewKey = normalizeViewKey(view);

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
      view: parseViewKey(row.view),
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
    const viewKey = normalizeViewKey(view);
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
      view: parseViewKey(row.view),
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
      const viewKey = normalizeViewKey(view);
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
      view: parseViewKey(row.view),
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
      view: parseViewKey(row.view),
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

  // Slot metadata operations
  async getSlot(_module: string, ownerPath: string, slotId: string): Promise<SlotMetadata | null> {
    const db = await this.db;

    const rows = await db
      .select()
      .from(this.slotsTable)
      .where(and(eq(this.slotsTable.ownerPath, ownerPath), eq(this.slotsTable.slotId, slotId)))
      .limit(1)
      .execute();

    const row = rows[0];
    if (!row) return null;

    return {
      ownerPath: row.ownerPath,
      slotId: row.slotId,
      ownerRevision: row.ownerRevision,
      slotType: row.slotType as "image",
      desc: row.desc,
      intentKey: row.intentKey,
      assetPath: row.assetPath,
      slug: row.slug,
      updatedAt: new Date(row.updatedAt),
    };
  }

  async listSlots(_module: string, ownerPath: string): Promise<SlotMetadata[]> {
    const db = await this.db;

    const rows = await db
      .select()
      .from(this.slotsTable)
      .where(eq(this.slotsTable.ownerPath, ownerPath))
      .execute();

    return rows.map((row) => ({
      ownerPath: row.ownerPath,
      slotId: row.slotId,
      ownerRevision: row.ownerRevision,
      slotType: row.slotType as "image",
      desc: row.desc,
      intentKey: row.intentKey,
      assetPath: row.assetPath,
      slug: row.slug,
      updatedAt: new Date(row.updatedAt),
    }));
  }

  async getSlotByAssetPath(_module: string, assetPath: string): Promise<SlotMetadata | null> {
    const db = await this.db;

    const rows = await db
      .select()
      .from(this.slotsTable)
      .where(eq(this.slotsTable.assetPath, assetPath))
      .limit(1)
      .execute();

    const row = rows[0];
    if (!row) return null;

    return {
      ownerPath: row.ownerPath,
      slotId: row.slotId,
      ownerRevision: row.ownerRevision,
      slotType: row.slotType as "image",
      desc: row.desc,
      intentKey: row.intentKey,
      assetPath: row.assetPath,
      slug: row.slug,
      updatedAt: new Date(row.updatedAt),
    };
  }

  async upsertSlot(_module: string, slot: Omit<SlotMetadata, "updatedAt">): Promise<void> {
    const db = await this.db;
    const now = new Date();

    // Try to update first
    const updated = await db
      .update(this.slotsTable)
      .set({
        ownerRevision: slot.ownerRevision,
        slotType: slot.slotType,
        desc: slot.desc,
        intentKey: slot.intentKey,
        assetPath: slot.assetPath,
        slug: slot.slug,
        updatedAt: now,
      })
      .where(
        and(eq(this.slotsTable.ownerPath, slot.ownerPath), eq(this.slotsTable.slotId, slot.slotId)),
      )
      .returning({ ownerPath: this.slotsTable.ownerPath })
      .execute();

    // If no rows updated, insert new record
    if (!updated.length) {
      await db
        .insert(this.slotsTable)
        .values({
          ownerPath: slot.ownerPath,
          slotId: slot.slotId,
          ownerRevision: slot.ownerRevision,
          slotType: slot.slotType,
          desc: slot.desc,
          intentKey: slot.intentKey,
          assetPath: slot.assetPath,
          slug: slot.slug,
          updatedAt: now,
        })
        .execute();
    }
  }

  async deleteSlots(_module: string, ownerPath: string): Promise<void> {
    const db = await this.db;

    await db.delete(this.slotsTable).where(eq(this.slotsTable.ownerPath, ownerPath)).execute();
  }

  // Dependency metadata operations
  async setDependency(_module: string, dep: Omit<DependencyMetadata, "updatedAt">): Promise<void> {
    const db = await this.db;
    const now = new Date();

    // Try to update first
    const updated = await db
      .update(this.depsTable)
      .set({
        inRevision: dep.inRevision,
        role: dep.role,
        updatedAt: now,
      })
      .where(
        and(
          eq(this.depsTable.outPath, dep.outPath),
          eq(this.depsTable.outViewKey, dep.outViewKey),
          eq(this.depsTable.inPath, dep.inPath),
        ),
      )
      .returning({ outPath: this.depsTable.outPath })
      .execute();

    // If no rows updated, insert new record
    if (!updated.length) {
      await db
        .insert(this.depsTable)
        .values({
          outPath: dep.outPath,
          outViewKey: dep.outViewKey,
          inPath: dep.inPath,
          inRevision: dep.inRevision,
          role: dep.role,
          updatedAt: now,
        })
        .execute();
    }
  }

  async listDependenciesByInput(_module: string, inPath: string): Promise<DependencyMetadata[]> {
    const db = await this.db;

    const rows = await db
      .select()
      .from(this.depsTable)
      .where(eq(this.depsTable.inPath, inPath))
      .execute();

    return rows.map((row) => ({
      outPath: row.outPath,
      outViewKey: row.outViewKey,
      inPath: row.inPath,
      inRevision: row.inRevision,
      role: row.role as DependencyMetadata["role"],
      updatedAt: new Date(row.updatedAt),
    }));
  }

  async listDependenciesByOutput(
    _module: string,
    outPath: string,
    outViewKey: string,
  ): Promise<DependencyMetadata[]> {
    const db = await this.db;

    const rows = await db
      .select()
      .from(this.depsTable)
      .where(and(eq(this.depsTable.outPath, outPath), eq(this.depsTable.outViewKey, outViewKey)))
      .execute();

    return rows.map((row) => ({
      outPath: row.outPath,
      outViewKey: row.outViewKey,
      inPath: row.inPath,
      inRevision: row.inRevision,
      role: row.role as DependencyMetadata["role"],
      updatedAt: new Date(row.updatedAt),
    }));
  }

  async deleteDependenciesByOutput(
    _module: string,
    outPath: string,
    outViewKey?: string,
  ): Promise<void> {
    const db = await this.db;

    if (outViewKey) {
      await db
        .delete(this.depsTable)
        .where(and(eq(this.depsTable.outPath, outPath), eq(this.depsTable.outViewKey, outViewKey)))
        .execute();
    } else {
      await db.delete(this.depsTable).where(eq(this.depsTable.outPath, outPath)).execute();
    }
  }
}
