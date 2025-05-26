import type { Sequelize } from "sequelize";
import { type MigrateDownOptions, type MigrateUpOptions, SequelizeStorage, Umzug } from "umzug";

import * as init from "./migrations/20250523165801-init.js";

export const migrate = async (
  sequelize: Sequelize,
  {
    type = "up",
    upOptions,
    downOptions,
  }: { type?: "up" | "down"; upOptions?: MigrateUpOptions; downOptions?: MigrateDownOptions } = {},
) => {
  const umzug = new Umzug({
    migrations: [{ ...init, name: "20241224202701-init" }],
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
  });

  if (type === "down") {
    await umzug.down(downOptions);
  } else {
    await umzug.up(upOptions);
  }
};
