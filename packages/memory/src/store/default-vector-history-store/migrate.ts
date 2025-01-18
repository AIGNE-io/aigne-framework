import type { Sequelize } from "sequelize";
import { SequelizeStorage, Umzug } from "umzug";

import * as init from "./migrations/20250104110401-init";
import * as flatHistoryData from "./migrations/20250107232801-flat-history-data";

export const migrate = async (sequelize: Sequelize) => {
  const umzug = new Umzug({
    migrations: [
      { ...init, name: "20250104110401-init" },
      { ...flatHistoryData, name: "20250107232801-flat-history-data" },
    ],
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
  });

  await umzug.up();
};
