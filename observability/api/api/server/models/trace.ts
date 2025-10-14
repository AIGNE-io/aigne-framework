import { json } from "@aigne/sqlite/type.js";
import { v7 as uuidv7 } from "@aigne/uuid";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
  componentId: text("componentId"),
  action: integer("action"),
  token: integer("token").$defaultFn(() => 0),
  cost: real("cost").$defaultFn(() => 0),
  remark: text("remark"),
});
