import { json } from "@aigne/sqlite/type.js";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v7 as uuidv7 } from "uuid";

export const Trace = sqliteTable("Trace", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  rootId: text("rootId"),
  parentId: text("parentId"),
  name: text("name").notNull(),
  startTime: integer("startTime").notNull(),
  endTime: integer("endTime").notNull(),
  status: json("status").notNull(), // JSON 字符串
  attributes: json("attributes").notNull(), // JSON 字符串
  //latency: integer("latency"),
  //input: text("input"),
  //output: text("output"),
  //error: text("error"),
  //userId: text("userId"),
  //sessionId: text("sessionId"),
  //metadata: text("metadata"),
  links: json("links"), // JSON 数组
  events: json("events"), // JSON 数组
  userId: text("userId"),
  sessionId: text("sessionId"),
});
