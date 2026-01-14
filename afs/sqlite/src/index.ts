// Main module export
export { SQLiteAFS } from "./sqlite-afs.js";

// Configuration
export { sqliteAFSConfigSchema, type SQLiteAFSConfig, type SQLiteAFSOptions } from "./config.js";

// Schema types and introspector
export { SchemaIntrospector } from "./schema/introspector.js";
export type {
  ColumnInfo,
  ForeignKeyInfo,
  IndexInfo,
  TableSchema,
  PragmaTableInfoRow,
  PragmaForeignKeyRow,
  PragmaIndexListRow,
} from "./schema/types.js";

// Router
export { createPathRouter, matchPath, buildPath, isVirtualPath, getVirtualPathType } from "./router/path-router.js";
export type { RouteAction, RouteData, RouteMatch, RouteParams } from "./router/types.js";

// Operations
export { CRUDOperations } from "./operations/crud.js";
export { FTSSearch, createFTSConfig, type FTSConfig, type FTSTableConfig } from "./operations/search.js";
export {
  buildSelectByPK,
  buildSelectAll,
  buildInsert,
  buildUpdate,
  buildDelete,
  buildGetLastRowId,
} from "./operations/query-builder.js";

// Node builder
export {
  buildRowEntry,
  buildTableEntry,
  buildSchemaEntry,
  buildAttributeEntry,
  buildAttributeListEntry,
  buildMetaEntry,
  buildActionsListEntry,
  buildSearchEntry,
  type BuildEntryOptions,
} from "./node/builder.js";

// Actions
export { ActionsRegistry } from "./actions/registry.js";
export { registerBuiltInActions } from "./actions/built-in.js";
export type { ActionContext, ActionHandler, ActionResult, ActionDefinition } from "./actions/types.js";
