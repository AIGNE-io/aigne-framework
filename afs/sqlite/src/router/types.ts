/**
 * Route action types for SQLite AFS
 */
export type RouteAction =
  | "listTables"
  | "listTable"
  | "readRow"
  | "createRow"
  | "getSchema"
  | "listAttributes"
  | "getAttribute"
  | "getMeta"
  | "listActions"
  | "executeAction";

/**
 * Route data associated with each path pattern
 */
export interface RouteData {
  /** The action to perform for this route */
  action: RouteAction;
}

/**
 * Route match result with params
 */
export interface RouteMatch extends RouteData {
  params: RouteParams;
}

/**
 * Dynamic route parameters extracted from path
 */
export interface RouteParams {
  /** Table name */
  table?: string;
  /** Primary key value */
  pk?: string;
  /** Column name for attribute access */
  column?: string;
  /** Action name for @actions */
  action?: string;
}
