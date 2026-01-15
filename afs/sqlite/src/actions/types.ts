import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { TableSchema } from "../schema/types.js";

/**
 * Context provided to action handlers
 */
export interface ActionContext {
  /** Database instance */
  db: LibSQLDatabase;
  /** All table schemas */
  schemas: Map<string, TableSchema>;
  /** Table this action is being executed on */
  table: string;
  /** Primary key of the row (if row-level action) */
  pk?: string;
  /** The row data (if available) */
  row?: Record<string, unknown>;
  /** Reference to the parent module for advanced operations */
  module: {
    refreshSchema(): Promise<void>;
    exportTable(table: string, format: string): Promise<unknown>;
  };
}

/**
 * Action handler function signature
 */
export type ActionHandler = (
  ctx: ActionContext,
  params: Record<string, unknown>,
) => Promise<ActionResult>;

/**
 * Result from an action execution
 */
export interface ActionResult {
  success: boolean;
  data?: unknown;
  message?: string;
}

/**
 * Action definition with metadata
 */
export interface ActionDefinition {
  /** Action name */
  name: string;
  /** Description of what the action does */
  description?: string;
  /** Whether this action is available at table level (vs row level) */
  tableLevel?: boolean;
  /** Whether this action is available at row level */
  rowLevel?: boolean;
  /** Input schema for the action parameters */
  inputSchema?: Record<string, unknown>;
  /** The handler function */
  handler: ActionHandler;
}
