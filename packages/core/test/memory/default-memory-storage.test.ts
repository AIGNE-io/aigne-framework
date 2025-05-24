import { expect, test } from "bun:test";
import {} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {} from "@aigne/core";
import { initSequelize } from "@aigne/core/memory/default-memory/default-memory-storage/index.js";
import { migrate } from "@aigne/core/memory/default-memory/default-memory-storage/migrate.js";
import { v7 } from "uuid";

test("DefaultMemoryStorage migrate", async () => {
  const path = join(tmpdir(), `${v7()}.db`);

  const sequelize = initSequelize(path);

  await migrate(sequelize);

  let tables = await sequelize.getQueryInterface().showAllTables();
  expect(tables.length).toBeGreaterThan(1);

  await migrate(sequelize, { type: "down", downOptions: { to: 0 } });

  tables = await sequelize.getQueryInterface().showAllTables();
  expect(tables).toEqual(["SequelizeMeta"]);
});
