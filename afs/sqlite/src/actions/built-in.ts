import { sql } from "@aigne/sqlite";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { ActionsRegistry } from "./registry.js";
import type { ActionContext, ActionResult } from "./types.js";

/**
 * Executes a raw SQL query and returns all rows
 */
async function execAll<T>(db: LibSQLDatabase, query: string): Promise<T[]> {
  return db.all<T>(sql.raw(query)).execute();
}

/**
 * Executes a raw SQL query (for INSERT, UPDATE, DELETE)
 */
async function execRun(db: LibSQLDatabase, query: string): Promise<void> {
  await db.run(sql.raw(query)).execute();
}

/**
 * Registers built-in actions to the registry
 */
export function registerBuiltInActions(registry: ActionsRegistry): void {
  // Refresh schema action (table level)
  registry.register({
    name: "refresh",
    description: "Refresh the schema cache for this module",
    tableLevel: true,
    rowLevel: false,
    handler: async (ctx: ActionContext): Promise<ActionResult> => {
      await ctx.module.refreshSchema();
      return {
        success: true,
        message: "Schema refreshed successfully",
      };
    },
  });

  // Export table action (table level)
  registry.register({
    name: "export",
    description: "Export table data in specified format (json, csv)",
    tableLevel: true,
    rowLevel: false,
    inputSchema: {
      type: "object",
      properties: {
        format: {
          type: "string",
          enum: ["json", "csv"],
          default: "json",
        },
      },
    },
    handler: async (ctx: ActionContext, params): Promise<ActionResult> => {
      const format = (params.format as string) ?? "json";
      const data = await ctx.module.exportTable(ctx.table, format);
      return {
        success: true,
        data,
      };
    },
  });

  // Count rows action (table level)
  registry.register({
    name: "count",
    description: "Get the total row count for this table",
    tableLevel: true,
    rowLevel: false,
    handler: async (ctx: ActionContext): Promise<ActionResult> => {
      const result = await execAll<{ count: number }>(
        ctx.db,
        `SELECT COUNT(*) as count FROM "${ctx.table}"`
      );
      return {
        success: true,
        data: { count: result[0]?.count ?? 0 },
      };
    },
  });

  // Duplicate row action (row level)
  registry.register({
    name: "duplicate",
    description: "Create a copy of this row",
    tableLevel: false,
    rowLevel: true,
    handler: async (ctx: ActionContext): Promise<ActionResult> => {
      if (!ctx.row) {
        return { success: false, message: "Row data not available" };
      }

      const schema = ctx.schemas.get(ctx.table);
      if (!schema) {
        return { success: false, message: `Table '${ctx.table}' not found` };
      }

      // Create a copy without the primary key
      const pkColumn = schema.primaryKey[0] ?? "rowid";
      const rowCopy = { ...ctx.row };
      delete rowCopy[pkColumn];
      delete rowCopy.rowid;

      // Build insert query
      const columns = Object.keys(rowCopy);
      const values = columns.map((col) => formatValueForSQL(rowCopy[col]));

      await execRun(
        ctx.db,
        `INSERT INTO "${ctx.table}" (${columns.map((c) => `"${c}"`).join(", ")}) VALUES (${values.join(", ")})`
      );

      // Get the new row's ID
      const lastIdResult = await execAll<{ id: number }>(
        ctx.db,
        "SELECT last_insert_rowid() as id"
      );

      return {
        success: true,
        data: { newId: lastIdResult[0]?.id },
        message: "Row duplicated successfully",
      };
    },
  });

  // Validate row action (row level)
  registry.register({
    name: "validate",
    description: "Validate row data against schema constraints",
    tableLevel: false,
    rowLevel: true,
    handler: async (ctx: ActionContext): Promise<ActionResult> => {
      if (!ctx.row) {
        return { success: false, message: "Row data not available" };
      }

      const schema = ctx.schemas.get(ctx.table);
      if (!schema) {
        return { success: false, message: `Table '${ctx.table}' not found` };
      }

      const errors: string[] = [];

      // Check NOT NULL constraints
      for (const col of schema.columns) {
        if (col.notnull && (ctx.row[col.name] === null || ctx.row[col.name] === undefined)) {
          errors.push(`Column '${col.name}' cannot be null`);
        }
      }

      // Check foreign key references
      for (const fk of schema.foreignKeys) {
        const value = ctx.row[fk.from];
        if (value !== null && value !== undefined) {
          const refResult = await execAll<{ count: number }>(
            ctx.db,
            `SELECT COUNT(*) as count FROM "${fk.table}" WHERE "${fk.to}" = '${String(value).replace(/'/g, "''")}'`
          );
          if (refResult[0]?.count === 0) {
            errors.push(
              `Foreign key violation: ${fk.from} references non-existent ${fk.table}.${fk.to}`
            );
          }
        }
      }

      return {
        success: errors.length === 0,
        data: { errors, valid: errors.length === 0 },
        message: errors.length > 0 ? `Validation failed: ${errors.join("; ")}` : "Row is valid",
      };
    },
  });
}

/**
 * Formats a value for SQL insertion
 */
function formatValueForSQL(value: unknown): string {
  if (value === null || value === undefined) {
    return "NULL";
  }
  if (typeof value === "number") {
    return String(value);
  }
  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }
  if (value instanceof Date) {
    return `'${value.toISOString()}'`;
  }
  if (typeof value === "object") {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}
