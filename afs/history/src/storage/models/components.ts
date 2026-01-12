import type { AFSModule } from "@aigne/afs";
import { datetime, json, sqliteTable, text } from "@aigne/sqlite";
import { v7 } from "@aigne/uuid";

export const componentsTableName = (module: AFSModule): string =>
  `Entries_${module.name}_components`;

export const componentsTable = (module: AFSModule) =>
  sqliteTable(componentsTableName(module), {
    // Base fields (same as entries.ts)
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => v7()),
    createdAt: datetime("createdAt")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: datetime("updatedAt")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
    path: text("path").notNull(),
    agentId: text("agentId"),
    userId: text("userId"),
    sessionId: text("sessionId"),
    summary: text("summary"),
    metadata: json<Record<string, unknown>>("metadata"),
    linkTo: text("linkTo"),
    content: json<any>("content"),

    // Component-specific fields
    componentId: text("componentId").notNull(), // Instance identifier (e.g., Table_1736676000000)
    componentName: text("componentName").notNull(),
    props: json<Record<string, any>>("props").notNull(),
    state: json<Record<string, any>>("state").notNull(),
  });
