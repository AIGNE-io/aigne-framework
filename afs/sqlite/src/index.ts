// Main module export

export { registerBuiltInActions } from "./actions/built-in.js";
// Actions
export { ActionsRegistry } from "./actions/registry.js";
export type {
  ActionContext,
  ActionDefinition,
  ActionHandler,
  ActionResult,
} from "./actions/types.js";
// Configuration
export { type SQLiteAFSConfig, type SQLiteAFSOptions, sqliteAFSConfigSchema } from "./config.js";
// Node builder
export {
  type BuildEntryOptions,
  buildActionsListEntry,
  buildAttributeEntry,
  buildAttributeListEntry,
  buildMetaEntry,
  buildRowEntry,
  buildSchemaEntry,
  buildSearchEntry,
  buildTableEntry,
} from "./node/builder.js";
// Operations
export { CRUDOperations } from "./operations/crud.js";
export {
  buildDelete,
  buildGetLastRowId,
  buildInsert,
  buildSelectAll,
  buildSelectByPK,
  buildUpdate,
} from "./operations/query-builder.js";
export {
  createFTSConfig,
  type FTSConfig,
  FTSSearch,
  type FTSTableConfig,
} from "./operations/search.js";
// Router
export {
  buildPath,
  createPathRouter,
  getVirtualPathType,
  isVirtualPath,
  matchPath,
} from "./router/path-router.js";
export type { RouteAction, RouteData, RouteMatch, RouteParams } from "./router/types.js";
// Schema types and introspector
export { SchemaIntrospector } from "./schema/introspector.js";
export type {
  ColumnInfo,
  ForeignKeyInfo,
  IndexInfo,
  PragmaForeignKeyRow,
  PragmaIndexListRow,
  PragmaTableInfoRow,
  TableSchema,
} from "./schema/types.js";
export { SQLiteAFS } from "./sqlite-afs.js";
